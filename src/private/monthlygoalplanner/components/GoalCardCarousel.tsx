import { Colors } from "@/constants/theme";
import { useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useTranslation } from "react-i18next";
import Carousel from "react-native-reanimated-carousel";
import { GoalCard, type GoalCardData } from "./GoalCard";

const SCREEN_H_PADDING = 16;
const CARD_HEIGHT = 180;
const STACK_OFFSET_Y = 10;
const PEEK_VISIBLE = 2;

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
  const containerHeight = CARD_HEIGHT + STACK_OFFSET_Y * PEEK_VISIBLE;

  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View>
      <Carousel
        width={cardWidth}
        height={containerHeight}
        data={data}
        loop={false}
        mode="horizontal-stack"
        modeConfig={STACK_MODE_CONFIG}
        onSnapToItem={setActiveIndex}
        renderItem={({ item }) => (
          <GoalCard item={item} cardWidth={cardWidth} />
        )}
        style={{ width: cardWidth }}
      />

      {/* Dot indicators */}
      <View style={[styles.dotsRow, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
        {data.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 12,
    backgroundColor: Colors.light.grey,
  },
  dotActive: {
    width: 10,
    height: 10,
    backgroundColor: Colors.light.green,
    borderRadius: 12,
  },
});
