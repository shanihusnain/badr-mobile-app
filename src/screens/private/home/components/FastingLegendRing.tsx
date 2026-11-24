import { StyleSheet, View, type ViewStyle } from "react-native";

const DEFAULT_RING_SIZE = 10;

type FastingLegendRingProps = {
  color: string;
  completed?: boolean;
  size?: number;
};

function getCompletedRingStyle(size: number, color: string): ViewStyle {
  return {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    borderWidth: 0,
  };
}

/** Figma planned legend: solid hollow ring (not dashed). */
function getPlannedRingStyle(size: number, color: string): ViewStyle {
  return {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: "transparent",
    borderWidth: 1.25,
    borderColor: color,
  };
}

export function FastingLegendRing({
  color,
  completed = false,
  size = DEFAULT_RING_SIZE,
}: FastingLegendRingProps) {
  return (
    <View
      style={[
        styles.ring,
        completed
          ? getCompletedRingStyle(size, color)
          : getPlannedRingStyle(size, color),
      ]}
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
