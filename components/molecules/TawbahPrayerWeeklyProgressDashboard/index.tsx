import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  SinglePrayerWeeklyProgressDashboard,
  type SinglePrayerDayProgress,
  type SinglePrayerWeeklyProgressDashboardProps,
} from "@/components/molecules/SinglePrayerWeeklyProgressDashboard";

export type TawbahPrayerDayProgress = SinglePrayerDayProgress;

export type TawbahPrayerWeeklyProgressDashboardProps =
  SinglePrayerWeeklyProgressDashboardProps & {
    statsIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  };

export function TawbahPrayerWeeklyProgressDashboard({
  statsIcon: _statsIcon,
  ...props
}: TawbahPrayerWeeklyProgressDashboardProps) {
  return (
    <SinglePrayerWeeklyProgressDashboard
      {...props}
      defaultMotivationalQuote="Masha'Allah, may Allah always fill your heart with His love and light!"
    />
  );
}
