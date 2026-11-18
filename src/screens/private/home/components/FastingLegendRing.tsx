import { StyleSheet, View, type ViewStyle } from "react-native";

const DEFAULT_RING_SIZE = 10;

type FastingLegendRingProps = {
  color: string;
  completed?: boolean;
  size?: number;
};

function getRingStyle(
  size: number,
  color: string,
  completed: boolean,
): ViewStyle {
  if (completed) {
    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      borderWidth: 0,
    };
  }

  return {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 1.5,
    borderColor: color,
    backgroundColor: "transparent",
  };
}

export function FastingLegendRing({
  color,
  completed = false,
  size = DEFAULT_RING_SIZE,
}: FastingLegendRingProps) {
  return (
    <View
      style={[styles.ring, getRingStyle(size, color, completed)]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    flexShrink: 0,
  },
});
