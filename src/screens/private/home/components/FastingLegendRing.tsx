import { StyleSheet, View, type ViewStyle } from "react-native";
import { styles } from "../styles";

const DEFAULT_RING_SIZE = 10;

type FastingLegendRingProps = {
  color: string;
  completed?: boolean;
  size?: number;
};

function getRingSizeStyle(size: number, color: string): ViewStyle {
  return {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    maxWidth: size,
    maxHeight: size,
    borderRadius: size / 2,
    borderColor: color,
  };
}

function getDotSizeStyle(dotSize: number, color: string): ViewStyle {
  return {
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    backgroundColor: color,
  };
}

export function FastingLegendRing({
  color,
  completed = false,
  size = DEFAULT_RING_SIZE,
}: FastingLegendRingProps) {
  const dotSize = Math.max(size * 0.55, 6);

  return (
    <View
      style={[
        styles.fastingLegendRing,
        ringStyles.sized,
        getRingSizeStyle(size, color),
      ]}
    >
      {completed ? (
        <View
          style={[
            styles.fastingLegendRingDot,
            getDotSizeStyle(dotSize, color),
          ]}
        />
      ) : null}
    </View>
  );
}

const ringStyles = StyleSheet.create({
  sized: {
    flexShrink: 0,
  },
});
