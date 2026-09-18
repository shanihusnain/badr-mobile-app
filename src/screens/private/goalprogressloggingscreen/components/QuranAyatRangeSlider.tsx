import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
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
   * When true (continuing after prior logs), start thumb is locked at
   * minStartAyat with a "||" marker for yesterday’s boundary. End thumb
   * starts at max and is dragged back to select today’s verses.
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
/** Horizontal inset so thumbs stay fully visible at min/max. */
const TRACK_HORIZONTAL_INSET = THUMB_RADIUS;
const TRACK_HEIGHT = 6;
/** Figma: white vertical tick at ayah 1 / track start. */
const START_BAR_WIDTH = 2;
const START_BAR_HEIGHT = 16;
const LABEL_LINE_HEIGHT = 12;
const LABEL_PADDING_V = 2;
const LABEL_ROW_HEIGHT = LABEL_LINE_HEIGHT + LABEL_PADDING_V * 2;
const LABEL_TO_TRACK_GAP = 6;
const TRACK_CENTER_Y =
  LABEL_ROW_HEIGHT + LABEL_TO_TRACK_GAP + THUMB_RADIUS;
const SLIDER_HEIGHT = TRACK_CENTER_Y + THUMB_HIT_RADIUS;
/** Compact dark pill above each thumb (Figma). */
const LABEL_WIDTH = 28;
const LABEL_TOP = 0;
const CARET_HALF = 4;
const THUMB_TOP = TRACK_CENTER_Y - THUMB_RADIUS;
const THUMB_HIT_TOP = TRACK_CENTER_Y - THUMB_HIT_RADIUS;
const TRACK_TOP = TRACK_CENTER_Y - TRACK_HEIGHT / 2;

function estimateLabelWidth(text: string): number {
  // Wide enough for `Al-Baqarah:286`; still capped so pills don't collide.
  return Math.min(Math.max(Math.ceil(text.length * 6.4) + 12, LABEL_WIDTH), 112);
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

export function QuranAyatRangeSlider({
  juz,
  startAyat,
  endAyat,
  minStartAyat = 1,
  freezeStartHandle = false,
  verseCount,
  formatVerseLabel,
  onChangeStartAyat,
  onChangeEndAyat,
}: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const isMounted = useRef(true);
  const dragOriginX = useRef(0);
  const [width, setWidth] = useState(0);
  const [activeHandle, setActiveHandle] = useState<ActiveHandle>(null);

  const maxAyat = Math.max(verseCount ?? getJuzVerseCountFromMap(juz), 1);
  const safeMinStart = Math.min(Math.max(Math.round(minStartAyat), 1), maxAyat);
  const safeStart = freezeStartHandle
    ? safeMinStart
    : Math.min(Math.max(startAyat, safeMinStart), maxAyat);
  const safeEnd = Math.min(Math.max(endAyat, safeStart), maxAyat);

  // Keep parent state aligned when start is frozen at the logged boundary.
  useEffect(() => {
    if (!freezeStartHandle) return;
    if (startAyat !== safeMinStart) {
      onChangeStartAyat(safeMinStart);
    }
  }, [freezeStartHandle, onChangeStartAyat, safeMinStart, startAyat]);

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

  const startThumbLeft = TRACK_HORIZONTAL_INSET + startX - THUMB_RADIUS;
  const endThumbLeft = TRACK_HORIZONTAL_INSET + endX - THUMB_RADIUS;
  const startHitLeft = TRACK_HORIZONTAL_INSET + startX - THUMB_HIT_RADIUS;
  const endHitLeft = TRACK_HORIZONTAL_INSET + endX - THUMB_HIT_RADIUS;

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

  const startLabelWidth = estimateLabelWidth(startLabel);
  const endLabelWidth = estimateLabelWidth(endLabel);
  const startLabelLeft = getLabelLeft(startX, width, startLabelWidth);
  const endLabelLeft = getLabelLeft(endX, width, endLabelWidth);
  const startCaretLeft = getCaretLeft(startX, startLabelLeft, startLabelWidth);
  const endCaretLeft = getCaretLeft(endX, endLabelLeft, endLabelWidth);

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
              zIndex: activeHandle === "start" ? 7 : 5,
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
              zIndex: activeHandle === "end" ? 7 : 5,
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
                  // Extend through the frozen start thumb so the wash reads
                  // continuous up to the selection boundary.
                  width: Math.max(startX, 0),
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
            },
          ]}
        />

        {freezeStartHandle ? (
          <View
            pointerEvents="none"
            collapsable={false}
            style={[
              localStyles.thumbHit,
              {
                left: startHitLeft,
                top: THUMB_HIT_TOP,
                zIndex: 11,
              },
            ]}
          >
            {/* Locked at yesterday’s boundary — two lines, not a chevron */}
            <View style={[localStyles.thumb, localStyles.thumbLocked]}>
              <View style={localStyles.lockBars}>
                <View style={localStyles.lockBar} />
                <View style={localStyles.lockBar} />
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
                  zIndex: activeHandle === "start" ? 14 : 11,
                },
              ]}
            >
              <View
                style={[
                  localStyles.thumb,
                  activeHandle === "start" && localStyles.thumbActive,
                ]}
              >
                <Ionicons
                  name="chevron-back"
                  size={12}
                  color={Colors.light.green}
                />
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
                zIndex: activeHandle === "end" ? 14 : 12,
              },
            ]}
          >
            <View
              style={[
                localStyles.thumb,
                activeHandle === "end" && localStyles.thumbActive,
              ]}
            >
              <Ionicons
                name={freezeStartHandle ? "chevron-back" : "chevron-forward"}
                size={12}
                color={Colors.light.green}
              />
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
    paddingHorizontal: 6,
    paddingVertical: LABEL_PADDING_V,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 10,
    lineHeight: LABEL_LINE_HEIGHT,
    textAlign: "center",
  },
  track: {
    position: "absolute",
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    // Figma remaining track: muted dark green on the card.
    backgroundColor: "rgba(26, 55, 42, 0.55)",
    overflow: "hidden",
  },
  // Already-logged: softer pale mint wash (lighter / more translucent).
  trackLocked: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
  },
  // Current selection: brighter, more opaque light fill.
  trackActive: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.58)",
  },
  startBar: {
    position: "absolute",
    width: START_BAR_WIDTH,
    height: START_BAR_HEIGHT,
    borderRadius: 1,
    backgroundColor: Colors.light.white,
    zIndex: 13,
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
  },
  thumbLocked: {
    opacity: 1,
  },
  lockBars: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  lockBar: {
    width: 2,
    height: 10,
    borderRadius: 1,
    backgroundColor: Colors.light.green,
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
    marginTop: 2,
  },
});
