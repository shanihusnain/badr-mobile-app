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
    isMenstruation: day.isMenstruating,
    isFuture: day.state === "planned",
    canDelete: day.canDelete,
  };
}

/** Display-only: keep API wording, insert breaks so week-1 footer shows 3 lines. */
function formatMotivationalQuoteForThreeLines(quote: string): string {
  const trimmed = quote.trim();
  if (!trimmed || trimmed.includes("\n")) return trimmed;

  const semiIndex = trimmed.indexOf(";");
  if (semiIndex >= 0) {
    const line1 = trimmed.slice(0, semiIndex + 1).trim();
    const rest = trimmed.slice(semiIndex + 1).trim();
    if (!rest) return line1;

    const andIndex = rest.lastIndexOf(" and ");
    if (andIndex > 0) {
      return `${line1}\n${rest.slice(0, andIndex).trim()}\n${rest.slice(andIndex).trim()}`;
    }

    const mid = Math.ceil(rest.length / 2);
    let splitAt = rest.lastIndexOf(" ", mid);
    if (splitAt <= 0) splitAt = rest.indexOf(" ", mid);
    if (splitAt > 0) {
      return `${line1}\n${rest.slice(0, splitAt).trim()}\n${rest.slice(splitAt).trim()}`;
    }
    return `${line1}\n${rest}`;
  }

  const words = trimmed.split(/\s+/);
  if (words.length < 3) return trimmed;
  const third = Math.ceil(words.length / 3);
  return [
    words.slice(0, third).join(" "),
    words.slice(third, third * 2).join(" "),
    words.slice(third * 2).join(" "),
  ]
    .filter(Boolean)
    .join("\n");
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
  const { mutate: deleteFastLog, isPending: isDeletingLog } =
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

    // Keep API week.motivation.message as-is; only insert display line breaks.
    const fromApi = weekSummary.motivationalQuote?.trim();
    if (fromApi) {
      return formatMotivationalQuoteForThreeLines(fromApi);
    }

    switch (weekSummary.motivationalQuoteKey) {
      case "allCompleted":
        return t("progressLogging.whiteDaysMotivationAllCompleted");
      case "missed":
        return t("progressLogging.whiteDaysMotivationMissed");
      case "completed":
        return t("progressLogging.whiteDaysMotivationCompleted");
      case "approaching":
        return t("progressLogging.whiteDaysMotivationApproaching", {
          count: weekSummary.motivationalQuoteParams?.count ?? 1,
        });
      case "upcoming":
      default:
        return t("progressLogging.whiteDaysMotivationUpcoming", {
          day: weekSummary.motivationalQuoteParams?.day ?? 1,
        });
    }
  }, [
    loading,
    t,
    weekSummary.motivationalQuote,
    weekSummary.motivationalQuoteKey,
    weekSummary.motivationalQuoteParams?.count,
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
      deleteFastLog(
        { fastingType: "WHITE_DAYS", date },
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
      streakDays={weekSummary.monthlyStreak}
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
