import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import {
  getCompletionDayRingColor,
  type QuranCompletionDayProgress,
} from "@/src/screens/private/goalprogressloggingscreen/quranRecitationCompletionWeeklyData";

type Props = {
  day: QuranCompletionDayProgress;
  size: number;
  isSelected: boolean;
};

export function QuranCompletionDayRing({ day, size, isSelected }: Props) {
  const isFuture = day.dayType === "future";
  const fadeAnim = useRef(new Animated.Value(isFuture ? 0.38 : 1)).current;
  const fillColor = getCompletionDayRingColor(day.hasActivity, day.dayType);
  const today = day.dayType === "today";
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isFuture ? 0.38 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, isFuture]);

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
        {
          borderWidth: isFuture || today ? 1 : 0,
          borderColor: Colors.light.grey,
        },
      ]}
    >
      <View
        style={[
          styles.solidInner,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: today ? Colors.light.blackBackground : fillColor,
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
});
