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
  /** Fractional juz covered this week — hides `/target` in the stats row. */
  juzCompletedThisWeek?: number | null;
  /**
   * Full week total from API (e.g. "1.43 juz from C1 this week").
   * When set, stats row boldens `weekStatsDisplay` (or the leading number) + rest.
   */
  weekStatsLabel?: string | null;
  /** Bold portion of weekStatsLabel (e.g. totalDisplay "1.43"). */
  weekStatsDisplay?: string | null;
  /** Prefer API vs-last-week display string (e.g. "1.43"). */
  vsLastWeekDisplay?: string | null;
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
  formatNumber: (value: number) => string,
  /** Weekly solid circles show a count; daily multi-arc rings do not. */
  showDayCount: boolean,
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
    // Recitation never surfaces BEST DAY — ignore backend flag.
    isBestDay: false,
    isToday,
    isFuture: isToday ? false : isFuture,
    canDelete: day.canDelete,
    // Absolute count under solid weekly circles only (arcs already show progress).
    // Use "" (not undefined) so SinglePrayerDashboard does not fall back to prayersLogged.
    durationLabel:
      showDayCount && day.recitationsCompleted > 0
        ? formatNumber(day.recitationsCompleted)
        : "",
  };
}

function mapCompletionDayToSinglePrayerDay(
  day: QuranCompletionDayProgress,
  isJuzMode: boolean,
): SinglePrayerDayProgress {
  const dateKey = normalizeDayDate(day.date);
  const isToday = dateKey
    ? dateKey === getLocalTodayString()
    : day.dayType === "today";
  const isFuture = day.dayType === "future";
  // Figma: weekday stays; under-ring is C# + juz (completion) or juz only (juz mode).
  const captionParts: string[] = [];
  if (!isJuzMode && day.hasActivity) {
    const attemptCaption =
      day.attemptLabel?.trim() ||
      (day.completionNumber != null ? `C${day.completionNumber}` : "");
    if (attemptCaption) captionParts.push(attemptCaption);
  }
  if (day.hasActivity && day.computedLabel) {
    captionParts.push(day.computedLabel);
  }

  return {
    day: day.day,
    date: dateKey ?? day.date,
    prayersLogged: day.hasActivity ? Math.max(day.activityScore, 1) : 0,
    isLogged: day.hasActivity,
    // Recitation never surfaces BEST DAY — ignore backend flag.
    isBestDay: false,
    isToday,
    isFuture: isToday ? false : isFuture,
    canDelete: day.canDelete,
    durationLabel: captionParts.length > 0 ? captionParts.join("\n") : undefined,
  };
}

function mapWeeklySurahDayToSinglePrayerDay(
  day: WeeklySurahDashboardItem["weekDays"][number],
  frameDay: QuranRecitationDayProgress | undefined,
  formatNumber: (value: number) => string,
): SinglePrayerDayProgress {
  const count = Math.max(
    0,
    frameDay?.recitationsCompleted ?? (day.status === "completed" ? 1 : 0),
  );
  const isLogged = day.status === "completed" || count > 0;

  return {
    day: day.day,
    date: frameDay?.date,
    prayersLogged: count,
    isLogged,
    isBestDay: false,
    isFuture: day.status === "pending",
    isToday: frameDay?.dayType === "today",
    canDelete: frameDay?.canDelete,
    durationLabel: count > 0 ? formatNumber(count) : undefined,
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
  /** Fractional juz covered this week (RECITATION_JUZ AGGREGATE). */
  juzCompletedThisWeek,
  weekStatsLabel = null,
  weekStatsDisplay = null,
  vsLastWeekDisplay: vsLastWeekDisplayProp = null,
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
  const allowLogDeletion = !!quranGoalType;

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
      return activeWeeklySurah.weekDays.map((day, index) =>
        mapWeeklySurahDayToSinglePrayerDay(day, weekDays[index], formatNumber),
      );
    }
    if (isCompletionStyleMode) {
      return completionWeekDays.map((day) =>
        mapCompletionDayToSinglePrayerDay(day, isJuzMode),
      );
    }
    return weekDays.map((day) =>
      mapRecitationDayToSinglePrayerDay(day, formatNumber, isWeeklyMode),
    );
  }, [
    activeWeeklySurah,
    completionWeekDays,
    formatNumber,
    isCompletionStyleMode,
    isJuzMode,
    isWeeklyMode,
    isWeeklySurahCarouselMode,
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
  const useCompletionWeekStatsLabel = Boolean(
    isCompletionMode && weekStatsLabel?.trim(),
  );
  const displayTotalRecitations = isJuzMode
    ? (juzCompletedThisWeek ?? completionsLoggedThisWeek)
    : isCompletionMode && juzCompletedThisWeek != null
      ? juzCompletedThisWeek
      : isCompletionStyleMode
        ? completionsLoggedThisWeek
        : isWeeklySurahCarouselMode
          ? (activeWeeklySurah?.completedThisWeek ?? totalRecitationsThisWeek)
          : totalRecitationsThisWeek;
  /** RECITATION_JUZ / completion totalLabel — never print `/N`. */
  const hideStatsDenominator = isJuzMode || useCompletionWeekStatsLabel;
  const statsLabelKey = isJuzMode
    ? "progressLogging.juzCompletedThisWeek"
    : isCompletionMode && !useCompletionWeekStatsLabel
      ? "progressLogging.completionsThisWeek"
      : isCompletionMode
        ? ""
        : "progressLogging.totalRecitationsThisWeek";
  const useJuzStyleComparison = isJuzMode || isCompletionMode;

  const formatStatsTotal = (value: number) => {
    if (
      (isJuzMode || isCompletionMode) &&
      !Number.isInteger(value)
    ) {
      return formatNumber(Number(value.toFixed(2)));
    }
    return formatNumber(value);
  };

  const resolvedWeekStatsBold =
    weekStatsDisplay?.trim() ||
    (useCompletionWeekStatsLabel
      ? formatStatsTotal(displayTotalRecitations)
      : null);
  const resolvedWeekStatsRest = (() => {
    const label = weekStatsLabel?.trim();
    if (!label) return null;
    const bold = resolvedWeekStatsBold;
    if (bold && label.startsWith(bold)) {
      return label.slice(bold.length).trimStart();
    }
    // Strip leading numeric token (e.g. "1.43 juz from C1…").
    return label.replace(/^\s*[\d.,]+\s*/, "").trim() || label;
  })();

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
      vsLastWeekDisplay={
        vsLastWeekDisplayProp?.trim() ||
        (useJuzStyleComparison &&
        vsLastWeek != null &&
        !Number.isInteger(vsLastWeek)
          ? formatNumber(Number(Math.abs(vsLastWeek).toFixed(2)))
          : null)
      }
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
      comparisonVariant={
        useJuzStyleComparison ? "quranJuz" : "quranRecitations"
      }
      greenActivityCaptions={isJuzMode}
      activityCaptionsMatchDayLabel={isCompletionMode}
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
            {useCompletionWeekStatsLabel ? (
              <>
                <Text style={styles.statsCountBold}>
                  {loading ? "---" : (resolvedWeekStatsBold ?? "---")}
                </Text>
                {loading
                  ? ""
                  : resolvedWeekStatsRest
                    ? ` ${resolvedWeekStatsRest}`
                    : ""}
              </>
            ) : (
              <>
                <Text style={styles.statsCountBold}>
                  {loading ? "---" : formatStatsTotal(displayTotalRecitations)}
                </Text>
                {!hideStatsDenominator ? (
                  <Text style={styles.statsCountRegular}>
                    {loading ? "" : `/${formatNumber(periodRecitationTarget)}`}
                  </Text>
                ) : null}
                {loading || !statsLabelKey ? "" : ` ${t(statsLabelKey)}`}
              </>
            )}
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
    fontWeight: "700",
    fontSize: 20,
    fontFamily: fonts.primary.bold,
    letterSpacing: 0.1,
  },
  statsCountRegular: {
    color: Colors.light.white,
    fontWeight: "400",
    fontSize: 20,
    fontFamily: fonts.primary.regular,
    letterSpacing: 0.1,
  },
});
