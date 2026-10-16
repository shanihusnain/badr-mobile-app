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
  MondayThursdayFastDayProgress,
  MondayThursdayFastWeekSummary,
} from "@/src/screens/private/goalprogressloggingscreen/mondayThursdayFastsWeeklyData";
import { MondayThursdayFastDayRing } from "./MondayThursdayFastDayRing";
import { useDeleteFastingLog } from "@/src/api/mutations/useDeleteFastingLog";

export type MondayThursdayFastsWeeklyProgressDashboardProps = {
  weekSummary: MondayThursdayFastWeekSummary;
  selectedDayIndex?: number | null;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  /** Frame / week fetch in progress */
  loading?: boolean;
  /** Called after a completed log is deleted so the parent can refresh. */
  onDeleted?: () => void;
};

function mapMondayThursdayDayToSinglePrayerDay(
  day: MondayThursdayFastDayProgress,
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
    // Keep planned / today / missed days pressable; rings own the visuals.
    isFuture:
      day.state === "future" ||
      day.state === "goalAchieved" ||
      day.state === "disabledPast" ||
      day.state === "todayDisabled",
    canDelete: day.canDelete,
  };
}

export function MondayThursdayFastsWeeklyProgressDashboard({
  weekSummary,
  selectedDayIndex,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  loading = false,
  onDeleted,
}: MondayThursdayFastsWeeklyProgressDashboardProps) {
  const { t } = useTranslation();
  const { mutate: deleteFastLog, isPending: isDeletingLog } =
    useDeleteFastingLog();

  const mappedWeekDays = useMemo(
    () => weekSummary.weekDays.map(mapMondayThursdayDayToSinglePrayerDay),
    [weekSummary.weekDays],
  );

  const defaultSelectedIndex =
    selectedDayIndex ??
    Math.max(
      mappedWeekDays.findIndex((day) => day.isToday),
      0,
    );

  const vsLastWeek = weekSummary.showPreviousWeekStat
    ? weekSummary.weekOverWeekDelta
    : null;

  const motivationalQuote = useMemo(() => {
    if (loading) return "---";

    if (weekSummary.motivationalQuote?.trim()) {
      return weekSummary.motivationalQuote.trim();
    }

    switch (weekSummary.motivationalQuoteKey) {
      case "weekOneProgress":
        return t("progressLogging.mondayThursdayWeekOneMotivation", {
          week: weekSummary.motivationalQuoteParams?.week ?? 1,
          percent: weekSummary.motivationalQuoteParams?.percent ?? 0,
        });
      case "buildingMomentum":
        return t("progressLogging.mondayThursdayBuildingMomentum", {
          count: weekSummary.motivationalQuoteParams?.count ?? 0,
        });
      case "tabarakAllah":
        return t("progressLogging.mondayThursdayTabarakAllahMotivation");
      case "stayConsistent":
        return t("progressLogging.mondayThursdayStayConsistentMotivation", {
          percent: weekSummary.motivationalQuoteParams?.percent ?? 0,
        });
      case "planNext":
      default:
        return t("progressLogging.mondayThursdayPlanNextMotivation");
    }
  }, [
    loading,
    t,
    weekSummary.motivationalQuote,
    weekSummary.motivationalQuoteKey,
    weekSummary.motivationalQuoteParams,
  ]);

  const streakLabelText = useMemo(
    () =>
      loading
        ? "---"
        : t("progressLogging.mondayThursdayWeeklyStreak", {
            count: weekSummary.streakWeeks,
          }),
    [loading, t, weekSummary.streakWeeks],
  );

  const renderDayRing = useCallback(
    (args: SinglePrayerDayRingRenderArgs) => {
      const mondayThursdayDay = weekSummary.weekDays[args.index];
      if (!mondayThursdayDay) return null;

      return (
        <MondayThursdayFastDayRing
          size={args.size}
          state={mondayThursdayDay.state}
          isMenstruating={Boolean(mondayThursdayDay.isMenstruating)}
          isPlanned={Boolean(mondayThursdayDay.isSelected)}
          isToday={mondayThursdayDay.isToday}
        />
      );
    },
    [weekSummary.weekDays],
  );

  const handleDeleteLog = useCallback(
    (date: string) => {
      deleteFastLog(
        { fastingType: "MONDAY_THURSDAY", date },
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
      streakDays={weekSummary.streakWeeks}
      streakLabelText={streakLabelText}
      vsLastWeek={vsLastWeek}
      motivationalQuote={motivationalQuote}
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
              : t("progressLogging.mondayThursdayWeeklyTotalFasts")}
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
    fontSize: 13,
    fontFamily: fonts.primary.medium,
    flexShrink: 1,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  statsCount: {
    color: Colors.light.white,
    fontWeight: "600",
    fontSize: 20,
    fontFamily: fonts.primary.bold,
    letterSpacing: 0.1,
  },
});
