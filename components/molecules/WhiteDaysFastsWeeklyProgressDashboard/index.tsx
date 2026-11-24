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
  WhiteDaysFastDayProgress,
  WhiteDaysFastWeekSummary,
} from "@/src/screens/private/goalprogressloggingscreen/whiteDaysFastsWeeklyData";
import { WhiteDaysFastDayRing } from "./WhiteDaysFastDayRing";
import { useDeleteFastingLog } from "@/src/api/mutations/useDeleteFastingLog";
import { formatMotivationalQuoteForThreeLines } from "@/src/utils/formatMotivationalQuoteForThreeLines";

export type WhiteDaysFastsWeeklyProgressDashboardProps = {
  weekSummary: WhiteDaysFastWeekSummary;
  selectedDayIndex?: number | null;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  /** Frame / week fetch in progress — skeleton like other prayer dashboards. */
  loading?: boolean;
  /** Called after a completed log is deleted so the parent can refresh. */
  onDeleted?: () => void;
};

function isWhiteDaysFutureDate(date: string, isToday: boolean): boolean {
  if (isToday || !date) return false;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return date.slice(0, 10) > `${yyyy}-${mm}-${dd}`;
}

function mapWhiteDaysDayToSinglePrayerDay(
  day: WhiteDaysFastDayProgress,
): SinglePrayerDayProgress {
  const isCompleted = day.state === "completed";
  const isFuture =
    day.state === "planned" || isWhiteDaysFutureDate(day.date, day.isToday);

  return {
    day: day.day,
    date: day.date,
    prayersLogged: isCompleted ? 1 : 0,
    isLogged: isCompleted,
    isBestDay: false,
    isToday: day.isToday,
    isMenstruation: day.isMenstruating,
    isFuture,
    canDelete: day.canDelete,
  };
}

export function WhiteDaysFastsWeeklyProgressDashboard({
  weekSummary,
  selectedDayIndex,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  loading = false,
  onDeleted,
}: WhiteDaysFastsWeeklyProgressDashboardProps) {
  const { t } = useTranslation();
  const { mutateAsync: deleteFastLog, isPending: isDeletingLog } =
    useDeleteFastingLog();

  const mappedWeekDays = useMemo(
    () => weekSummary.weekDays.map(mapWhiteDaysDayToSinglePrayerDay),
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

    // 3-line breaks are week-1 only. Later weeks keep the raw quote (footer
    // uses the vs-last-week layout + 2-line quote).
    const isWeekOne = weekSummary.vsLastWeek == null;
    const forDisplay = (quote: string) =>
      isWeekOne ? formatMotivationalQuoteForThreeLines(quote) : quote;

    // Keep API week.motivation.message as-is; only insert display line breaks on week 1.
    const fromApi = weekSummary.motivationalQuote?.trim();
    if (fromApi) return forDisplay(fromApi);

    switch (weekSummary.motivationalQuoteKey) {
      case "allCompleted":
        return forDisplay(t("progressLogging.whiteDaysMotivationAllCompleted"));
      case "missed":
        return forDisplay(t("progressLogging.whiteDaysMotivationMissed"));
      case "completed":
        return forDisplay(t("progressLogging.whiteDaysMotivationCompleted"));
      case "approaching":
        return forDisplay(
          t("progressLogging.whiteDaysMotivationApproaching", {
            count: weekSummary.motivationalQuoteParams?.count ?? 1,
          }),
        );
      case "upcoming":
      default:
        return forDisplay(
          t("progressLogging.whiteDaysMotivationUpcoming", {
            day: weekSummary.motivationalQuoteParams?.day ?? 1,
          }),
        );
    }
  }, [
    loading,
    t,
    weekSummary.motivationalQuote,
    weekSummary.motivationalQuoteKey,
    weekSummary.motivationalQuoteParams?.count,
    weekSummary.motivationalQuoteParams?.day,
    weekSummary.vsLastWeek,
  ]);

  const totalFastsSuffix =
    weekSummary.completedFastsThisWeek === 1
      ? t("progressLogging.whiteDaysWeeklyTotalFastsSuffix_one")
      : t("progressLogging.whiteDaysWeeklyTotalFastsSuffix_other");

  const renderDayRing = useCallback(
    (args: SinglePrayerDayRingRenderArgs) => {
      const whiteDay = weekSummary.weekDays[args.index];
      if (!whiteDay) return null;

      // Booked-for-other-goal: today → todayDisabled; else inactive.
      // Future booked still uses future grey-ring UI (isFuture must stay true).
      const state = whiteDay.bookedFor
        ? whiteDay.isToday
          ? "todayDisabled"
          : "inactive"
        : whiteDay.state;

      return (
        <WhiteDaysFastDayRing
          size={args.size}
          state={state}
          isMenstruating={whiteDay.bookedFor ? false : whiteDay.isMenstruating}
          isWhiteDay={whiteDay.bookedFor ? false : whiteDay.isWhiteDay}
          isToday={whiteDay.isToday}
          isFuture={isWhiteDaysFutureDate(whiteDay.date, whiteDay.isToday)}
        />
      );
    },
    [weekSummary.weekDays],
  );

  const handleDeleteLog = useCallback(
    async (date: string) => {
      // Keep delete chrome + spinner until the API finishes.
      await deleteFastLog({ fastingType: "WHITE_DAYS", date });
      onDeleted?.();
    },
    [deleteFastLog, onDeleted],
  );

  return (
    <SinglePrayerWeeklyProgressDashboard
      weekDays={mappedWeekDays}
      weekRangeLabel={weekSummary.weekRangeLabel}
      weekFraction={weekSummary.weekFraction}
      streakDays={weekSummary.monthlyStreak}
      vsLastWeek={weekSummary.vsLastWeek}
      vsLastWeekDisplay={weekSummary.vsLastWeekDisplay}
      motivationalQuote={motivationalQuote}
      comparisonVariant="fasts"
      selectedDayIndex={defaultSelectedIndex}
      onDayPress={onDayPress}
      onPrevWeek={onPrevWeek}
      onNextWeek={onNextWeek}
      loading={loading}
      allowLogDeletion
      onDeleteLog={handleDeleteLog}
      isDeletingLog={isDeletingLog}
      renderDayRing={renderDayRing}
      compactWeekOneQuote
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
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexWrap: "nowrap",
    // Slight left of center — not flush with the streak row.
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
