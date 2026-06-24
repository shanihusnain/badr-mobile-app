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
  minStartAyat?: number;
  verseCount?: number;
  formatVerseLabel?: (ayat: number) => string;
  onChangeStartAyat: (value: number) => void;
  onChangeEndAyat: (value: number) => void;
  styles: Record<string, object>;
};

type ActiveHandle = "start" | "end" | null;

const THUMB_SIZE = 22;
const THUMB_RADIUS = THUMB_SIZE / 2;
/** Horizontal inset so thumbs stay fully visible at min/max. */
const TRACK_HORIZONTAL_INSET = THUMB_RADIUS;
const TRACK_HEIGHT = 8;
const LABEL_LINE_HEIGHT = 12;
const LABEL_PADDING_V = 2;
const LABEL_ROW_HEIGHT = LABEL_LINE_HEIGHT + LABEL_PADDING_V * 2;
const LABEL_TO_TRACK_GAP = 5;
const TRACK_CENTER_Y =
  LABEL_ROW_HEIGHT + LABEL_TO_TRACK_GAP + THUMB_RADIUS;
const SLIDER_HEIGHT = TRACK_CENTER_Y + THUMB_RADIUS;
const LABEL_WIDTH = 88;
const LABEL_TOP = 0;
const THUMB_TOP = TRACK_CENTER_Y - THUMB_RADIUS;
const TRACK_TOP = TRACK_CENTER_Y - TRACK_HEIGHT / 2;

function getLabelLeft(handleX: number, containerWidth: number): number {
  return Math.max(
    0,
    Math.min(
      TRACK_HORIZONTAL_INSET + handleX - LABEL_WIDTH / 2,
      containerWidth - LABEL_WIDTH,
    ),
  );
}

export function QuranAyatRangeSlider({
  juz,
  startAyat,
  endAyat,
  minStartAyat = 1,
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
  const safeStart = Math.min(Math.max(startAyat, safeMinStart), maxAyat);
  const safeEnd = Math.min(Math.max(endAyat, safeStart), maxAyat);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const trackWidth = Math.max(width - TRACK_HORIZONTAL_INSET * 2, 1);

  const valueToX = useCallback(
    (value: number) => {
      if (maxAyat <= safeMinStart) return 0;
      return ((value - safeMinStart) / (maxAyat - safeMinStart)) * trackWidth;
    },
    [maxAyat, safeMinStart, trackWidth],
  );

  const xToValue = useCallback(
    (x: number) => {
      if (maxAyat <= safeMinStart) return safeMinStart;
      const percent = Math.max(0, Math.min(x / trackWidth, 1));
      return Math.round(safeMinStart + percent * (maxAyat - safeMinStart));
    },
    [maxAyat, safeMinStart, trackWidth],
  );

  const startX = valueToX(safeStart);
  const endX = valueToX(safeEnd);

  const startThumbLeft = TRACK_HORIZONTAL_INSET + startX - THUMB_RADIUS;
  const endThumbLeft = TRACK_HORIZONTAL_INSET + endX - THUMB_RADIUS;

  const startLabelLeft = getLabelLeft(startX, width);
  const endLabelLeft = getLabelLeft(endX, width);

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
        .activeOffsetX([-4, 4])
        .onBegin(() => {
          setActiveHandle("start");
        })
        .onStart(() => {
          dragOriginX.current = startX;
        })
        .onUpdate((event) => {
          const nextX = Math.max(
            0,
            Math.min(dragOriginX.current + event.translationX, trackWidth),
          );
          const nextValue = Math.min(
            Math.max(xToValue(nextX), safeMinStart),
            safeEnd,
          );
          onChangeStartAyat(nextValue);
        })
        .onFinalize(() => {
          setActiveHandle((current) => (current === "start" ? null : current));
        }),
    [onChangeStartAyat, safeEnd, safeMinStart, startX, trackWidth, xToValue],
  );

  const endPan = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .activeOffsetX([-4, 4])
        .onBegin(() => {
          setActiveHandle("end");
        })
        .onStart(() => {
          dragOriginX.current = endX;
        })
        .onUpdate((event) => {
          const nextX = Math.max(
            0,
            Math.min(dragOriginX.current + event.translationX, trackWidth),
          );
          const nextValue = Math.max(xToValue(nextX), safeStart);
          onChangeEndAyat(nextValue);
        })
        .onFinalize(() => {
          setActiveHandle((current) => (current === "end" ? null : current));
        }),
    [endX, onChangeEndAyat, safeStart, trackWidth, xToValue],
  );

  return (
    <View style={localStyles.root} onLayout={onLayout}>
      <View style={[localStyles.sliderArea, { height: SLIDER_HEIGHT }]}>
        {activeHandle === "start" ? (
          <View
            style={[
              localStyles.labelPill,
              {
                left: startLabelLeft,
                width: LABEL_WIDTH,
                top: LABEL_TOP,
              },
            ]}
          >
            <Text style={localStyles.labelText} numberOfLines={1}>
              {startLabel}
            </Text>
          </View>
        ) : null}

        {activeHandle === "end" ? (
          <View
            style={[
              localStyles.labelPill,
              {
                left: endLabelLeft,
                width: LABEL_WIDTH,
                top: LABEL_TOP,
              },
            ]}
          >
            <Text style={localStyles.labelText} numberOfLines={1}>
              {endLabel}
            </Text>
          </View>
        ) : null}

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

        <GestureDetector gesture={startPan}>
          <View
            style={[
              localStyles.thumb,
              {
                left: startThumbLeft,
                top: THUMB_TOP,
              },
            ]}
          >
            <Ionicons
              name="chevron-forward"
              size={12}
              color={Colors.light.green}
            />
          </View>
        </GestureDetector>

        <GestureDetector gesture={endPan}>
          <View
            style={[
              localStyles.thumb,
              {
                left: endThumbLeft,
                top: THUMB_TOP,
              },
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={12}
              color={Colors.light.green}
            />
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
    zIndex: 5,
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
    backgroundColor: "#5A5A5A",
    overflow: "hidden",
  },
  trackActive: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: Colors.light.white,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
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
