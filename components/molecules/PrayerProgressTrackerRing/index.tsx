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
  /** Today: empty arcs are white (upcoming). Past empty arcs stay dim. */
  isToday?: boolean;
  size?: number;
  strokeWidth?: number;
}

const SLOT_COUNT = 5;

/**
 * Always renders exactly 5 separate arcs (FAJR → ISHA).
 * FAJR starts at 1 o'clock; remaining slots continue clockwise.
 */
export const PrayerProgressTrackerRing: React.FC<
  PrayerProgressTrackerRingProps
> = ({
  statuses = ["none", "none", "none", "none", "none"],
  isMenstruating = false,
  isToday = false,
  size = 50,
  strokeWidth = 5,
}) => {
  const radius = (size - strokeWidth) / 3;
  const circumference = 2 * Math.PI * radius;
  const segmentWidth = circumference / SLOT_COUNT;
  const gapSize = 4;
  const dashLength = segmentWidth - gapSize;

  const finalStatuses = isMenstruating
    ? Array<PrayerStatus>(SLOT_COUNT).fill("menstruation")
    : [...statuses, ...Array<PrayerStatus>(SLOT_COUNT).fill("none")].slice(
        0,
        SLOT_COUNT,
      );

  const colorForStatus = (status: PrayerStatus): string => {
    switch (status) {
      case "onTime":
        // Logged on-time → green (today and past)
        return Colors.light.green;
      case "congregation":
        return Colors.light.seagreen;
      case "missed":
        return Colors.light.yellow;
      case "menstruation":
        return Colors.light.red;
      case "none":
      default:
        // Upcoming today (not logged) → white; past/future empty → dim
        return isToday ? Colors.light.white : "rgba(255, 255, 255, 0.22)";
    }
  };

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={styles.svg}>
        {finalStatuses.map((status, index) => {
          const offset = -(index * segmentWidth);

          return (
            <Circle
              key={`prayer-arc-${index}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colorForStatus(status)}
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
    // SVG stroke starts at 3 o'clock; -60deg puts FAJR (index 0) at 1 o'clock.
    transform: [{ rotate: "-60deg" }],
  },
});
