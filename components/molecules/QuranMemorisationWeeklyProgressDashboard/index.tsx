import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { QuranBlueIcon } from "@/assets/icons";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import {
  SinglePrayerWeeklyProgressDashboard,
  type SinglePrayerDayProgress,
} from "@/components/molecules/SinglePrayerWeeklyProgressDashboard";
import type { MemorisationDayProgress } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationWeeklyData";
import { useDeleteQuranHoursLog } from "@/src/api/mutations/useDeleteQuranHoursLog";

export type QuranMemorisationWeeklyProgressDashboardProps = {
  weekDays: MemorisationDayProgress[];
  weekRangeLabel?: string;
  weekFraction?: string;
  surahName?: string;
  totalAyahsThisWeek?: number;
  memorizedAyahs?: number;
  totalAyahs?: number;
  remainingAyahs?: number;
  progressPercent?: number;
  completed?: boolean;
  streakDays?: number;
  vsLastWeek?: number | null;
  motivationalQuote?: string;
  selectedDayIndex?: number;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  currentWeek?: number;
  totalWeeks?: number;
  loading?: boolean;
  /** Backend type e.g. MEMORIZATION_SURAH — enables long-press delete when set. */
  quranGoalType?: string | null;
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

function mapMemorisationDayToSinglePrayerDay(
  day: MemorisationDayProgress,
  formatNumber: (value: number) => string,
): SinglePrayerDayProgress {
  const dateKey = normalizeDayDate(day.date);
  const isToday = dateKey
    ? dateKey === getLocalTodayString()
    : !!day.isToday;

  // Prefer API ayah range (e.g. "1-7"); fall back to logged count.
  const ayatLabel =
    day.countLabel?.trim() ||
    (day.ayahsLogged > 0 ? formatNumber(day.ayahsLogged) : undefined);

  return {
    day: day.day,
    date: dateKey ?? day.date,
    prayersLogged: day.ayahsLogged,
    isLogged: !!day.isLogged || day.ayahsLogged > 0,
    isBestDay: day.isBestDay,
    isToday,
    isFuture: isToday ? false : !!day.isFuture,
    canDelete: day.canDelete,
    durationLabel: ayatLabel,
  };
}

export function QuranMemorisationWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "---",
  weekFraction,
  totalAyahsThisWeek = 0,
  completed = false,
  streakDays = 0,
  vsLastWeek = null,
  motivationalQuote = "",
  selectedDayIndex = 6,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  currentWeek = 1,
  totalWeeks = 4,
  loading = false,
  quranGoalType = null,
}: QuranMemorisationWeeklyProgressDashboardProps) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const { mutateAsync: deleteQuranLog, isPending: isDeletingLog } =
    useDeleteQuranHoursLog();

  const allowLogDeletion = !!quranGoalType;

  const handleDeleteLog = useCallback(
    async (date: string) => {
      if (!quranGoalType) return;
      await deleteQuranLog({ quranGoalType, date });
    },
    [deleteQuranLog, quranGoalType],
  );

  const mappedWeekDays = useMemo(
    () =>
      weekDays.map((day) =>
        mapMemorisationDayToSinglePrayerDay(day, formatNumber),
      ),
    [weekDays, formatNumber],
  );

  const resolvedWeekFraction =
    weekFraction?.replace(/\s+/g, "") || `${currentWeek}/${totalWeeks}`;

  return (
    <SinglePrayerWeeklyProgressDashboard
      weekDays={mappedWeekDays}
      weekRangeLabel={weekRangeLabel}
      weekFraction={resolvedWeekFraction}
      streakDays={streakDays}
      vsLastWeek={vsLastWeek}
      motivationalQuote={motivationalQuote}
      selectedDayIndex={selectedDayIndex}
      onDayPress={onDayPress}
      onPrevWeek={onPrevWeek}
      onNextWeek={onNextWeek}
      loading={loading}
      isGoalCompleted={completed}
      allowLogDeletion={allowLogDeletion}
      onDeleteLog={allowLogDeletion ? handleDeleteLog : undefined}
      isDeletingLog={isDeletingLog}
      comparisonVariant="recitations"
      statsRow={
        <View style={styles.statsRow}>
          <QuranBlueIcon size={23} />
          <Text style={styles.statsText} numberOfLines={1}>
            <Text style={styles.statsCount}>
              {loading ? "---" : formatNumber(totalAyahsThisWeek)}
            </Text>
            {loading ? "" : " " + t("progressLogging.totalAyahsThisWeek")}
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
