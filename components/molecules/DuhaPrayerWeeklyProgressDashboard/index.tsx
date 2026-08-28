import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  SinglePrayerWeeklyProgressDashboard,
  type SinglePrayerDayProgress,
  type SinglePrayerWeeklyProgressDashboardProps,
} from "@/components/molecules/SinglePrayerWeeklyProgressDashboard";

export type DuhaPrayerDayProgress = SinglePrayerDayProgress;

export type DuhaPrayerWeeklyProgressDashboardProps =
  SinglePrayerWeeklyProgressDashboardProps & {
    statsIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  };

export function DuhaPrayerWeeklyProgressDashboard({
  statsIcon: _statsIcon,
  ...props
}: DuhaPrayerWeeklyProgressDashboardProps) {
  return (
    <SinglePrayerWeeklyProgressDashboard
      {...props}
    />
  );
}
