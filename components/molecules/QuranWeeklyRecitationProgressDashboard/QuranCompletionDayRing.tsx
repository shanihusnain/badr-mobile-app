import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/theme";
import { BestdayStarIcon } from "@/assets/icons";
import {
  getCompletionDayRingColor,
  type QuranCompletionDayProgress,
} from "@/src/screens/private/goalprogressloggingscreen/quranRecitationCompletionWeeklyData";

type Props = {
  day: QuranCompletionDayProgress;
  size: number;
  isSelected: boolean;
};

/** Match SinglePrayerDayRing — best day circle is slightly larger. */
const BEST_DAY_SIZE_BOOST = 6;

export function QuranCompletionDayRing({ day, size, isSelected }: Props) {
  const isFuture = day.dayType === "future";
  const fadeAnim = useRef(new Animated.Value(isFuture ? 0.38 : 1)).current;
  const fillColor = getCompletionDayRingColor(day.hasActivity, day.dayType);
  const today = day.dayType === "today";
  const showBestDayStar = false;
  const circleSize = showBestDayStar ? size + BEST_DAY_SIZE_BOOST : size;
  const starSize = Math.max(10, Math.round(circleSize * 0.62));

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
          width: size + BEST_DAY_SIZE_BOOST + 5,
          height: size + BEST_DAY_SIZE_BOOST + 5,
          borderRadius: (size + BEST_DAY_SIZE_BOOST + 5) / 2,
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
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            backgroundColor: today ? Colors.light.blackBackground : fillColor,
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
});
