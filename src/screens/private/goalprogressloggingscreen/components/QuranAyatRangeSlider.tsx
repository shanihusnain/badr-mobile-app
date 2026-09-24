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
};

type ActiveHandle = "start" | "end" | null;

const THUMB_SIZE = 22;
const THUMB_HIT_SIZE = 44;
const THUMB_RADIUS = THUMB_SIZE / 2;
const THUMB_HIT_RADIUS = THUMB_HIT_SIZE / 2;
/** Keep thumb circles from stacking when ayah values map close together. */
const MIN_THUMB_CENTER_GAP = THUMB_SIZE + 4;
const LABEL_GAP = 6;
/** Horizontal inset so thumbs stay fully visible at min/max. */
const TRACK_HORIZONTAL_INSET = THUMB_RADIUS;
const TRACK_HEIGHT = 6;
/** Figma: white vertical tick at ayah 1 / track start. */
const START_BAR_WIDTH = 2;
const START_BAR_HEIGHT = 16;
const LABEL_LINE_HEIGHT = 11;
const LABEL_PADDING_V = 2;
const LABEL_ROW_HEIGHT = LABEL_LINE_HEIGHT + LABEL_PADDING_V * 2;
const LABEL_TO_TRACK_GAP = 6;
const TRACK_CENTER_Y =
  LABEL_ROW_HEIGHT + LABEL_TO_TRACK_GAP + THUMB_RADIUS;
const SLIDER_HEIGHT = TRACK_CENTER_Y + THUMB_HIT_RADIUS;
/** Compact dark pill above each thumb (Figma). Min fits 3-digit ayahs. */
const LABEL_WIDTH = 36;
const LABEL_TOP = 0;
const CARET_HALF = 4;
const THUMB_HIT_TOP = TRACK_CENTER_Y - THUMB_HIT_RADIUS;
const TRACK_TOP = TRACK_CENTER_Y - TRACK_HEIGHT / 2;

function estimateLabelWidth(text: string): number {
  // Overestimate slightly so separation kicks in before pills visually collide.
  // ~6.5px/glyph at 9pt medium + horizontal padding (5*2).
  return Math.min(Math.max(Math.ceil(text.length * 6.5) + 14, LABEL_WIDTH), 108);
}

function getLabelLeft(
  handleX: number,
  containerWidth: number,
  labelWidth: number,
): number {
  return Math.max(
    0,
    Math.min(
      TRACK_HORIZONTAL_INSET + handleX - labelWidth / 2,
      containerWidth - labelWidth,
    ),
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
 * Keep ayah pills from covering each other.
 * Prefer pushing the end pill right; if that hits the container edge, pull the
 * start pill left. If both still cannot fit, shrink widths evenly.
 */
function separateLabelLefts(
  startLeft: number,
  startWidth: number,
  endLeft: number,
  endWidth: number,
  containerWidth: number,
): {
  startLabelLeft: number;
  endLabelLeft: number;
  startLabelWidth: number;
  endLabelWidth: number;
} {
  if (containerWidth <= 0) {
    return {
      startLabelLeft: startLeft,
      endLabelLeft: endLeft,
      startLabelWidth: startWidth,
      endLabelWidth: endWidth,
    };
  }

  let startW = Math.min(startWidth, containerWidth);
  let endW = Math.min(endWidth, containerWidth);
  const minPair = startW + endW + LABEL_GAP;

  // Shrink both when the pair is wider than the track.
  if (minPair > containerWidth) {
    const scale = (containerWidth - LABEL_GAP) / (startW + endW);
    startW = Math.max(LABEL_WIDTH, Math.floor(startW * scale));
    endW = Math.max(LABEL_WIDTH, containerWidth - LABEL_GAP - startW);
  }

  let nextStart = Math.min(startLeft, containerWidth - startW);
  let nextEnd = Math.min(endLeft, containerWidth - endW);
  nextStart = Math.max(0, nextStart);
  nextEnd = Math.max(0, nextEnd);

  if (nextEnd >= nextStart + startW + LABEL_GAP) {
    return {
      startLabelLeft: nextStart,
      endLabelLeft: nextEnd,
      startLabelWidth: startW,
      endLabelWidth: endW,
    };
  }

  // Place end just after start.
  nextEnd = nextStart + startW + LABEL_GAP;
  if (nextEnd + endW <= containerWidth) {
    return {
      startLabelLeft: nextStart,
      endLabelLeft: nextEnd,
      startLabelWidth: startW,
      endLabelWidth: endW,
    };
  }

  // Not enough room on the right — pin end to the edge and pull start left.
  nextEnd = containerWidth - endW;
  nextStart = Math.max(0, nextEnd - LABEL_GAP - startW);

  return {
    startLabelLeft: nextStart,
    endLabelLeft: nextEnd,
    startLabelWidth: startW,
    endLabelWidth: endW,
  };
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
}: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const isMounted = useRef(true);
  const dragOriginX = useRef(0);
  const parkedBoundaryRef = useRef<number | null>(null);
  const [width, setWidth] = useState(0);
  const [activeHandle, setActiveHandle] = useState<ActiveHandle>(null);

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

  const startLabelWidthRaw = estimateLabelWidth(startLabel);
  const endLabelWidthRaw = estimateLabelWidth(endLabel);
  const rawStartLabelLeft = getLabelLeft(
    renderStartX,
    width,
    startLabelWidthRaw,
  );
  const rawEndLabelLeft = getLabelLeft(renderEndX, width, endLabelWidthRaw);
  const {
    startLabelLeft,
    endLabelLeft,
    startLabelWidth,
    endLabelWidth,
  } = separateLabelLefts(
    rawStartLabelLeft,
    startLabelWidthRaw,
    rawEndLabelLeft,
    endLabelWidthRaw,
    width,
  );
  const startCaretLeft = getCaretLeft(
    renderStartX,
    startLabelLeft,
    startLabelWidth,
  );
  const endCaretLeft = getCaretLeft(renderEndX, endLabelLeft, endLabelWidth);

  const onLayout = (event: LayoutChangeEvent) => {
    const layoutWidth = event.nativeEvent.layout.width;
    if (layoutWidth > 0 && isMounted.current) {
      setWidth(layoutWidth);
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
        style={[localStyles.sliderArea, { height: SLIDER_HEIGHT }]}
        collapsable={false}
      >
        {/* Figma: ayah number pills stay visible above both thumbs */}
        <View
          pointerEvents="none"
          style={[
            localStyles.labelPill,
            {
              left: startLabelLeft,
              width: startLabelWidth,
              top: LABEL_TOP,
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
          style={[
            localStyles.labelPill,
            {
              left: endLabelLeft,
              width: endLabelWidth,
              top: LABEL_TOP,
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
              top: TRACK_TOP,
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
              top: TRACK_CENTER_Y - START_BAR_HEIGHT / 2,
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
                top: TRACK_CENTER_Y - START_BAR_HEIGHT / 2,
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
                top: THUMB_HIT_TOP,
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
                  size={10}
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
                  top: THUMB_HIT_TOP,
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
                    size={10}
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
                top: THUMB_HIT_TOP,
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
                  size={10}
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
    paddingHorizontal: 5,
    paddingVertical: LABEL_PADDING_V,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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
    textAlign: "center",
    opacity: 0.95,
    // Pull closer to the thumbs so the slider sits lower toward this line.
    marginTop: -8,
    zIndex: 0,
  },
});
