import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { BestdayStarIcon } from "@/assets/icons";

type SinglePrayerDayRingProps = {
  size: number;
  hasLog: boolean;
  isBestDay: boolean;
  isSelected: boolean;
  isFuture: boolean;
  isMenstruation: boolean;
  showEmptyOutline: boolean;
};

export function SinglePrayerDayRing({
  size,
  hasLog,
  isBestDay,
  isSelected,
  isFuture,
  isMenstruation,
  showEmptyOutline,
}: SinglePrayerDayRingProps) {
  return (
    <View
      style={[
        styles.ringOuter,
        {
          width: size + 5,
          height: size + 5,
          borderRadius: 8,
        },
      ]}
    >
      <View
        style={[
          styles.ringInner,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          isMenstruation
            ? styles.ringInnerMenstruation
            : showEmptyOutline
              ? isSelected
                ? styles.ringInnerSelectedEmpty
                : styles.ringInnerDimOutline
              : isFuture
                ? styles.ringInnerFuture
                : hasLog
                  ? [
                      styles.ringInnerLogged,
                      isSelected && styles.ringInnerLoggedToday,
                    ]
                  : isSelected
                    ? styles.ringInnerSelectedEmpty
                    : styles.ringInnerEmpty,
        ]}
      >
        {isBestDay && !isFuture && !showEmptyOutline && !isMenstruation && (
          <BestdayStarIcon />
        )}
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
  ringInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringInnerLogged: {
    backgroundColor: Colors.light.green,
  },
  ringInnerLoggedToday: {
    borderWidth: 1.5,
    borderColor: Colors.light.bordercolortodayselectedring,
  },
  ringInnerMenstruation: {
    backgroundColor: Colors.light.red,
  },
  ringInnerEmpty: {
    // Past day with no activity — solid muted grey fill
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  ringInnerSelectedEmpty: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.28)",
  },
  ringInnerFuture: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.32)",
  },
  ringInnerDimOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
});
