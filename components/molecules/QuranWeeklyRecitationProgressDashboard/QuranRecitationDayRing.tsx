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
  // Chip selection is the source of truth for "today" — never fade/outline
  // today's empty ring as a future day (UPCOMING backend days).
  const effectiveDayType =
    isSelected && day.dayType === "future" ? "today" : day.dayType;
  const isFuture = effectiveDayType === "future";
  const isTodayEmpty =
    effectiveDayType === "today" && day.recitationsCompleted < target;
  // Multi-arc future segments keep a soft fade; solid (target=1) future is a
  // bordered outline at full opacity (same as SinglePrayerDayRing).
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const showBestDayStar = false;

  useEffect(() => {
    const nextOpacity = isFuture && target > 1 ? 0.38 : 1;
    Animated.timing(fadeAnim, {
      toValue: nextOpacity,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, isFuture, target]);

  const segmentStates = useMemo(
    () =>
      getRecitationSegmentStates(
        day.recitationsCompleted,
        target,
        effectiveDayType,
      ),
    [day.recitationsCompleted, effectiveDayType, target],
  );

  if (target === 1) {
    const fillColor = isFuture
      ? "transparent"
      : getSolidRecitationFillColor(
          day.recitationsCompleted,
          target,
          effectiveDayType,
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
            // Match SinglePrayerDayRing `ringInnerSelectedEmpty`.
            isTodayEmpty && styles.solidInnerTodayEmpty,
            // Future = grey bordered ring, not solid fill.
            isFuture && styles.solidInnerFuture,
          ]}
        >
          {showBestDayStar ? (
            <View
              pointerEvents="none"
              style={styles.starWrap}
              collapsable={false}
            >
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
  solidInnerTodayEmpty: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.32)",
  },
  // Match Missed Ramadan / prayer `ringInnerFuture` outline.
  solidInnerFuture: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.32)",
  },
  starWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    transform: [{ rotate: "-90deg" }],
  },
});
