import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors } from "@/constants/theme";
import { BestdayStarIcon } from "@/assets/icons";
import {
  clampDailyRecitationTarget,
  getRecitationSegmentColor,
  getRecitationSegmentStates,
  getSolidRecitationFillColor,
  type QuranRecitationDayProgress,
} from "@/src/screens/private/goalprogressloggingscreen/quranRecitationWeeklyData";

type Props = {
  day: QuranRecitationDayProgress;
  dailyTarget: number;
  size: number;
  isSelected: boolean;
};

/** Match SinglePrayerDayRing — best day circle is slightly larger. */
const BEST_DAY_SIZE_BOOST = 6;

export function QuranRecitationDayRing({
  day,
  dailyTarget,
  size,
  isSelected,
}: Props) {
  const target = clampDailyRecitationTarget(dailyTarget);
  const isFuture = day.dayType === "future";
  const fadeAnim = useRef(new Animated.Value(isFuture ? 0.38 : 1)).current;
  const showBestDayStar = false;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isFuture ? 0.38 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, isFuture]);

  const segmentStates = useMemo(
    () =>
      getRecitationSegmentStates(day.recitationsCompleted, target, day.dayType),
    [day.dayType, day.recitationsCompleted, target],
  );

  if (target === 1) {
    const fillColor = getSolidRecitationFillColor(
      day.recitationsCompleted,
      target,
      day.dayType,
    );
    const circleSize = showBestDayStar ? size + BEST_DAY_SIZE_BOOST : size;
    const starSize = Math.max(10, Math.round(circleSize * 0.62));

    return (
      <Animated.View
        style={[
          styles.ringOuter,
          {
            width: size + BEST_DAY_SIZE_BOOST + 5,
            height: size + BEST_DAY_SIZE_BOOST + 5,
            borderRadius: (size + BEST_DAY_SIZE_BOOST + 5) / 2,
            opacity: fadeAnim,
          },
          isSelected && styles.ringOuterSelected,
        ]}
      >
        <View
          style={[
            styles.solidInner,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              backgroundColor: fillColor,
            },
          ]}
        >
          {showBestDayStar ? (
            <View pointerEvents="none" style={styles.starWrap} collapsable={false}>
              <BestdayStarIcon Size={starSize} />
            </View>
          ) : null}
        </View>
      </Animated.View>
    );
  }

  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Round caps eat gap visually — keep openings clear at top/bottom center.
  const gapSize =
    target === 2
      ? strokeWidth + 4
      : target >= 5
        ? strokeWidth + 2
        : strokeWidth + 3;
  const segmentWidth = circumference / target;
  const dashLength = Math.max(segmentWidth - gapSize, 1);

  // Multi-arc rings: no star inside/above the ring — "BEST DAY!" label is enough.
  return (
    <Animated.View
      style={[
        styles.ringOuter,
        {
          width: size + 6,
          height: size + 6,
          opacity: fadeAnim,
        },
        isSelected && styles.ringOuterSelected,
      ]}
    >
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={styles.svg}>
          {segmentStates.map((state, index) => {
            // Half-gap shift keeps left/right arcs upright (gaps at 12 & 6).
            const offset = -(index * segmentWidth) - gapSize / 2;
            const strokeColor = getRecitationSegmentColor(state);

            return (
              <Circle
                key={`${day.day}-${index}-${state}`}
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ringOuter: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringOuterSelected: {
    transform: [{ scale: 1.04 }],
  },
  solidInner: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  starWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    transform: [{ rotate: "-90deg" }],
  },
});
