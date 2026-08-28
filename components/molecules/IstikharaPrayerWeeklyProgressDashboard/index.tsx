import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  SinglePrayerWeeklyProgressDashboard,
  type SinglePrayerDayProgress,
  type SinglePrayerWeeklyProgressDashboardProps,
} from "@/components/molecules/SinglePrayerWeeklyProgressDashboard";

export type IstikharaPrayerDayProgress = SinglePrayerDayProgress;

export type IstikharaPrayerWeeklyProgressDashboardProps =
  SinglePrayerWeeklyProgressDashboardProps & {
    statsIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  };

export function IstikharaPrayerWeeklyProgressDashboard({
  statsIcon: _statsIcon,
  ...props
}: IstikharaPrayerWeeklyProgressDashboardProps) {
  return (
    <SinglePrayerWeeklyProgressDashboard
      {...props}
    />
  );
}
