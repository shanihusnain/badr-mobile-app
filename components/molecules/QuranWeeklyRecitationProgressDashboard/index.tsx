import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { QuranRecitationBySurahFlowCardImage } from "@/assets/icons";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import {
  SinglePrayerWeeklyProgressDashboard,
  type SinglePrayerDayProgress,
  type SinglePrayerDayRingRenderArgs,
} from "@/components/molecules/SinglePrayerWeeklyProgressDashboard";
import type {
  QuranRecitationDayProgress,
  WeeklySurahDashboardItem,
  WeeklySurahDayStatus,
} from "@/src/screens/private/goalprogressloggingscreen/quranRecitationWeeklyData";
import { mapDayProgressToWeeklyStatus } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationWeeklyData";
import type { QuranCompletionDayProgress } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationCompletionWeeklyData";
import { useDeleteQuranHoursLog } from "@/src/api/mutations/useDeleteQuranHoursLog";
import { QuranRecitationDayRing } from "./QuranRecitationDayRing";
import { QuranRecitationWeeklyDayCircle } from "./QuranRecitationWeeklyDayCircle";

export type QuranWeeklyRecitationProgressDashboardProps = {
  weekDays: QuranRecitationDayProgress[];
  weekRangeLabel?: string;
  weekFraction?: string;
  totalRecitationsThisWeek?: number;
  dailyTarget?: number;
  /** When set, stats row uses this as the period target (weekly goals). */
  weekRecitationTarget?: number;
  streakDays?: number;
  vsLastWeek?: number | null;
  motivationalQuote?: string;
  visualizationMode?: "daily" | "weekly" | "completion" | "juz";
  weeklySurahItems?: WeeklySurahDashboardItem[];
  completionWeekDays?: QuranCompletionDayProgress[];
  completionTarget?: number;
  completionsLoggedThisWeek?: number;
  selectedDayIndex?: number;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  selectedSurahId?: string;
  surahContextLabel?: string;
  lockSurahSelection?: boolean;
  loading?: boolean;
  isGoalCompleted?: boolean;
  /** Backend type e.g. RECITATION_SURAH — enables long-press delete when set. */
  quranGoalType?: string | null;
  /**
   * Active carousel item (surah number).
   * Kept on the payload for when the API supports scoped deletes.
   */
  itemNumber?: number | null;
  itemType?: "SURAH" | "JUZ" | "HIZB" | string | null;
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

function mapRecitationDayToSinglePrayerDay(
  day: QuranRecitationDayProgress,
  dailyTarget: number,
  formatNumber: (value: number) => string,
  showDayFraction: boolean,
): SinglePrayerDayProgress {
  const dateKey = normalizeDayDate(day.date);
  const isToday = dateKey
    ? dateKey === getLocalTodayString()
    : day.dayType === "today";
  const isFuture = day.dayType === "future";
  const logged = day.recitationsCompleted > 0;

  return {
    day: day.day,
    date: dateKey ?? day.date,
    prayersLogged: day.recitationsCompleted,
    isLogged: logged,
    isBestDay: day.isBestDay,
    isToday,
    isFuture: isToday ? false : isFuture,
    canDelete: day.canDelete,
    // Multi-arc daily rings show N/N; solid 1× and weekly circles do not.
    durationLabel: showDayFraction
      ? `${formatNumber(day.recitationsCompleted)}/${formatNumber(dailyTarget)}`
      : "",
  };
}

function mapCompletionDayToSinglePrayerDay(
  day: QuranCompletionDayProgress,
  isJuzMode: boolean,
): SinglePrayerDayProgress {
  const isToday = day.dayType === "today";
  const isFuture = day.dayType === "future";
  const label =
    day.hasActivity && day.completionNumber
      ? isJuzMode
        ? `J${day.completionNumber}`
        : `C${day.completionNumber}`
      : day.day;

  return {
    day: label,
    prayersLogged: day.hasActivity ? Math.max(day.activityScore, 1) : 0,
    isLogged: day.hasActivity,
    isBestDay: day.isBestDay,
    isToday,
    isFuture: isToday ? false : isFuture,
    durationLabel: day.hasActivity ? day.computedLabel : undefined,
  };
}

function mapWeeklySurahDayToSinglePrayerDay(
  day: WeeklySurahDashboardItem["weekDays"][number],
): SinglePrayerDayProgress {
  const isLogged = day.status === "completed";

  return {
    day: day.day,
    prayersLogged: isLogged ? 1 : 0,
    isLogged,
    isFuture: day.status === "pending",
    isToday: false,
    durationLabel: "",
  };
}

export function QuranWeeklyRecitationProgressDashboard({
  weekDays,
  weekRangeLabel = "---",
  weekFraction = "1/4",
  totalRecitationsThisWeek = 0,
  dailyTarget = 1,
  weekRecitationTarget,
  streakDays = 0,
  vsLastWeek = null,
  motivationalQuote = "",
  visualizationMode = "daily",
  weeklySurahItems = [],
  completionWeekDays = [],
  completionTarget = 3,
  completionsLoggedThisWeek = 0,
  selectedDayIndex,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  selectedSurahId,
  loading = false,
  isGoalCompleted = false,
  quranGoalType = null,
  itemNumber = null,
  itemType = null,
}: QuranWeeklyRecitationProgressDashboardProps) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const { mutateAsync: deleteQuranLog, isPending: isDeletingLog } =
    useDeleteQuranHoursLog();
  const isWeeklyMode = visualizationMode === "weekly";
  const isWeeklySurahCarouselMode =
    isWeeklyMode && weeklySurahItems.length > 0;
  const isCompletionMode =
    visualizationMode === "completion" && completionWeekDays.length > 0;
  const isJuzMode =
    visualizationMode === "juz" && completionWeekDays.length > 0;
  const isCompletionStyleMode = isCompletionMode || isJuzMode;
  const showDayFraction = !isWeeklyMode && dailyTarget > 1;
  const allowLogDeletion = !!quranGoalType && !isCompletionStyleMode;

  const handleDeleteLog = useCallback(
    async (date: string) => {
      if (!quranGoalType) return;
      await deleteQuranLog({
        quranGoalType,
        date,
        itemNumber,
        itemType,
      });
    },
    [deleteQuranLog, itemNumber, itemType, quranGoalType],
  );

  const [activeSurahId, setActiveSurahId] = useState(
    selectedSurahId ?? weeklySurahItems[0]?.surahId ?? "",
  );

  const activeWeeklySurah = useMemo(
    () =>
      weeklySurahItems.find((item) => item.surahId === activeSurahId) ??
      weeklySurahItems[0],
    [activeSurahId, weeklySurahItems],
  );

  useEffect(() => {
    if (!isWeeklySurahCarouselMode) return;
    if (selectedSurahId) {
      setActiveSurahId(selectedSurahId);
      return;
    }
    if (!weeklySurahItems.some((item) => item.surahId === activeSurahId)) {
      setActiveSurahId(weeklySurahItems[0]?.surahId ?? "");
    }
  }, [
    activeSurahId,
    isWeeklySurahCarouselMode,
    selectedSurahId,
    weeklySurahItems,
  ]);

  const mappedWeekDays = useMemo((): SinglePrayerDayProgress[] => {
    if (isWeeklySurahCarouselMode && activeWeeklySurah) {
      return activeWeeklySurah.weekDays.map(mapWeeklySurahDayToSinglePrayerDay);
    }
    if (isCompletionStyleMode) {
      return completionWeekDays.map((day) =>
        mapCompletionDayToSinglePrayerDay(day, isJuzMode),
      );
    }
    return weekDays.map((day) =>
      mapRecitationDayToSinglePrayerDay(
        day,
        dailyTarget,
        formatNumber,
        showDayFraction,
      ),
    );
  }, [
    activeWeeklySurah,
    completionWeekDays,
    dailyTarget,
    formatNumber,
    isCompletionStyleMode,
    isJuzMode,
    isWeeklySurahCarouselMode,
    showDayFraction,
    weekDays,
  ]);

  const defaultSelectedIndex =
    selectedDayIndex ??
    Math.max(
      mappedWeekDays.findIndex((day) => day.isToday),
      0,
    );

  const periodRecitationTarget = isCompletionStyleMode
    ? completionTarget
    : isWeeklyMode
      ? (activeWeeklySurah?.weeklyTarget ??
        weekRecitationTarget ??
        dailyTarget)
      : (weekRecitationTarget ?? dailyTarget * 7);
  const displayTotalRecitations = isCompletionStyleMode
    ? completionsLoggedThisWeek
    : isWeeklySurahCarouselMode
      ? (activeWeeklySurah?.completedThisWeek ?? totalRecitationsThisWeek)
      : totalRecitationsThisWeek;
  const statsLabelKey = isJuzMode
    ? "progressLogging.juzLoggedThisWeek"
    : isCompletionMode
      ? "progressLogging.completionsThisWeek"
      : "progressLogging.totalRecitationsThisWeek";

  const resolveWeeklyStatus = useCallback(
    (index: number): WeeklySurahDayStatus => {
      if (isWeeklySurahCarouselMode && activeWeeklySurah) {
        return activeWeeklySurah.weekDays[index]?.status ?? "not_logged";
      }
      const day = weekDays[index];
      if (!day) return "not_logged";
      return mapDayProgressToWeeklyStatus(day);
    },
    [activeWeeklySurah, isWeeklySurahCarouselMode, weekDays],
  );

  const renderDayRing = useCallback(
    (args: SinglePrayerDayRingRenderArgs) => {
      if (isWeeklyMode) {
        return (
          <QuranRecitationWeeklyDayCircle
            status={resolveWeeklyStatus(args.index)}
            size={args.size}
            isSelected={args.isSelected}
          />
        );
      }

      const quranDay = weekDays[args.index];
      if (!quranDay) return null;

      return (
        <QuranRecitationDayRing
          day={quranDay}
          dailyTarget={dailyTarget}
          size={args.size}
          isSelected={args.isSelected}
        />
      );
    },
    [dailyTarget, isWeeklyMode, resolveWeeklyStatus, weekDays],
  );

  return (
    <SinglePrayerWeeklyProgressDashboard
      weekDays={mappedWeekDays}
      weekRangeLabel={weekRangeLabel}
      weekFraction={weekFraction}
      streakDays={streakDays}
      vsLastWeek={vsLastWeek}
      motivationalQuote={motivationalQuote}
      selectedDayIndex={defaultSelectedIndex}
      onDayPress={onDayPress}
      onPrevWeek={onPrevWeek}
      onNextWeek={onNextWeek}
      loading={loading}
      isGoalCompleted={isGoalCompleted}
      allowLogDeletion={allowLogDeletion}
      onDeleteLog={allowLogDeletion ? handleDeleteLog : undefined}
      isDeletingLog={isDeletingLog}
      comparisonVariant="quranRecitations"
      renderDayRing={isCompletionStyleMode ? undefined : renderDayRing}
      statsRow={
        <View style={styles.statsRow}>
          <QuranRecitationBySurahFlowCardImage
            size={28}
            color={Colors.light.lightblue}
          />
          <Text
            style={styles.statsText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            <Text style={styles.statsCountBold}>
              {loading ? "---" : formatNumber(displayTotalRecitations)}
            </Text>
            <Text style={styles.statsCountRegular}>
              {loading ? "" : `/${formatNumber(periodRecitationTarget)}`}
            </Text>
            {loading ? "" : ` ${t(statsLabelKey)}`}
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
  statsCountBold: {
    color: Colors.light.white,
    fontWeight: "600",
    fontSize: 20,
    fontFamily: fonts.primary.bold,
    letterSpacing: 0.1,
  },
  statsCountRegular: {
    color: Colors.light.white,
    fontWeight: "500",
    fontSize: 13,
    fontFamily: fonts.primary.medium,
  },
});
