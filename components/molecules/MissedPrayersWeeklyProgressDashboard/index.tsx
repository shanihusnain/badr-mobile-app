import React from "react";
import {
  SinglePrayerWeeklyProgressDashboard,
  type SinglePrayerDayProgress,
  type SinglePrayerWeeklyProgressDashboardProps,
} from "@/components/molecules/SinglePrayerWeeklyProgressDashboard";

export type MissedPrayersDayProgress = SinglePrayerDayProgress;

export type MissedPrayersWeeklyProgressDashboardProps =
  SinglePrayerWeeklyProgressDashboardProps;

export function MissedPrayersWeeklyProgressDashboard(
  props: MissedPrayersWeeklyProgressDashboardProps,
) {
  return (
    <SinglePrayerWeeklyProgressDashboard
      {...props}
      defaultMotivationalQuote="Masha'Allah, may Allah always fill your heart with His love and light!"
    />
  );
}
