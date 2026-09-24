import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { FilledChevronIconForQuranGoal } from "@/assets/icons/FilledChevronIconForQuranGoal";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { useTranslation } from "react-i18next";
import {
  formatJuzVerseLabel,
  getJuzVerseCountFromMap,
} from "../quranJuzVerseMap";

type Props = {
  juz: number;
  startAyat: number;
  endAyat: number;
  /** Lowest ayah the start thumb may select (default 1). */
  minStartAyat?: number;
  /**
   * When false, both thumbs are movable. Default (undefined/true): start is
   * locked at minStartAyat and only the end thumb moves.
   */
  freezeStartHandle?: boolean;
  verseCount?: number;
  formatVerseLabel?: (ayat: number) => string;
  onChangeStartAyat: (value: number) => void;
  onChangeEndAyat: (value: number) => void;
  styles: Record<string, object>;
  /**
   * `surah` — roomier chip padding/gap (memorisation by Surah).
   * `default` — tight morning chips (completion / juz / hizb).
   */
  chipVariant?: "surah" | "default";
};

type ActiveHandle = "start" | "end" | null;

const THUMB_SIZE = 22;
const THUMB_HIT_SIZE = 44;
const THUMB_RADIUS = THUMB_SIZE / 2;
const THUMB_HIT_RADIUS = THUMB_HIT_SIZE / 2;
/** Keep thumb circles from stacking when ayah values map close together. */
const MIN_THUMB_CENTER_GAP = THUMB_SIZE + 4;
/**
 * Inset the track from the card edges so the slider line is shorter than
 * the full-bleed chip row (chips can still touch the green border).
 */
const TRACK_HORIZONTAL_INSET = 20;
const TRACK_HEIGHT = 6;
/** Figma: white vertical tick at ayah 1 / track start. */
const START_BAR_WIDTH = 2;
const START_BAR_HEIGHT = 16;
const LABEL_LINE_HEIGHT = 11;
const CARET_HALF = 4;
const THUMB_CHEVRON_SIZE = 10;

/** Completion / Juz / Hizb — tight morning chips. */
const DEFAULT_CHIP = {
  paddingH: 4,
  paddingV: 2,
  toTrackGap: 6,
  labelGap: 4,
} as const;

/** Memorisation by Surah — more air between chips and above thumbs. */
const SURAH_CHIP = {
  paddingH: 8,
  paddingV: 4,
  toTrackGap: 12,
  labelGap: 8,
} as const;

function getChipMetrics(variant: "surah" | "default") {
  const chip = variant === "surah" ? SURAH_CHIP : DEFAULT_CHIP;
  const labelRowHeight = LABEL_LINE_HEIGHT + chip.paddingV * 2;
  const trackCenterY = labelRowHeight + chip.toTrackGap + THUMB_RADIUS;
  return {
    ...chip,
    labelRowHeight,
    trackCenterY,
    sliderHeight: trackCenterY + THUMB_HIT_RADIUS,
    labelTop: 0,
    thumbHitTop: trackCenterY - THUMB_HIT_RADIUS,
    trackTop: trackCenterY - TRACK_HEIGHT / 2,
  };
}

/** Fallback estimate until onLayout measures the real chip width. */
function estimateLabelWidth(text: string, paddingH: number): number {
  return Math.max(Math.ceil(text.length * 5.4) + paddingH * 2, 28);
}

function getLabelLeft(
  handleX: number,
  containerWidth: number,
  labelWidth: number,
): number {
  if (labelWidth <= 0 || containerWidth <= 0) return 0;
  const handleCenter = TRACK_HORIZONTAL_INSET + handleX;
  // Prefer centering on the thumb; clamp so the chip stays on-track.
  return Math.max(
    0,
    Math.min(handleCenter - labelWidth / 2, containerWidth - labelWidth),
  );
}

/** Keep the caret tip centered on the thumb even when the pill is edge-clamped. */
function getCaretLeft(
  handleX: number,
  labelLeft: number,
  labelWidth: number,
): number {
  const handleCenter = TRACK_HORIZONTAL_INSET + handleX;
  const ideal = handleCenter - labelLeft - CARET_HALF;
  const min = 2;
  const max = Math.max(min, labelWidth - CARET_HALF * 2 - 2);
  return Math.max(min, Math.min(ideal, max));
}

/**
 * Keep thumb circles from overlapping by pushing the *end* thumb forward only.
 * The start thumb stays fixed so it never slides backward to “make room”.
 */
function separateThumbCenters(
  startX: number,
  endX: number,
  trackWidth: number,
): { renderStartX: number; renderEndX: number } {
  if (endX - startX >= MIN_THUMB_CENTER_GAP) {
    return { renderStartX: startX, renderEndX: endX };
  }

  return {
    renderStartX: startX,
    renderEndX: Math.min(trackWidth, startX + MIN_THUMB_CENTER_GAP),
  };
}

/**
 * Keep ayah chips from covering each other without inventing extra grey width.
 * Only shifts `left` — widths stay content-sized.
 */
function separateLabelLefts(
  startLeft: number,
  startWidth: number,
  endLeft: number,
  endWidth: number,
  containerWidth: number,
  labelGap: number,
): { startLabelLeft: number; endLabelLeft: number } {
  if (containerWidth <= 0 || startWidth <= 0 || endWidth <= 0) {
    return { startLabelLeft: startLeft, endLabelLeft: endLeft };
  }

  let nextStart = Math.max(0, Math.min(startLeft, containerWidth - startWidth));
  let nextEnd = Math.max(0, Math.min(endLeft, containerWidth - endWidth));

  if (nextEnd >= nextStart + startWidth + labelGap) {
    return { startLabelLeft: nextStart, endLabelLeft: nextEnd };
  }

  // Push end just after start.
  nextEnd = nextStart + startWidth + labelGap;
  if (nextEnd + endWidth <= containerWidth) {
    return { startLabelLeft: nextStart, endLabelLeft: nextEnd };
  }

  // Pin end to the right edge and pull start left if needed.
  nextEnd = containerWidth - endWidth;
  nextStart = Math.max(0, nextEnd - labelGap - startWidth);
  return { startLabelLeft: nextStart, endLabelLeft: nextEnd };
}

export function QuranAyatRangeSlider({
  juz,
  startAyat,
  endAyat,
  minStartAyat = 1,
  freezeStartHandle,
  verseCount,
  formatVerseLabel,
  onChangeStartAyat,
  onChangeEndAyat,
  chipVariant = "default",
}: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const chip = useMemo(() => getChipMetrics(chipVariant), [chipVariant]);
  const isMounted = useRef(true);
  const dragOriginX = useRef(0);
  const parkedBoundaryRef = useRef<number | null>(null);
  const [width, setWidth] = useState(0);
  const [activeHandle, setActiveHandle] = useState<ActiveHandle>(null);
  const [measuredStartLabelW, setMeasuredStartLabelW] = useState(0);
  const [measuredEndLabelW, setMeasuredEndLabelW] = useState(0);

  const maxAyat = Math.max(verseCount ?? getJuzVerseCountFromMap(juz), 1);
  const safeMinStart = Math.min(Math.max(Math.round(minStartAyat), 1), maxAyat);
  // Start thumb is always fixed at the progress boundary; only the end moves.
  // Callers may pass freezeStartHandle={false} only for rare dual-thumb editing.
  const isStartFrozen = freezeStartHandle !== false;
  const safeStart = isStartFrozen
    ? safeMinStart
    : Math.min(Math.max(startAyat, safeMinStart), maxAyat);
  const safeEnd = Math.min(Math.max(endAyat, safeStart), maxAyat);

  // Lock start at the progress boundary (cannot drag backward into logged ayahs).
  useEffect(() => {
    if (!isStartFrozen) return;
    if (startAyat !== safeMinStart) {
      onChangeStartAyat(safeMinStart);
    }
  }, [isStartFrozen, onChangeStartAyat, safeMinStart, startAyat]);

  // Continue mode: park end at max once per boundary so the user slides it back.
  useEffect(() => {
    if (!isStartFrozen || safeMinStart <= 1) {
      parkedBoundaryRef.current = null;
      return;
    }
    if (parkedBoundaryRef.current === safeMinStart) return;
    parkedBoundaryRef.current = safeMinStart;
    onChangeEndAyat(maxAyat);
  }, [isStartFrozen, maxAyat, onChangeEndAyat, safeMinStart]);

  const trackWidth = Math.max(width - TRACK_HORIZONTAL_INSET * 2, 1);

  /**
   * Full surah track (1 → maxAyat). minStartAyat only locks the start thumb —
   * it must not compress the scale, or both thumbs stack on the left when
   * only a few ayahs remain (e.g. 5–7 of 7).
   */
  const valueToX = useCallback(
    (value: number) => {
      if (maxAyat <= 1) return 0;
      const clamped = Math.min(Math.max(value, 1), maxAyat);
      return ((clamped - 1) / (maxAyat - 1)) * trackWidth;
    },
    [maxAyat, trackWidth],
  );

  const xToValue = useCallback(
    (x: number) => {
      if (maxAyat <= 1) return 1;
      const percent = Math.max(0, Math.min(x / trackWidth, 1));
      return Math.round(1 + percent * (maxAyat - 1));
    },
    [maxAyat, trackWidth],
  );

  const startX = valueToX(safeStart);
  const endX = valueToX(safeEnd);
  /** End of already-logged range (previous session) — same scale as thumbs. */
  const previousBoundaryX = valueToX(safeMinStart);
  const { renderStartX, renderEndX } = separateThumbCenters(
    startX,
    endX,
    trackWidth,
  );

  // Keep drag math on refs so pan gestures stay stable (no recreate each frame).
  const startXRef = useRef(startX);
  const endXRef = useRef(endX);
  const safeStartRef = useRef(safeStart);
  const safeEndRef = useRef(safeEnd);
  const safeMinStartRef = useRef(safeMinStart);
  const maxAyatRef = useRef(maxAyat);
  const trackWidthRef = useRef(trackWidth);
  const xToValueRef = useRef(xToValue);
  const onChangeStartRef = useRef(onChangeStartAyat);
  const onChangeEndRef = useRef(onChangeEndAyat);

  startXRef.current = startX;
  endXRef.current = endX;
  safeStartRef.current = safeStart;
  safeEndRef.current = safeEnd;
  safeMinStartRef.current = safeMinStart;
  maxAyatRef.current = maxAyat;
  trackWidthRef.current = trackWidth;
  xToValueRef.current = xToValue;
  onChangeStartRef.current = onChangeStartAyat;
  onChangeEndRef.current = onChangeEndAyat;

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const startHitLeft = TRACK_HORIZONTAL_INSET + renderStartX - THUMB_HIT_RADIUS;
  const endHitLeft = TRACK_HORIZONTAL_INSET + renderEndX - THUMB_HIT_RADIUS;

  const completedCount = safeEnd - safeStart + 1;
  const percentCompleted =
    maxAyat > 0 ? Math.round((completedCount / maxAyat) * 100) : 0;

  const startLabel = useMemo(
    () =>
      formatVerseLabel
        ? formatVerseLabel(safeStart)
        : formatJuzVerseLabel(juz, safeStart),
    [formatVerseLabel, juz, safeStart],
  );
  const endLabel = useMemo(
    () =>
      formatVerseLabel
        ? formatVerseLabel(safeEnd)
        : formatJuzVerseLabel(juz, safeEnd),
    [formatVerseLabel, juz, safeEnd],
  );

  const startLabelWidth =
    measuredStartLabelW > 0
      ? measuredStartLabelW
      : estimateLabelWidth(startLabel, chip.paddingH);
  const endLabelWidth =
    measuredEndLabelW > 0
      ? measuredEndLabelW
      : estimateLabelWidth(endLabel, chip.paddingH);
  const rawStartLabelLeft = getLabelLeft(
    renderStartX,
    width,
    startLabelWidth,
  );
  const rawEndLabelLeft = getLabelLeft(renderEndX, width, endLabelWidth);
  const { startLabelLeft, endLabelLeft } = separateLabelLefts(
    rawStartLabelLeft,
    startLabelWidth,
    rawEndLabelLeft,
    endLabelWidth,
    width,
    chip.labelGap,
  );
  const startCaretLeft = getCaretLeft(
    renderStartX,
    startLabelLeft,
    startLabelWidth,
  );
  const endCaretLeft = getCaretLeft(renderEndX, endLabelLeft, endLabelWidth);

  // Reset measured widths when the verse text changes so chips re-hug content.
  useEffect(() => {
    setMeasuredStartLabelW(0);
  }, [startLabel]);
  useEffect(() => {
    setMeasuredEndLabelW(0);
  }, [endLabel]);

  const onLayout = (event: LayoutChangeEvent) => {
    const layoutWidth = event.nativeEvent.layout.width;
    if (layoutWidth > 0 && isMounted.current) {
      setWidth(layoutWidth);
    }
  };

  const onStartLabelLayout = (event: LayoutChangeEvent) => {
    const w = Math.ceil(event.nativeEvent.layout.width);
    if (w > 0 && w !== measuredStartLabelW && isMounted.current) {
      setMeasuredStartLabelW(w);
    }
  };

  const onEndLabelLayout = (event: LayoutChangeEvent) => {
    const w = Math.ceil(event.nativeEvent.layout.width);
    if (w > 0 && w !== measuredEndLabelW && isMounted.current) {
      setMeasuredEndLabelW(w);
    }
  };

  const startPan = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        // Claim horizontal pans quickly so parent carousels don't steal them.
        .activeOffsetX([-1, 1])
        .failOffsetY([-16, 16])
        .shouldCancelWhenOutside(false)
        .onBegin(() => {
          setActiveHandle("start");
        })
        .onStart(() => {
          dragOriginX.current = startXRef.current;
        })
        .onUpdate((event) => {
          const maxX = trackWidthRef.current;
          const nextX = Math.max(
            0,
            Math.min(dragOriginX.current + event.translationX, maxX),
          );
          const nextValue = Math.min(
            Math.max(xToValueRef.current(nextX), safeMinStartRef.current),
            safeEndRef.current,
          );
          if (nextValue !== safeStartRef.current) {
            onChangeStartRef.current(nextValue);
          }
        })
        .onFinalize(() => {
          setActiveHandle((current) => (current === "start" ? null : current));
        }),
    [],
  );

  const endPan = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .activeOffsetX([-1, 1])
        .failOffsetY([-16, 16])
        .shouldCancelWhenOutside(false)
        .onBegin(() => {
          setActiveHandle("end");
        })
        .onStart(() => {
          dragOriginX.current = endXRef.current;
        })
        .onUpdate((event) => {
          const maxX = trackWidthRef.current;
          const nextX = Math.max(
            0,
            Math.min(dragOriginX.current + event.translationX, maxX),
          );
          const nextValue = Math.min(
            Math.max(xToValueRef.current(nextX), safeStartRef.current),
            maxAyatRef.current,
          );
          if (nextValue !== safeEndRef.current) {
            onChangeEndRef.current(nextValue);
          }
        })
        .onFinalize(() => {
          setActiveHandle((current) => (current === "end" ? null : current));
        }),
    [],
  );

  return (
    <View style={localStyles.root} onLayout={onLayout} collapsable={false}>
      <View
        style={[localStyles.sliderArea, { height: chip.sliderHeight }]}
        collapsable={false}
      >
        {/* Content-sized chips — hug verse text and stay locked to each thumb */}
        <View
          pointerEvents="none"
          onLayout={onStartLabelLayout}
          style={[
            localStyles.labelPill,
            {
              left: startLabelLeft,
              top: chip.labelTop,
              paddingHorizontal: chip.paddingH,
              paddingVertical: chip.paddingV,
              zIndex: activeHandle === "start" ? 40 : 35,
            },
          ]}
        >
          <Text style={localStyles.labelText} numberOfLines={1}>
            {startLabel}
          </Text>
          <View style={[localStyles.labelCaret, { left: startCaretLeft }]} />
        </View>

        <View
          pointerEvents="none"
          onLayout={onEndLabelLayout}
          style={[
            localStyles.labelPill,
            {
              left: endLabelLeft,
              top: chip.labelTop,
              paddingHorizontal: chip.paddingH,
              paddingVertical: chip.paddingV,
              zIndex: activeHandle === "end" ? 40 : 35,
            },
          ]}
        >
          <Text style={localStyles.labelText} numberOfLines={1}>
            {endLabel}
          </Text>
          <View style={[localStyles.labelCaret, { left: endCaretLeft }]} />
        </View>

        <View
          style={[
            localStyles.track,
            {
              left: TRACK_HORIZONTAL_INSET,
              right: TRACK_HORIZONTAL_INSET,
              top: chip.trackTop,
              zIndex: 1,
            },
          ]}
          pointerEvents="none"
        >
          {safeMinStart > 1 ? (
            <View
              style={[
                localStyles.trackLocked,
                {
                  left: 0,
                  // Wash fills previous logging range up to the boundary tick.
                  width: Math.max(previousBoundaryX, 0),
                },
              ]}
            />
          ) : null}
          <View
            style={[
              localStyles.trackActive,
              {
                left: startX,
                width: Math.max(endX - startX, 0),
              },
            ]}
          />
        </View>

        {/* Figma: white vertical bar at far-left track start */}
        <View
          pointerEvents="none"
          style={[
            localStyles.startBar,
            {
              left: TRACK_HORIZONTAL_INSET,
              top: chip.trackCenterY - START_BAR_HEIGHT / 2,
              zIndex: 2,
            },
          ]}
        />

        {/* Figma: 2nd tick — end of previous logging range (before start thumb) */}
        {safeMinStart > 1 ? (
          <View
            pointerEvents="none"
            style={[
              localStyles.startBar,
              {
                left: Math.max(
                  TRACK_HORIZONTAL_INSET + START_BAR_WIDTH + 2,
                  TRACK_HORIZONTAL_INSET +
                    previousBoundaryX -
                    THUMB_RADIUS,
                ),
                top: chip.trackCenterY - START_BAR_HEIGHT / 2,
                zIndex: 2,
              },
            ]}
          />
        ) : null}

        {isStartFrozen ? (
          <View
            pointerEvents="none"
            collapsable={false}
            style={[
              localStyles.thumbHit,
              {
                left: startHitLeft,
                top: chip.thumbHitTop,
                zIndex: 30,
                elevation: 12,
              },
            ]}
          >
            {/* Locked start — fixed at minStart; only end thumb moves */}
            <View style={[localStyles.thumb, localStyles.thumbLocked]}>
              <View style={localStyles.thumbChevron}>
                <FilledChevronIconForQuranGoal
                  direction="left"
                  size={THUMB_CHEVRON_SIZE}
                  color={Colors.light.green}
                />
              </View>
            </View>
          </View>
        ) : (
          <GestureDetector gesture={startPan}>
            <View
              collapsable={false}
              style={[
                localStyles.thumbHit,
                {
                  left: startHitLeft,
                  top: chip.thumbHitTop,
                  zIndex: activeHandle === "start" ? 32 : 30,
                  elevation: activeHandle === "start" ? 14 : 12,
                },
              ]}
            >
              <View
                style={[
                  localStyles.thumb,
                  activeHandle === "start" && localStyles.thumbActive,
                ]}
              >
                <View style={localStyles.thumbChevron}>
                  <FilledChevronIconForQuranGoal
                    direction="left"
                    size={THUMB_CHEVRON_SIZE}
                    color={Colors.light.green}
                  />
                </View>
              </View>
            </View>
          </GestureDetector>
        )}

        <GestureDetector gesture={endPan}>
          <View
            collapsable={false}
            style={[
              localStyles.thumbHit,
              {
                left: endHitLeft,
                top: chip.thumbHitTop,
                // Keep end above the locked start so nearby drags always move end.
                zIndex: activeHandle === "end" ? 34 : 33,
                elevation: activeHandle === "end" ? 16 : 14,
              },
            ]}
          >
            <View
              style={[
                localStyles.thumb,
                activeHandle === "end" && localStyles.thumbActive,
              ]}
            >
              <View style={localStyles.thumbChevron}>
                <FilledChevronIconForQuranGoal
                  direction="right"
                  size={THUMB_CHEVRON_SIZE}
                  color={Colors.light.green}
                />
              </View>
            </View>
          </View>
        </GestureDetector>
      </View>

      <Text style={localStyles.summaryText}>
        {t("progressLogging.totalVersesCompleted", {
          completed: formatNumber(completedCount),
          total: formatNumber(maxAyat),
          percent: formatNumber(percentCompleted),
        })}
      </Text>
    </View>
  );
}

const localStyles = StyleSheet.create({
  root: {
    width: "100%",
    overflow: "visible",
  },
  sliderArea: {
    position: "relative",
    width: "100%",
    marginTop: 0,
    overflow: "visible",
  },
  labelPill: {
    position: "absolute",
    backgroundColor: Colors.light.darkgrey,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    // Width comes from content — do not stretch the grey chip.
    alignSelf: "flex-start",
  },
  labelCaret: {
    position: "absolute",
    bottom: -4,
    width: 0,
    height: 0,
    borderLeftWidth: CARET_HALF,
    borderRightWidth: CARET_HALF,
    borderTopWidth: CARET_HALF,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: Colors.light.darkgrey,
  },
  labelText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 9,
    lineHeight: LABEL_LINE_HEIGHT,
    textAlign: "center",
    includeFontPadding: false,
  },
  track: {
    position: "absolute",
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    // Empty remaining track (after end thumb) — theme #627666
    backgroundColor: Colors.light.switchOnTrackColor,
    overflow: "hidden",
  },
  // Already-logged wash before the locked start thumb
  trackLocked: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: Colors.light.white,
    opacity: 0.5,
  },
  // Selected range between thumbs
  trackActive: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: Colors.light.white,
    opacity: 0.5,
  },
  startBar: {
    position: "absolute",
    width: START_BAR_WIDTH,
    height: START_BAR_HEIGHT,
    borderRadius: 1,
    backgroundColor: Colors.light.white,
  },
  thumbHit: {
    position: "absolute",
    width: THUMB_HIT_SIZE,
    height: THUMB_HIT_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: Colors.light.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  thumbChevron: {
    zIndex: 2,
    elevation: 2,
  },
  thumbLocked: {
    opacity: 1,
  },
  thumbActive: {
    transform: [{ scale: 1.08 }],
  },
  summaryText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: 10,
    lineHeight: 12,
    textAlign: "left",
    opacity: 0.95,
    // Pull closer to the thumbs so the slider sits lower toward this line.
    marginTop: -8,
    // Align with the track start (TRACK_HORIZONTAL_INSET).
    paddingHorizontal: TRACK_HORIZONTAL_INSET,
    zIndex: 0,
  },
});
