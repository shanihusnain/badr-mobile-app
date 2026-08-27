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

/** Best day is only slightly larger than a normal day circle. */
const BEST_DAY_SIZE_BOOST = 4;

export function SinglePrayerDayRing({
  size,
  hasLog,
  isBestDay,
  isSelected,
  isFuture,
  isMenstruation,
  showEmptyOutline,
}: SinglePrayerDayRingProps) {
  const showBestDayStar =
    isBestDay &&
    hasLog &&
    !isFuture &&
    !showEmptyOutline &&
    !isMenstruation;
  const circleSize = showBestDayStar ? size + BEST_DAY_SIZE_BOOST : size;
  const starSize = Math.max(10, Math.round(circleSize * 0.62));

  return (
    <View
      style={[
        styles.ringOuter,
        {
          width: size + BEST_DAY_SIZE_BOOST + 5,
          height: size + BEST_DAY_SIZE_BOOST + 5,
          borderRadius: 8,
        },
      ]}
    >
      <View
        style={[
          styles.ringInner,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
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
    // Keep visible so the star isn't clipped when there is no selected border.
    overflow: "visible",
  },
  starWrap: {
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
