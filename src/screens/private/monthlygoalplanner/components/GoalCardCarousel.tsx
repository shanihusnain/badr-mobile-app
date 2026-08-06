import { Colors } from "@/constants/theme";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
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
  const progress = useSharedValue(0);

  return (
    <View>
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
        size={10}
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
    marginTop: 12,
    gap: 6,
  },
  dot: {
    backgroundColor: Colors.light.grey,
    borderRadius: 12,
  },
  dotActive: {
    backgroundColor: Colors.light.green,
    borderRadius: 12,
  },
});
