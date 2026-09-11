import React, { useCallback, useMemo, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { QuranBlueIcon } from "@/assets/icons";
import {
  SinglePrayerWeeklyProgressDashboard,
  type SinglePrayerDayProgress,
} from "@/components/molecules/SinglePrayerWeeklyProgressDashboard";
import type { QuranHoursDayProgress } from "@/src/screens/private/goalprogressloggingscreen/quranHoursWeeklyData";
import {
  formatDayDuration,
  formatWeeklyHoursTotal,
} from "@/src/screens/private/goalprogressloggingscreen/quranHoursWeeklyData";
import { useDeleteQuranHoursLog } from "@/src/api/mutations/useDeleteQuranHoursLog";

export type QuranHoursWeeklyProgressDashboardProps = {
  weekDays: QuranHoursDayProgress[];
  weekRangeLabel?: string;
  weekFraction?: string;
  totalMinutesThisWeek?: number;
  streakDays?: number;
  vsLastWeek?: number | null;
  vsLastWeekDisplay?: string | null;
  motivationalQuote?: string;
  selectedDayIndex?: number;
  /** @deprecated Prefer `statsIconNode`. QuranBlueIcon is used by default. */
  statsIcon?: string;
  /** Custom stats leading icon; defaults to QuranBlueIcon. */
  statsIconNode?: ReactNode;
  /** Backend type e.g. LISTENING — enables long-press delete when set. */
  quranGoalType?: string | null;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  loading?: boolean;
  isGoalCompleted?: boolean;
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

function mapQuranDayToSinglePrayerDay(
  day: QuranHoursDayProgress,
): SinglePrayerDayProgress {
  const showDuration =
    (day.minutesLogged > 0 || !!day.durationLabel) &&
    day.showDurationLabel !== false;

  const dateKey = normalizeDayDate(day.date);
  // Cases:
  // - Today + log → grey tab + white labels (isToday)
  // - Past + log → green circle, muted labels, no tab
  // - Past + empty → solid grey circle, muted label, no tab
  const isToday = dateKey
    ? dateKey === getLocalTodayString()
    : !!day.isToday;

  return {
    day: day.day,
    date: dateKey ?? day.date,
    prayersLogged: day.minutesLogged,
    isLogged: !!day.isLogged || day.minutesLogged > 0,
    isBestDay: day.isBestDay,
    isToday,
    isFuture: isToday ? false : !!day.isFuture,
    canDelete: day.canDelete,
    durationLabel: showDuration
      ? day.durationLabel || formatDayDuration(day.minutesLogged)
      : undefined,
  };
}

export function QuranHoursWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "---",
  weekFraction = "---",
  totalMinutesThisWeek = 0,
  streakDays = 0,
  vsLastWeek = null,
  vsLastWeekDisplay = null,
  motivationalQuote = "",
  selectedDayIndex = 6,
  statsIconNode,
  quranGoalType = null,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  loading = false,
  isGoalCompleted = false,
}: QuranHoursWeeklyProgressDashboardProps) {
  const { t } = useTranslation();
  const { hours, minutes } = formatWeeklyHoursTotal(totalMinutesThisWeek);
  const { mutateAsync: deleteQuranHoursLog, isPending: isDeletingLog } =
    useDeleteQuranHoursLog();

  const allowLogDeletion = !!quranGoalType;

  const handleDeleteLog = useCallback(
    async (date: string) => {
      if (!quranGoalType) return;
      await deleteQuranHoursLog({ quranGoalType, date });
    },
    [deleteQuranHoursLog, quranGoalType],
  );

  const mappedWeekDays = useMemo(
    () => weekDays.map((day) => mapQuranDayToSinglePrayerDay(day)),
    [weekDays],
  );

  return (
    <SinglePrayerWeeklyProgressDashboard
      weekDays={mappedWeekDays}
      weekRangeLabel={weekRangeLabel}
      weekFraction={weekFraction}
      streakDays={streakDays}
      vsLastWeek={vsLastWeek}
      vsLastWeekDisplay={vsLastWeekDisplay}
      motivationalQuote={motivationalQuote}
      selectedDayIndex={selectedDayIndex}
      onDayPress={onDayPress}
      onPrevWeek={onPrevWeek}
      onNextWeek={onNextWeek}
      loading={loading}
      isGoalCompleted={isGoalCompleted}
      allowLogDeletion={allowLogDeletion}
      onDeleteLog={allowLogDeletion ? handleDeleteLog : undefined}
      isDeletingLog={isDeletingLog}
      comparisonVariant="hours"
      statsRow={
        <View style={styles.statsRow}>
          {statsIconNode ?? <QuranBlueIcon size={22} />}
          <Text style={styles.statsText} numberOfLines={1}>
            <Text style={styles.statsCount}>
              {loading ? "---" : `${hours}h ${minutes}m`}
            </Text>
            {loading ? "" : " " + t("progressLogging.totalHoursThisWeek")}
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
