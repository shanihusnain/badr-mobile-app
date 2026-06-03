import { Colors } from "@/constants/theme";
import { useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { ContainerCard, type ContainerCardData } from "./ContainerCard";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const SCREEN_H_PADDING = 16;
const CARD_HEIGHT = 160;
const STACK_OFFSET_Y = 8;
const PEEK_VISIBLE = 1;

const STACK_MODE_CONFIG = {
  stackInterval: STACK_OFFSET_Y,
  scaleInterval: 0.04,
  opacityInterval: 0,
  rotateZDeg: 0,
  snapDirection: "left" as const,
  showLength: PEEK_VISIBLE + 1,
};

type Props = {
  data: ContainerCardData[];
  renderTextWithHighlight: (
    text: string,
    highlightedTexts: string[]
  ) => Array<{ text: string; highlighted: boolean }>;
};

export const ContainerCarousel = ({
  data,
  renderTextWithHighlight,
}: Props) => {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = windowWidth - SCREEN_H_PADDING * 2;
  const containerHeight = CARD_HEIGHT + STACK_OFFSET_Y * PEEK_VISIBLE;
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
          <ContainerCard
            item={item}
            cardWidth={cardWidth}
            renderTextWithHighlight={renderTextWithHighlight}
          />
        )}
        style={{ width: cardWidth }}
      />

      {/* Dot indicators removed */}
    </View>
  );
};

const styles = StyleSheet.create({});
