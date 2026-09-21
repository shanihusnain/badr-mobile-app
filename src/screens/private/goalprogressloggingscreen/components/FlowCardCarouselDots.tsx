import React from "react";
import { View } from "react-native";
import { flowCardCarouselDotsStyles as styles } from "./SurahRecitationGoals.styles";

type Props = {
  count: number;
  activeIndex: number;
};

export function FlowCardCarouselDots({ count, activeIndex }: Props) {
  if (count <= 1) return null;

  return (
    <View style={styles.dotsRow} pointerEvents="none">
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === activeIndex ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}
