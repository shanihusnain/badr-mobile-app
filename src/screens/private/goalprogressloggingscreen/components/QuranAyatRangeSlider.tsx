import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  onChangeStartAyat: (value: number) => void;
  onChangeEndAyat: (value: number) => void;
  styles: Record<string, object>;
};

const PADDING_X = 8;
const THUMB_SIZE = 22;
const TRACK_HEIGHT = 8;
const SLIDER_HEIGHT = 56;
const LABEL_WIDTH = 88;

export function QuranAyatRangeSlider({
  juz,
  startAyat,
  endAyat,
  onChangeStartAyat,
  onChangeEndAyat,
}: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const isMounted = useRef(true);
  const dragOriginX = useRef(0);
  const [width, setWidth] = useState(0);

  const maxAyat = Math.max(getJuzVerseCountFromMap(juz), 1);
  const safeStart = Math.min(Math.max(startAyat, 1), maxAyat);
  const safeEnd = Math.min(Math.max(endAyat, safeStart), maxAyat);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const trackWidth = Math.max(width - PADDING_X * 2, 1);

  const valueToX = useCallback(
    (value: number) => {
      if (maxAyat <= 1) return 0;
      return ((value - 1) / (maxAyat - 1)) * trackWidth;
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

  const startThumbLeft = PADDING_X + startX - THUMB_SIZE / 2;
  const endThumbLeft = PADDING_X + endX - THUMB_SIZE / 2;

  const startLabelLeft = Math.max(
    0,
    Math.min(PADDING_X + startX - LABEL_WIDTH / 2, width - LABEL_WIDTH),
  );
  const endLabelLeft = Math.max(
    0,
    Math.min(PADDING_X + endX - LABEL_WIDTH / 2, width - LABEL_WIDTH),
  );

  const completedCount = safeEnd - safeStart + 1;
  const percentCompleted =
    maxAyat > 0 ? Math.round((completedCount / maxAyat) * 100) : 0;

  const startLabel = useMemo(
    () => formatJuzVerseLabel(juz, safeStart),
    [juz, safeStart],
  );
  const endLabel = useMemo(
    () => formatJuzVerseLabel(juz, safeEnd),
    [juz, safeEnd],
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
        .onStart(() => {
          dragOriginX.current = startX;
        })
        .onUpdate((event) => {
          const nextX = Math.max(
            0,
            Math.min(dragOriginX.current + event.translationX, trackWidth),
          );
          const nextValue = Math.min(xToValue(nextX), safeEnd);
          onChangeStartAyat(nextValue);
        }),
    [onChangeStartAyat, safeEnd, startX, trackWidth, xToValue],
  );

  const endPan = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .activeOffsetX([-4, 4])
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
        }),
    [endX, onChangeEndAyat, safeStart, trackWidth, xToValue],
  );

  return (
    <View style={localStyles.root} onLayout={onLayout}>
      <View style={[localStyles.sliderArea, { height: SLIDER_HEIGHT }]}>
        <View
          style={[
            localStyles.labelPill,
            { left: startLabelLeft, width: LABEL_WIDTH },
          ]}
        >
          <Text style={localStyles.labelText} numberOfLines={1}>
            {startLabel}
          </Text>
        </View>

        <View
          style={[
            localStyles.labelPill,
            { left: endLabelLeft, width: LABEL_WIDTH },
          ]}
        >
          <Text style={localStyles.labelText} numberOfLines={1}>
            {endLabel}
          </Text>
        </View>

        <View
          style={[
            localStyles.track,
            {
              left: PADDING_X,
              right: PADDING_X,
              top: SLIDER_HEIGHT / 2 - TRACK_HEIGHT / 2,
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
                top: SLIDER_HEIGHT / 2 - THUMB_SIZE / 2,
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
                top: SLIDER_HEIGHT / 2 - THUMB_SIZE / 2,
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
  },
  sliderArea: {
    position: "relative",
    width: "100%",
    marginBottom: 6,
  },
  labelPill: {
    position: "absolute",
    top: 0,
    backgroundColor: Colors.light.darkgrey,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  labelText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 11,
    lineHeight: 14,
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
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
    opacity: 0.95,
  },
});
