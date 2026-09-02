import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors } from "@/constants/theme";

export type SunnahPrayerId =
  | "before_fajr"
  | "before_dhuhr"
  | "after_dhuhr"
  | "before_asr"
  | "after_maghrib"
  | "after_isha";

export type SunnahPrayerConfig = {
  id: SunnahPrayerId;
  /** Prayers/day for this slot — drives both arc length and fill target (1 or 2). */
  weight: 1 | 2;
};

export type SunnahDayData = {
  goal: SunnahPrayerConfig[];
  logged: Partial<Record<SunnahPrayerId, number>>;
  isMenstruation?: boolean;
  /** Today: unlogged arcs render brighter (upcoming). */
  isToday?: boolean;
};

export type SunnahRawatibDayRingProps = {
  size: number;
  data: SunnahDayData;
  isSelected?: boolean;
};

export function SunnahRawatibDayRing({
  size,
  data,
  isSelected,
}: SunnahRawatibDayRingProps) {
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gapSize = 5;

  const totalWeight = data.goal.reduce((acc, curr) => acc + curr.weight, 0);

  // Fallback if no goal is set
  if (totalWeight === 0) {
    return (
      <View
        style={[
          styles.ringOuter,
          { width: size + 10, height: size + 16, borderRadius: 8 },
          isSelected && styles.ringOuterSelected,
        ]}
      >
        <View style={{ width: size, height: size }}>
          <Svg
            width={size}
            height={size}
            style={{ transform: [{ rotate: "-60deg" }] }}
          >
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={Colors.light.ringTrackEmpty}
              strokeWidth={strokeWidth}
            />
          </Svg>
        </View>
      </View>
    );
  }

  type RenderSegment = {
    color: string;
    length: number;
    offset: number;
  };

  const segments: RenderSegment[] = [];
  let currentOffset = 0;

  data.goal.forEach((prayer) => {
    // Arc length proportional to prayers/day from slotConfig (1 or 2).
    const prayerArcLength = (prayer.weight / totalWeight) * circumference;

    if (data.isMenstruation) {
      segments.push({
        color: Colors.light.red,
        length: prayerArcLength - gapSize,
        offset: currentOffset,
      });
    } else {
      const loggedValue = data.logged[prayer.id];

      if (loggedValue === undefined) {
        // Not logged yet — today upcoming = bright white; else dim
        segments.push({
          color: data.isToday
            ? Colors.light.white
            : Colors.light.dullWhiteOpacity,
          length: prayerArcLength - gapSize,
          offset: currentOffset,
        });
      } else if (loggedValue === 0) {
        // Missed -> yellow
        segments.push({
          color: Colors.light.yellow,
          length: prayerArcLength - gapSize,
          offset: currentOffset,
        });
      } else if (loggedValue >= prayer.weight) {
        // Fully prayed -> green
        segments.push({
          color: Colors.light.green,
          length: prayerArcLength - gapSize,
          offset: currentOffset,
        });
      } else {
        // Partial (e.g. 1 of 2): logged portion green, remaining yellow.
        const halfLength = (prayerArcLength - gapSize) / 2;

        segments.push({
          color: Colors.light.green,
          length: halfLength,
          offset: currentOffset,
        });

        segments.push({
          color: Colors.light.yellow,
          length: halfLength,
          offset: currentOffset + halfLength,
        });
      }
    }

    currentOffset += prayerArcLength;
  });

  return (
    <View
      style={[
        styles.ringOuter,
        { width: size + 10, height: size + 16, borderRadius: 8 },
        isSelected && styles.ringOuterSelected,
      ]}
    >
      <View style={{ width: size, height: size }}>
        <Svg
          width={size}
          height={size}
          // SVG stroke starts at 3 o'clock; -60deg puts Before Fajr (index 0) at 1 o'clock.
          style={{ transform: [{ rotate: "-75deg" }] }}
        >
          {segments.map((segment, index) => (
            <Circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segment.length} ${circumference - segment.length}`}
              strokeDashoffset={-segment.offset}
              strokeLinecap="round"
            />
          ))}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ringOuter: {
    alignItems: "center",
    justifyContent: "center",
    borderColor: "transparent",
  },
  ringOuterSelected: {
    // Background color applied to the wrapper in the dashboard
  },
});
