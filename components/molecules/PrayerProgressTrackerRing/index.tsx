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
  /** Today: empty arcs are white (upcoming). */
  isToday?: boolean;
  /**
   * Future day: always the dim dashed 5-arc ring (never solid grey).
   * Spec: grey dashed circle + day label.
   */
  isFuture?: boolean;
  size?: number;
  strokeWidth?: number;
}

const SLOT_COUNT = 5;

function hasAnyLoggedStatus(statuses: PrayerStatus[]): boolean {
  return statuses.some(
    (status) => status !== "none" && status !== "menstruation",
  );
}

/**
 * Always renders exactly 5 separate arcs (FAJR → ISHA), except:
 * past day with no activity → solid grey circle.
 * Future days always keep the dim dashed arc ring.
 * FAJR starts at 1 o'clock; remaining slots continue clockwise.
 */
export const PrayerProgressTrackerRing: React.FC<
  PrayerProgressTrackerRingProps
> = ({
  statuses = ["none", "none", "none", "none", "none"],
  isMenstruating = false,
  isToday = false,
  isFuture = false,
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

  const hasLog = hasAnyLoggedStatus(finalStatuses);

  // Past only: solid grey when there was no activity before today.
  // Future days must keep the dashed arc ring (see design "Future Day").
  if (!isMenstruating && !isToday && !isFuture && !hasLog) {
    return (
      <View
        style={{
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: size * 0.72,
            height: size * 0.72,
            borderRadius: (size * 0.72) / 2,
            backgroundColor: "rgba(255, 255, 255, 0.18)",
          }}
        />
      </View>
    );
  }

  const colorForStatus = (status: PrayerStatus): string => {
    switch (status) {
      case "onTime":
        return Colors.light.green;
      case "congregation":
        return Colors.light.seagreen;
      case "missed":
        return Colors.light.yellow;
      case "menstruation":
        return Colors.light.red;
      case "none":
      default:
        // Today upcoming → white; future empty arcs stay visible (column opacity blurs them)
        if (isToday) return Colors.light.white;
        return "rgba(255, 255, 255, 0.22)";
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
