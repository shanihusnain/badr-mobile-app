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

export type FidyaDayProgress = {
  day: string;
  /** YYYY-MM-DD — required for delete API. */
  date?: string;
  count: number;
  isBestDay?: boolean;
  isToday?: boolean;
  isFuture?: boolean;
  /**
   * Blur day: days after the user achieves 100% of their goal.
   */
  isBlurDay?: boolean;
  canDelete?: boolean;
};

export type FidyaWeeklyProgressDashboardProps = {
  weekDays: FidyaDayProgress[];
  weekRangeLabel?: string;
  weekFraction?: string;
  totalThisWeek?: number;
  streakDays?: number;
  /** `null` on week 1 / no comparison. */
  vsLastWeek?: number | null;
  vsLastWeekDisplay?: string | null;
  motivationalQuote?: string;
  selectedDayIndex?: number;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  loading?: boolean;
  onDeleted?: () => void;
  allowLogDeletion?: boolean;
  sadaqahType?: string;
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

function mapFidyaDayToSinglePrayerDay(
  day: FidyaDayProgress,
): SinglePrayerDayProgress {
  const hasLog = day.count > 0;
  const dateKey = normalizeDayDate(day.date);
  const isToday = dateKey
    ? dateKey === getLocalTodayString()
    : !!day.isToday;

  return {
    day: day.day,
    date: dateKey ?? day.date,
    prayersLogged: hasLog ? Math.max(1, day.count) : 0,
    isLogged: hasLog,
    isBestDay: !!day.isBestDay && hasLog,
    isToday,
    // Blur / post-completion days stay non-interactive like future days.
    isFuture: isToday ? false : !!day.isFuture || !!day.isBlurDay,
    canDelete: day.canDelete,
    durationLabel: hasLog ? String(day.count) : undefined,
  };
}

export function FidyaWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  totalThisWeek = 3,
  streakDays = 1,
  vsLastWeek = null,
  vsLastWeekDisplay = null,
  motivationalQuote = "Remember, Fidya is a chance to give back and invite barakah into your life.",
  selectedDayIndex = 6,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  loading = false,
  onDeleted,
  allowLogDeletion = true,
  sadaqahType = "FIDYA",
}: FidyaWeeklyProgressDashboardProps) {
  const { mutateAsync: deleteSadaqahLog, isPending: isDeletingLog } =
    useDeleteSadaqahLog();

  const mappedWeekDays = useMemo(
    () => weekDays.map(mapFidyaDayToSinglePrayerDay),
    [weekDays],
  );

  const isGoalCompleted = useMemo(
    () => weekDays.some((day) => day.isBlurDay),
    [weekDays],
  );

  const handleDeleteLog = useCallback(
    async (date: string) => {
      await deleteSadaqahLog({ sadaqahType, logDate: date });
      onDeleted?.();
    },
    [deleteSadaqahLog, onDeleted, sadaqahType],
  );

  return (
    <SinglePrayerWeeklyProgressDashboard
      weekDays={mappedWeekDays}
      weekRangeLabel={weekRangeLabel}
      weekFraction={weekFraction}
      streakDays={streakDays}
      vsLastWeek={vsLastWeek}
      vsLastWeekDisplay={vsLastWeekDisplay}
      comparisonVariant="hours"
      motivationalQuote={loading ? "---" : motivationalQuote}
      selectedDayIndex={selectedDayIndex}
      onDayPress={onDayPress}
      onPrevWeek={onPrevWeek}
      onNextWeek={onNextWeek}
      loading={loading}
      isGoalCompleted={isGoalCompleted}
      allowLogDeletion={allowLogDeletion}
      onDeleteLog={allowLogDeletion ? handleDeleteLog : undefined}
      isDeletingLog={isDeletingLog}
      showTodayChip
      greenActivityCaptions
      statsRow={
        <View style={styles.statsRow}>
          <DashBoardHandHeartIcon size={24} color={Colors.light.lightblue} />
          <Text style={styles.statsText} numberOfLines={1}>
            <Text style={styles.statsCount}>
              {loading ? "---" : totalThisWeek}
            </Text>
            {loading ? "" : " total meals this week"}
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
