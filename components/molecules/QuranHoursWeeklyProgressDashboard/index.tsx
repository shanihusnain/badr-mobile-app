import React, { useCallback, useMemo, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
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
  /** Fallback Material icon when `statsIconNode` is not provided. */
  statsIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  /** Custom stats leading icon (listening / tajweed). */
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

function mapQuranDayToSinglePrayerDay(
  day: QuranHoursDayProgress,
): SinglePrayerDayProgress {
  const showDuration =
    (day.minutesLogged > 0 || !!day.durationLabel) &&
    day.showDurationLabel !== false;

  // Grey "today" tab: only the real calendar day — never selectedDayIndex.
  const isToday = day.date
    ? day.date === getLocalTodayString()
    : !!day.isToday;

  return {
    day: day.day,
    date: day.date,
    prayersLogged: day.minutesLogged,
    isLogged: !!day.isLogged || day.minutesLogged > 0,
    isBestDay: day.isBestDay,
    isToday,
    isFuture: day.isFuture,
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
  statsIcon = "headphones",
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
          {statsIconNode ?? (
            <MaterialCommunityIcons
              name={statsIcon}
              size={20}
              color={Colors.light.lightblue}
            />
          )}
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
