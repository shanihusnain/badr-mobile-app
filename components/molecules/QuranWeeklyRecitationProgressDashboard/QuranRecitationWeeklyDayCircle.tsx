import React from "react";
import { StyleSheet, View } from "react-native";
import { Colors } from "@/constants/theme";
import type { WeeklySurahDayStatus } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationWeeklyData";

type Props = {
  status: WeeklySurahDayStatus;
  size: number;
  isSelected?: boolean;
};

/** Matches SinglePrayerDayRing outer frame padding. */
const RING_FRAME_PAD = 5;

export function QuranRecitationWeeklyDayCircle({
  status,
  size,
  isSelected = false,
}: Props) {
  const isCompleted = status === "completed";
  const isPending = status === "pending";
  const isNotLogged = status === "not_logged";

  return (
    <View
      style={[
        styles.ringOuter,
        {
          width: size + RING_FRAME_PAD,
          height: size + RING_FRAME_PAD,
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
          isCompleted
            ? [styles.ringInnerLogged, isSelected && styles.ringInnerLoggedToday]
            : isPending
              ? styles.ringInnerFuture
              : isNotLogged
                ? isSelected
                  ? styles.ringInnerSelectedEmpty
                  : styles.ringInnerEmpty
                : styles.ringInnerEmpty,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Matches SinglePrayerDayRing
  ringOuter: {
    alignItems: "center",
    justifyContent: "center",
    borderColor: "transparent",
  },
  ringInner: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  ringInnerLogged: {
    backgroundColor: Colors.light.green,
  },
  ringInnerLoggedToday: {
    borderWidth: 1.5,
    borderColor: Colors.light.bordercolortodayselectedring,
  },
  ringInnerEmpty: {
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
});
