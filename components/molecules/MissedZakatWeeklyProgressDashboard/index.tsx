import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { DashBoardHandHeartIcon } from "@/assets/icons/DashBoardHandHeartIcon";
import {
  SinglePrayerWeeklyProgressDashboard,
  type SinglePrayerDayProgress,
} from "@/components/molecules/SinglePrayerWeeklyProgressDashboard";
import { useDeleteSadaqahLog } from "@/src/api/mutations/useDeleteSadaqahLog";

export type MissedZakatDayProgress = {
  day: string;
  date?: string;
  isLogged?: boolean;
  amountLogged: number;
  isBestDay?: boolean;
  isFuture?: boolean;
  isToday?: boolean;
  isBlurDay?: boolean;
  canDelete?: boolean;
};

export type MissedZakatWeeklyProgressDashboardProps = {
  weekDays: MissedZakatDayProgress[];
  weekRangeLabel?: string;
  weekFraction?: string;
  totalSpentThisWeek?: number;
  streakDays?: number;
  remainingAmount?: number;
  selectedDayIndex?: number;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  loading?: boolean;
  /** Bump parent refresh after a successful delete. */
  onDeleted?: () => void;
  allowLogDeletion?: boolean;
  sadaqahType?: string;
  /** ISO currency code from the goal frame (`USD`, `SAR`, …). */
  currencyCode?: string;
};

function getLocalTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function normalizeDayDate(value?: string): string | null {
  if (!value) return null;
  const slice = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(slice) ? slice : null;
}

function mapMissedZakatDayToSinglePrayerDay(
  day: MissedZakatDayProgress,
  formatAmount: (value: number) => string,
): SinglePrayerDayProgress {
  const hasLog = day.amountLogged > 0 || !!day.isLogged;
  const dateKey = normalizeDayDate(day.date);
  const isToday = dateKey
    ? dateKey === getLocalTodayString()
    : !!day.isToday;

  return {
    day: day.day,
    date: dateKey ?? day.date,
    prayersLogged: hasLog ? Math.max(1, day.amountLogged) : 0,
    isLogged: hasLog,
    isBestDay: !!day.isBestDay && hasLog,
    isToday,
    isFuture: isToday ? false : !!day.isFuture || !!day.isBlurDay,
    canDelete: day.canDelete,
    durationLabel: hasLog ? formatAmount(day.amountLogged) : undefined,
  };
}

export function MissedZakatWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  totalSpentThisWeek = 30,
  streakDays = 0,
  remainingAmount = 70,
  selectedDayIndex = 3,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  loading = false,
  onDeleted,
  allowLogDeletion = true,
  sadaqahType = "MISSED_ZAKAT",
  currencyCode = "USD",
}: MissedZakatWeeklyProgressDashboardProps) {
  const { mutateAsync: deleteSadaqahLog, isPending: isDeletingLog } =
    useDeleteSadaqahLog();
  const currency = String(currencyCode || "USD")
    .trim()
    .toUpperCase();
  const formatAmount = useCallback(
    (value: number) => `${currency} ${value}`,
    [currency],
  );

  const mappedWeekDays = useMemo(
    () =>
      weekDays.map((day) =>
        mapMissedZakatDayToSinglePrayerDay(day, formatAmount),
      ),
    [weekDays, formatAmount],
  );

  const handleDeleteLog = useCallback(
    async (date: string) => {
      await deleteSadaqahLog({ sadaqahType, logDate: date });
      onDeleted?.();
    },
    [deleteSadaqahLog, onDeleted, sadaqahType],
  );

  const motivationalQuote = loading
    ? "---"
    : `Zakat is the right of the poor and the command of Allah—${formatAmount(remainingAmount)} remaining!`;

  return (
    <SinglePrayerWeeklyProgressDashboard
      weekDays={mappedWeekDays}
      weekRangeLabel={weekRangeLabel}
      weekFraction={weekFraction}
      streakDays={streakDays}
      vsLastWeek={null}
      motivationalQuote={motivationalQuote}
      selectedDayIndex={selectedDayIndex}
      onDayPress={onDayPress}
      onPrevWeek={onPrevWeek}
      onNextWeek={onNextWeek}
      loading={loading}
      isGoalCompleted={remainingAmount <= 0}
      allowLogDeletion={allowLogDeletion}
      onDeleteLog={allowLogDeletion ? handleDeleteLog : undefined}
      isDeletingLog={isDeletingLog}
      statsRow={
        <View style={styles.statsRow}>
          <DashBoardHandHeartIcon size={24} color={Colors.light.lightblue} />
          <Text style={styles.statsText} numberOfLines={1}>
            <Text style={styles.statsCount}>
              {loading ? "---" : formatAmount(totalSpentThisWeek)}
            </Text>
            {loading ? "" : " spent in total this week"}
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
