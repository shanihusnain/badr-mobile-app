import { Colors } from "@/constants/theme";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { GoalCard, type GoalCardData } from "./GoalCard";

const SCREEN_H_PADDING = 16;
// Fallback height while we measure the actual `GoalCard` height for this screen width.
const CARD_HEIGHT_FALLBACK = 180;
const STACK_OFFSET_Y = 3;
const PEEK_VISIBLE = 1;

// Defined outside component — stable reference, never triggers worklet warning
const STACK_MODE_CONFIG = {
  stackInterval: STACK_OFFSET_Y,
  scaleInterval: 0.05,
  opacityInterval: 0,
  rotateZDeg: 0,
  snapDirection: "left" as const,
  showLength: PEEK_VISIBLE + 1,
};

type Props = {
  data: GoalCardData[];
};

export const GoalCardCarousel = ({ data }: Props) => {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = windowWidth - SCREEN_H_PADDING * 2;
  const [measuredCardHeight, setMeasuredCardHeight] =
    useState(CARD_HEIGHT_FALLBACK);

  // Account for stacked peek cards (carousel renders slightly overlapped cards).
  const containerHeight =
    measuredCardHeight + STACK_OFFSET_Y * PEEK_VISIBLE * 2;

  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const progress = useSharedValue(0);

  return (
    <View>
      {/* Measure the real rendered card height (responsive text wrapping). */}
      {data[0] && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: -9999,
            top: 0,
            opacity: 0,
            width: cardWidth,
          }}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            setMeasuredCardHeight((prev) =>
              Math.abs(prev - h) > 1 ? h : prev,
            );
          }}
        >
          <GoalCard item={data[0]} cardWidth={cardWidth} />
        </View>
      )}

      <Carousel
        width={cardWidth}
        height={containerHeight}
        data={data}
        loop={false}
        mode="horizontal-stack"
        modeConfig={STACK_MODE_CONFIG}
        onProgressChange={progress}
        renderItem={({ item }) => (
          <GoalCard item={item} cardWidth={cardWidth} />
        )}
        style={{ width: cardWidth }}
        pagingEnabled={true}
      />

      <Pagination.Basic
        progress={progress}
        data={data}
        size={6}
        dotStyle={styles.dot}
        activeDotStyle={styles.dotActive}
        containerStyle={[
          styles.dotsRow,
          { flexDirection: isRtl ? "row-reverse" : "row" },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dotsRow: {
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 5,
  },
  dot: {
    backgroundColor: Colors.light.paginationInactiveDot,
    borderRadius: 12,
  },
  dotActive: {
    backgroundColor: Colors.light.green,
    borderRadius: 12,
  },
});
