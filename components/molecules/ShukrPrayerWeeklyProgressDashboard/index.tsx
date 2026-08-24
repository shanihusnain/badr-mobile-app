import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  SinglePrayerWeeklyProgressDashboard,
  type SinglePrayerDayProgress,
  type SinglePrayerWeeklyProgressDashboardProps,
} from "@/components/molecules/SinglePrayerWeeklyProgressDashboard";

export type ShukrPrayerDayProgress = SinglePrayerDayProgress;

export type ShukrPrayerWeeklyProgressDashboardProps =
  SinglePrayerWeeklyProgressDashboardProps & {
    statsIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  };

export function ShukrPrayerWeeklyProgressDashboard({
  statsIcon: _statsIcon,
  ...props
}: ShukrPrayerWeeklyProgressDashboardProps) {
  return (
    <SinglePrayerWeeklyProgressDashboard
      {...props}
      defaultMotivationalQuote="Masha'Allah, may Allah always fill your heart with His love and light!"
    />
  );
}
