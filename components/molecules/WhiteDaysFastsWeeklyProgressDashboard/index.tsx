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
import { deleteWhiteDaysFastLog } from "@/src/screens/private/goalprogressloggingscreen/whiteDaysFastsData";
import type {
  WhiteDaysFastDayProgress,
  WhiteDaysFastWeekSummary,
} from "@/src/screens/private/goalprogressloggingscreen/whiteDaysFastsWeeklyData";
import { WhiteDaysFastDayRing } from "./WhiteDaysFastDayRing";

export type WhiteDaysFastsWeeklyProgressDashboardProps = {
  weekSummary: WhiteDaysFastWeekSummary;
  selectedDayIndex?: number | null;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  /** Called after a completed log is deleted so the parent can refresh. */
  onDeleted?: () => void;
};

function mapWhiteDaysDayToSinglePrayerDay(
  day: WhiteDaysFastDayProgress,
): SinglePrayerDayProgress {
  const isCompleted = day.state === "completed";

  return {
    day: day.day,
    date: day.date,
    prayersLogged: isCompleted ? 1 : 0,
    isLogged: isCompleted,
    isBestDay: false,
    isToday: day.isToday,
    // Keep all White Days columns tappable; ring visuals come from renderDayRing.
    isFuture: false,
    isMenstruation: day.isMenstruating,
    canDelete: day.canDelete,
  };
}

export function WhiteDaysFastsWeeklyProgressDashboard({
  weekSummary,
  selectedDayIndex,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  onDeleted,
}: WhiteDaysFastsWeeklyProgressDashboardProps) {
  const { t } = useTranslation();

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
    switch (weekSummary.motivationalQuoteKey) {
      case "allCompleted":
        return t("progressLogging.whiteDaysMotivationAllCompleted");
      case "missed":
        return t("progressLogging.whiteDaysMotivationMissed");
      case "completed":
        return t("progressLogging.whiteDaysMotivationCompleted");
      case "upcoming":
      default:
        return t("progressLogging.whiteDaysMotivationUpcoming", {
          day: weekSummary.motivationalQuoteParams?.day ?? 1,
        });
    }
  }, [
    t,
    weekSummary.motivationalQuoteKey,
    weekSummary.motivationalQuoteParams?.day,
  ]);

  const totalFastsSuffix =
    weekSummary.completedFastsThisWeek === 1
      ? t("progressLogging.whiteDaysWeeklyTotalFastsSuffix_one")
      : t("progressLogging.whiteDaysWeeklyTotalFastsSuffix_other");

  const renderDayRing = useCallback(
    (args: SinglePrayerDayRingRenderArgs) => {
      const whiteDay = weekSummary.weekDays[args.index];
      if (!whiteDay) return null;

      return (
        <WhiteDaysFastDayRing
          size={args.size}
          state={whiteDay.state}
          isMenstruating={whiteDay.isMenstruating}
          isWhiteDay={whiteDay.isWhiteDay}
          isToday={whiteDay.isToday}
        />
      );
    },
    [weekSummary.weekDays],
  );

  const handleDeleteLog = useCallback(
    (date: string) => {
      const deleted = deleteWhiteDaysFastLog(date);
      if (deleted) {
        onDeleted?.();
      }
    },
    [onDeleted],
  );

  return (
    <SinglePrayerWeeklyProgressDashboard
      weekDays={mappedWeekDays}
      weekRangeLabel={weekSummary.weekRangeLabel}
      weekFraction={weekSummary.weekFraction}
      streakDays={weekSummary.monthlyStreak}
      vsLastWeek={null}
      motivationalQuote={motivationalQuote}
      selectedDayIndex={defaultSelectedIndex}
      onDayPress={onDayPress}
      onPrevWeek={onPrevWeek}
      onNextWeek={onNextWeek}
      allowLogDeletion
      onDeleteLog={handleDeleteLog}
      renderDayRing={renderDayRing}
      statsRow={
        <View style={styles.statsRow}>
          <FastingDashboardIcon size={28} color={Colors.light.seagreen} />
          <Text style={styles.statsText} numberOfLines={1}>
            <Text style={styles.statsCount}>
              {weekSummary.completedFastsThisWeek}
            </Text>
            {totalFastsSuffix}
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
    paddingLeft: 7,
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
