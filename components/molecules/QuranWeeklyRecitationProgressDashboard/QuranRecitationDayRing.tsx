import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
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

export function QuranRecitationDayRing({
  day,
  dailyTarget,
  size,
  isSelected,
}: Props) {
  const target = clampDailyRecitationTarget(dailyTarget);
  const isFuture = day.dayType === "future";
  const fadeAnim = useRef(new Animated.Value(isFuture ? 0.38 : 1)).current;

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

    return (
      <Animated.View
        style={[
          styles.ringOuter,
          {
            width: size + 6,
            height: size + 6,
            borderRadius: (size + 6) / 2,
            opacity: fadeAnim,
          },
          isSelected && styles.ringOuterSelected,
        ]}
      >
        <View
          style={[
            styles.solidInner,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: fillColor,
            },
          ]}
        >
          {day.isBestDay ? (
            <Ionicons name="star" size={16} color={Colors.light.yellow} />
          ) : null}
        </View>
      </Animated.View>
    );
  }

  const strokeWidth = Math.max(3.5, Math.min(2.5, size * 0.12));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gapSize = target >= 5 ? 3 : 6;
  const segmentWidth = circumference / target;
  const dashLength = Math.max(segmentWidth - gapSize, 1);

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
            const offset = -(index * segmentWidth);
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
  },
  svg: {
    transform: [{ rotate: "-90deg" }],
  },
  bestDayStar: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
