import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { FastingDashboardIcon } from "@/assets/icons/FastingDashboardIcon";
import {
  SinglePrayerWeeklyProgressDashboard,
  type SinglePrayerDayProgress,
  type SinglePrayerDayRingRenderArgs,
} from "@/components/molecules/SinglePrayerWeeklyProgressDashboard";
import type {
  MissedRamadanFastDayProgress,
  MissedRamadanFastWeekSummary,
} from "@/src/screens/private/goalprogressloggingscreen/missedRamadanFastsWeeklyData";
import { MissedRamadanFastDayRing } from "./MissedRamadanFastDayRing";
import { useDeleteFastingLog } from "@/src/api/mutations/useDeleteFastingLog";
import { rfs } from "@/src/utils/responsive";

export type MissedRamadanFastsWeeklyProgressDashboardProps = {
  weekSummary: MissedRamadanFastWeekSummary;
  selectedDayIndex?: number | null;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  /** Frame / week fetch in progress */
  loading?: boolean;
  /** Called after a kept-day log is deleted so the parent can refresh. */
  onDeleted?: () => void;
};

function mapMissedRamadanDayToSinglePrayerDay(
  day: MissedRamadanFastDayProgress,
): SinglePrayerDayProgress {
  const isCompleted = day.state === "completed";

  return {
    day: day.day,
    date: day.date,
    // Fasting rings show no count under the day label (Figma).
    prayersLogged: 0,
    isLogged: isCompleted,
    isBestDay: false,
    isToday: day.isToday,
    isMenstruation: Boolean(day.isMenstruating),
    isFuture:
      day.state === "future" ||
      day.state === "planned" ||
      day.state === "plannedToday",
    canDelete: day.canDelete,
  };
}

export function MissedRamadanFastsWeeklyProgressDashboard({
  weekSummary,
  selectedDayIndex,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  loading = false,
  onDeleted,
}: MissedRamadanFastsWeeklyProgressDashboardProps) {
  const { t } = useTranslation();
  const { mutate: deleteFastLog, isPending: isDeletingLog } =
    useDeleteFastingLog();

  const mappedWeekDays = useMemo(
    () => weekSummary.weekDays.map(mapMissedRamadanDayToSinglePrayerDay),
    [weekSummary.weekDays],
  );

  const defaultSelectedIndex =
    selectedDayIndex ??
    Math.max(
      mappedWeekDays.findIndex((day) => day.isToday),
      0,
    );

  const vsLastWeek = weekSummary.showPreviousWeekStat
    ? weekSummary.completedFastsThisWeek -
      weekSummary.previousWeekCompletedCount
    : null;

  const renderDayRing = useCallback(
    (args: SinglePrayerDayRingRenderArgs) => {
      const missedDay = weekSummary.weekDays[args.index];
      if (!missedDay) return null;

      return (
        <MissedRamadanFastDayRing
          size={args.size}
          state={missedDay.state}
          isMenstruating={Boolean(missedDay.isMenstruating)}
          isPlanned={Boolean(missedDay.isPlanned)}
        />
      );
    },
    [weekSummary.weekDays],
  );

  const handleDeleteLog = useCallback(
    (date: string) => {
      deleteFastLog(
        { fastingType: "MISSED_RAMADAN", date },
        {
          onSuccess: () => {
            onDeleted?.();
          },
        },
      );
    },
    [deleteFastLog, onDeleted],
  );

  return (
    <SinglePrayerWeeklyProgressDashboard
      weekDays={mappedWeekDays}
      weekRangeLabel={weekSummary.weekRangeLabel}
      weekFraction={weekSummary.weekFraction}
      streakDays={weekSummary.streakDays}
      vsLastWeek={vsLastWeek}
      motivationalQuote={
        loading ? "---" : weekSummary.motivationalQuote
      }
      selectedDayIndex={defaultSelectedIndex}
      onDayPress={onDayPress}
      onPrevWeek={onPrevWeek}
      onNextWeek={onNextWeek}
      loading={loading}
      allowLogDeletion
      onDeleteLog={handleDeleteLog}
      isDeletingLog={isDeletingLog}
      renderDayRing={renderDayRing}
      comparisonVariant="fasts"
      statsRow={
        <View style={styles.statsRow}>
          <FastingDashboardIcon size={28} color={Colors.light.seagreen} />
          <Text style={styles.statsText} numberOfLines={1}>
            <Text style={styles.statsCount}>
              {loading ? "---" : weekSummary.completedFastsThisWeek}
            </Text>{" "}
            {loading
              ? ""
              : t("progressLogging.missedRamadanWeeklyTotalFasts")}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexWrap: "nowrap",
    transform: [{ translateX: -12 }],
  },
  statsText: {
    color: Colors.light.white,
    fontSize: rfs(13),
    fontFamily: fonts.primary.medium,
    flexShrink: 1,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  statsCount: {
    color: Colors.light.white,
    fontWeight: "600",
    fontSize: rfs(20),
    fontFamily: fonts.primary.bold,
    letterSpacing: 0.1,
  },
});
