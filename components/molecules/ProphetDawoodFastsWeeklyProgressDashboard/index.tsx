import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
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
  ProphetDawoodFastDayProgress,
  ProphetDawoodFastWeekSummary,
} from "@/src/screens/private/goalprogressloggingscreen/prophetDawoodFastsWeeklyData";
import { ProphetDawoodFastDayRing } from "./ProphetDawoodFastDayRing";
import { useDeleteFastingLog } from "@/src/api/mutations/useDeleteFastingLog";
import { DawoodCycleRefresh } from "@/assets/icons";

export type ProphetDawoodFastsWeeklyProgressDashboardProps = {
  weekSummary: ProphetDawoodFastWeekSummary;
  selectedDayIndex?: number | null;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  /** Frame / week fetch in progress */
  loading?: boolean;
  /** Called after a completed log is deleted so the parent can refresh. */
  onDeleted?: () => void;
};

function mapProphetDawoodDayToSinglePrayerDay(
  day: ProphetDawoodFastDayProgress,
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
    isFuture: day.state === "future" || day.state === "goalAchieved",
    canDelete: day.canDelete,
  };
}

export function ProphetDawoodFastsWeeklyProgressDashboard({
  weekSummary,
  selectedDayIndex,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  loading = false,
  onDeleted,
}: ProphetDawoodFastsWeeklyProgressDashboardProps) {
  const { t } = useTranslation();
  const { mutate: deleteFastLog, isPending: isDeletingLog } =
    useDeleteFastingLog();

  const mappedWeekDays = useMemo(
    () => weekSummary.weekDays.map(mapProphetDawoodDayToSinglePrayerDay),
    [weekSummary.weekDays],
  );

  const defaultSelectedIndex =
    selectedDayIndex ??
    Math.max(
      mappedWeekDays.findIndex((day) => day.isToday),
      0,
    );

  const motivationalQuote = useMemo(() => {
    if (loading) return "---";

    switch (weekSummary.motivationalQuoteKey) {
      case "completedToday":
        return t("progressLogging.dawoodMotivationCompletedToday");
      case "missed":
        return t("progressLogging.dawoodMotivationMissed");
      case "streakGrowing":
        return t("progressLogging.dawoodMotivationStreakGrowing");
      case "inProgress":
      default:
        return t("progressLogging.dawoodMotivationInProgress");
    }
  }, [loading, t, weekSummary.motivationalQuoteKey]);

  const totalFastsSuffix =
    weekSummary.completedFastsThisWeek === 1
      ? t("progressLogging.dawoodWeeklyTotalFastsSuffix_one")
      : t("progressLogging.dawoodWeeklyTotalFastsSuffix_other");

  const renderDayRing = useCallback(
    (args: SinglePrayerDayRingRenderArgs) => {
      const dawoodDay = weekSummary.weekDays[args.index];
      if (!dawoodDay) return null;

      return (
        <View style={styles.ringSlot}>
          <ProphetDawoodFastDayRing
            size={args.size}
            state={dawoodDay.state}
            isMenstruating={Boolean(dawoodDay.isMenstruating)}
          />
          {dawoodDay.showCycleRestartIcon && !dawoodDay.isMenstruating ? (
            <View style={styles.cycleRestartIcon}>
              <View style={styles.cycleRestartBadge}>
                <DawoodCycleRefresh />
              </View>
            </View>
          ) : null}
        </View>
      );
    },
    [weekSummary.weekDays],
  );

  const handleDeleteLog = useCallback(
    (date: string) => {
      deleteFastLog(
        { fastingType: "PROPHET_DAWOOD", date },
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
      vsLastWeek={null}
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
            </Text>
            {loading ? "" : totalFastsSuffix}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  ringSlot: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  cycleRestartIcon: {
    position: "absolute",
    right: -8,
    bottom: -5,
  },
  cycleRestartBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
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
