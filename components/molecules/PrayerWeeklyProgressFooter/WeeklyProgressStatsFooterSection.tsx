import React, { type ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import {
  PrayerWeeklyProgressFooter,
  PRAYER_WEEKLY_LATER_WEEK_MARGIN_TOP_ADJUSTMENT,
  type PrayerWeeklyProgressFooterProps,
} from "./index";

export type WeeklyProgressStatsFooterSectionProps = {
  vsLastWeek?: number | null;
  statsRow: ReactNode;
  footerProps: PrayerWeeklyProgressFooterProps;
};

/** Shared stats row + footer block with consistent week 1 / 2–4 spacing. */
export function WeeklyProgressStatsFooterSection({
  vsLastWeek = null,
  statsRow,
  footerProps,
}: WeeklyProgressStatsFooterSectionProps) {
  const isWeekOne = vsLastWeek == null;

  return (
    <View
      style={[
        styles.container,
        isWeekOne ? styles.containerWeekOne : styles.containerLaterWeek,
      ]}
    >
      {statsRow}
      <PrayerWeeklyProgressFooter {...footerProps} vsLastWeek={vsLastWeek} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  containerWeekOne: {
    marginTop: 1,
  },
  containerLaterWeek: {
    marginTop: 1 + PRAYER_WEEKLY_LATER_WEEK_MARGIN_TOP_ADJUSTMENT,
  },
});
