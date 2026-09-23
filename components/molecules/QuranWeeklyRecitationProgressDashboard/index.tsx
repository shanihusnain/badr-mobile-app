import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { QuranRecitationBySurahFlowCardImage } from "@/assets/icons";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import {
  SinglePrayerWeeklyProgressDashboard,
  type SinglePrayerDayProgress,
} from "@/components/molecules/SinglePrayerWeeklyProgressDashboard";
import type {
  QuranRecitationDayProgress,
  WeeklySurahDashboardItem,
} from "@/src/screens/private/goalprogressloggingscreen/quranRecitationWeeklyData";
import type { QuranCompletionDayProgress } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationCompletionWeeklyData";

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
};

function mapRecitationDayToSinglePrayerDay(
  day: QuranRecitationDayProgress,
  dailyTarget: number,
  formatNumber: (value: number) => string,
): SinglePrayerDayProgress {
  const isToday = day.dayType === "today";
  const isFuture = day.dayType === "future";
  const logged = day.recitationsCompleted > 0;

  return {
    day: day.day,
    prayersLogged: day.recitationsCompleted,
    isLogged: logged,
    isBestDay: day.isBestDay,
    isToday,
    isFuture: isToday ? false : isFuture,
    durationLabel: `${formatNumber(day.recitationsCompleted)}/${formatNumber(dailyTarget)}`,
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
}: QuranWeeklyRecitationProgressDashboardProps) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const isWeeklySurahMode =
    visualizationMode === "weekly" && weeklySurahItems.length > 0;
  const isCompletionMode =
    visualizationMode === "completion" && completionWeekDays.length > 0;
  const isJuzMode =
    visualizationMode === "juz" && completionWeekDays.length > 0;
  const isCompletionStyleMode = isCompletionMode || isJuzMode;

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
    if (!isWeeklySurahMode) return;
    if (selectedSurahId) {
      setActiveSurahId(selectedSurahId);
      return;
    }
    if (!weeklySurahItems.some((item) => item.surahId === activeSurahId)) {
      setActiveSurahId(weeklySurahItems[0]?.surahId ?? "");
    }
  }, [activeSurahId, isWeeklySurahMode, selectedSurahId, weeklySurahItems]);

  const mappedWeekDays = useMemo((): SinglePrayerDayProgress[] => {
    if (isWeeklySurahMode && activeWeeklySurah) {
      return activeWeeklySurah.weekDays.map(mapWeeklySurahDayToSinglePrayerDay);
    }
    if (isCompletionStyleMode) {
      return completionWeekDays.map((day) =>
        mapCompletionDayToSinglePrayerDay(day, isJuzMode),
      );
    }
    return weekDays.map((day) =>
      mapRecitationDayToSinglePrayerDay(day, dailyTarget, formatNumber),
    );
  }, [
    activeWeeklySurah,
    completionWeekDays,
    dailyTarget,
    formatNumber,
    isCompletionStyleMode,
    isJuzMode,
    isWeeklySurahMode,
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
    : isWeeklySurahMode
      ? (activeWeeklySurah?.weeklyTarget ?? weekRecitationTarget ?? dailyTarget)
      : (weekRecitationTarget ?? dailyTarget * 7);
  const displayTotalRecitations = isCompletionStyleMode
    ? completionsLoggedThisWeek
    : isWeeklySurahMode
      ? (activeWeeklySurah?.completedThisWeek ?? totalRecitationsThisWeek)
      : totalRecitationsThisWeek;
  const statsLabelKey = isJuzMode
    ? "progressLogging.juzLoggedThisWeek"
    : isCompletionMode
      ? "progressLogging.completionsThisWeek"
      : "progressLogging.totalRecitationsThisWeek";

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
      allowLogDeletion={false}
      comparisonVariant="quranRecitations"
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
