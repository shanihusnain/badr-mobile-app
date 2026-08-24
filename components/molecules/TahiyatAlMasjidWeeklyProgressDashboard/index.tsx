import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  SinglePrayerWeeklyProgressDashboard,
  type SinglePrayerDayProgress,
  type SinglePrayerWeeklyProgressDashboardProps,
} from "@/components/molecules/SinglePrayerWeeklyProgressDashboard";

export type TahiyatAlMasjidDayProgress = SinglePrayerDayProgress;

export type TahiyatAlMasjidWeeklyProgressDashboardProps =
  SinglePrayerWeeklyProgressDashboardProps & {
    statsIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  };

export function TahiyatAlMasjidWeeklyProgressDashboard({
  statsIcon: _statsIcon,
  ...props
}: TahiyatAlMasjidWeeklyProgressDashboardProps) {
  return (
    <SinglePrayerWeeklyProgressDashboard
      {...props}
      defaultMotivationalQuote="Masha'Allah, may Allah always fill your heart with His love and light!"
    />
  );
}
