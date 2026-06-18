import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors } from "@/constants/theme";

export type PrayerStatus =
  | "none"
  | "onTime"
  | "congregation"
  | "missed"
  | "menstruation";

export interface PrayerProgressTrackerRingProps {
  statuses?: PrayerStatus[];
  isMenstruating?: boolean;
  size?: number;
  strokeWidth?: number;
}

export const PrayerProgressTrackerRing: React.FC<
  PrayerProgressTrackerRingProps
> = ({
  statuses = ["none", "none", "none", "none", "none"],
  isMenstruating = false,
  size = 50,
  strokeWidth = 5,
}) => {
  const STATUS_COLORS: Record<PrayerStatus, string> = {
    none: "rgba(255, 255, 255, 0.2)",
    onTime: Colors.light.green, // Green
    congregation: Colors.light.lightblue, // Blue
    missed: Colors.light.yellow, // Yellow
    menstruation: Colors.light.red, // Red
  };

  const radius = (size - strokeWidth) / 3;
  const circumference = 2 * Math.PI * radius;
  const segmentWidth = circumference / 5;
  const gapSize = 4; // Gap in pixels between segments
  const dashLength = segmentWidth - gapSize;

  // If menstruating, override all 5 segments to red
  const finalStatuses = isMenstruating
    ? Array<PrayerStatus>(5).fill("menstruation")
    : [...statuses, ...Array<PrayerStatus>(5).fill("none")].slice(0, 5);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={styles.svg}>
        {finalStatuses.map((status, index) => {
          const strokeColor = STATUS_COLORS[status] || STATUS_COLORS.none;
          const offset = -(index * segmentWidth);

          return (
            <Circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  svg: {
    transform: [{ rotate: "-140deg" }], // Rotate so segments start at the top
  },
});
