import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  SinglePrayerWeeklyProgressDashboard,
  type SinglePrayerDayProgress,
  type SinglePrayerWeeklyProgressDashboardProps,
} from "@/components/molecules/SinglePrayerWeeklyProgressDashboard";

export type TahiyatUlWudhuDayProgress = SinglePrayerDayProgress;

export type TahiyatUlWudhuWeeklyProgressDashboardProps =
  SinglePrayerWeeklyProgressDashboardProps & {
    statsIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  };

export function TahiyatUlWudhuWeeklyProgressDashboard({
  statsIcon: _statsIcon,
  ...props
}: TahiyatUlWudhuWeeklyProgressDashboardProps) {
  return <SinglePrayerWeeklyProgressDashboard {...props} />;
}
