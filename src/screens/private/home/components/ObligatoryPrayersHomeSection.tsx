import React, { useCallback, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { WeeklyProgressDashboard } from "@/components/molecules/WeeklyProgressDashboard";
import type { DayProgress } from "@/components/molecules/WeeklyProgressDashboard";
import { PrayerProgressTrackerRing } from "@/components/molecules/PrayerProgressTrackerRing";
import type { HomeObligatoryPrayers } from "@/src/api/queries/useGetDashboardDataForDate";
import type { PrayerGoalFrameDay } from "@/src/api/queries/useGetPrayerGoalFrame";
import { useGetPrayerGoalFrame } from "@/src/api/queries/useGetPrayerGoalFrame";
import {
  canNavigatePrayerFrameWeekNext,
  formatPrayerFrameWeekRange,
  getPrayerFrameTodayIndex,
  getPrayerFrameWeekFraction,
  getPrayerFrameWeekStreakDays,
  mapFiveDailyDaysToWeekProgress,
  mapFiveDailyFrameWeekDays,
} from "@/src/utils/prayerGoalFrameMap";
import { styles } from "../styles";

const EMPTY_WEEK: DayProgress[] = [
  { day: "Sun", statuses: ["none", "none", "none", "none", "none"] },
  { day: "Mon", statuses: ["none", "none", "none", "none", "none"] },
  { day: "Tue", statuses: ["none", "none", "none", "none", "none"] },
  { day: "Wed", statuses: ["none", "none", "none", "none", "none"] },
  { day: "Thu", statuses: ["none", "none", "none", "none", "none"] },
  { day: "Fri", statuses: ["none", "none", "none", "none", "none"] },
  { day: "Sat", statuses: ["none", "none", "none", "none", "none"] },
];

type Props = {
  obligatoryPrayers: HomeObligatoryPrayers;
};

function motivationalFromHomeOrFrame(
  homeMessage: string | null | undefined,
  frameMessage: string | null | undefined,
  frameSummary: string | null | undefined,
): string {
  const summary = typeof frameSummary === "string" ? frameSummary.trim() : "";
  if (summary) return summary;
  const frame =
    typeof frameMessage === "string" ? frameMessage.trim() : "";
  if (frame) return frame;
  return typeof homeMessage === "string" ? homeMessage.trim() : "";
}

export function ObligatoryPrayersHomeSection({
  obligatoryPrayers,
}: Props) {
  const router = useRouter();
  const homeCard = obligatoryPrayers.card ?? null;
  const hasGoal = Boolean(obligatoryPrayers.hasGoal && homeCard);
  const [weekNumber, setWeekNumber] = useState<number | undefined>(undefined);

  const {
    data: frame,
    isLoading,
    isFetching,
    isPlaceholderData,
    isError,
  } = useGetPrayerGoalFrame("FIVE_DAILY_PRAYERS", {
    enabled: hasGoal,
    weekNumber,
  });

  const homeWeekDays = useMemo(() => {
    if (!homeCard?.days?.length) return null;
    return mapFiveDailyDaysToWeekProgress(
      homeCard.days as PrayerGoalFrameDay[],
    );
  }, [homeCard]);

  // Same rule as WeeklyProgressSection `isPrayerFrameDashboardLoading`:
  // keepPreviousData leaves the prior week on screen — show the loader until
  // the requested week actually resolves.
  const requestedWeek = weekNumber;
  const displayedWeek = frame?.cycle?.weekNumber;
  const loading = (() => {
    if (!hasGoal) return false;
    if (isLoading && !frame && !homeCard) return true;
    if (!frame && !isError && !homeCard) return true;
    if (
      requestedWeek != null &&
      displayedWeek != null &&
      requestedWeek !== displayedWeek &&
      (isFetching || isPlaceholderData)
    ) {
      return true;
    }
    // Navigating away from home-card week before frame matches requested week.
    if (
      requestedWeek != null &&
      homeCard != null &&
      (displayedWeek == null || displayedWeek !== requestedWeek) &&
      (isFetching || isLoading)
    ) {
      return true;
    }
    return false;
  })();

  const weekDays = useMemo(() => {
    if (loading) return EMPTY_WEEK;
    if (frame) return mapFiveDailyFrameWeekDays(frame);
    if (homeWeekDays) return homeWeekDays;
    return EMPTY_WEEK;
  }, [frame, homeWeekDays, loading]);

  const weekFraction = loading
    ? "---"
    : frame
      ? getPrayerFrameWeekFraction(frame)
      : homeCard
        ? `${homeCard.weekNumber}/${homeCard.totalWeeks}`
        : "---";

  const weekRangeLabel = loading
    ? "---"
    : frame
      ? formatPrayerFrameWeekRange(frame.cycle.weekStart, frame.cycle.weekEnd)
      : homeCard?.weekLabel?.trim() ||
        (homeCard
          ? formatPrayerFrameWeekRange(homeCard.weekStart, homeCard.weekEnd)
          : "---");

  const onTimePrayersCount = loading
    ? 0
    : (frame?.week.thisWeekOnTime ?? homeCard?.thisWeekOnTime ?? 0);

  const streakDays = loading
    ? 0
    : frame
      ? getPrayerFrameWeekStreakDays(frame)
      : Math.max(0, homeCard?.currentStreak ?? 0);

  const motivationalQuote = loading
    ? "---"
    : motivationalFromHomeOrFrame(
        homeCard?.motivationalMessage,
        frame?.week.motivationalMessage,
        frame?.week.weekSummaryMessage,
      );

  const selectedDayIndex = loading
    ? undefined
    : frame
      ? getPrayerFrameTodayIndex(frame)
      : (() => {
          if (!homeWeekDays) return undefined;
          const todayIdx = homeWeekDays.findIndex((d) => d.isToday);
          return todayIdx >= 0 ? todayIdx : undefined;
        })();

  const activeWeek =
    requestedWeek ?? frame?.cycle.weekNumber ?? homeCard?.weekNumber ?? 1;
  const totalWeeks =
    frame?.cycle.totalWeeks ?? homeCard?.totalWeeks ?? 1;
  const canPrev = !loading && activeWeek > 1;
  const canNext =
    !loading &&
    (frame
      ? canNavigatePrayerFrameWeekNext(frame)
      : homeCard != null && homeCard.weekNumber < homeCard.totalWeeks);

  const handlePrevWeek = useCallback(() => {
    if (loading || activeWeek <= 1) return;
    setWeekNumber(Math.max(1, activeWeek - 1));
  }, [activeWeek, loading]);

  const handleNextWeek = useCallback(() => {
    if (loading || !canNext) return;
    setWeekNumber(Math.min(totalWeeks, activeWeek + 1));
  }, [activeWeek, canNext, loading, totalWeeks]);

  const handleAddPrayer = useCallback(() => {
    router.push({
      pathname: "/goalprogressloggingscreen/[goalId]" as any,
      params: { goalId: "prayer-fiveDailyPrayers" },
    });
  }, [router]);

  const title =
    obligatoryPrayers.title?.trim() || "My Obligatory Prayers";
  const addLabel = obligatoryPrayers.addButton?.trim() || "ADD PRAYER";
  const emptyText = obligatoryPrayers.emptyText?.trim() || null;

  return (
    <View style={styles.obligatoryPrayersSection}>
      <View style={styles.obligatoryPrayersHeader}>
        <Text style={styles.dashboardText}>{title}</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.obligatoryPrayersAddBtn}
          onPress={handleAddPrayer}
        >
          <View style={styles.obligatoryPrayersAddIcon}>
            <Ionicons name="add" size={14} color="white" />
          </View>
          <Text style={styles.obligatoryPrayersAddText}>{addLabel}</Text>
        </TouchableOpacity>
      </View>

      {hasGoal ? (
        <WeeklyProgressDashboard
          key={frame?.cycle.weekNumber ?? homeCard?.weekNumber ?? "home"}
          weekDays={weekDays}
          weekRangeLabel={weekRangeLabel}
          weekFraction={weekFraction}
          onTimePrayersCount={onTimePrayersCount}
          streakDays={streakDays}
          vsLastWeek={frame?.week.vsLastWeek ?? homeCard?.vsLastWeek ?? null}
          motivationalQuote={motivationalQuote}
          selectedDayIndex={
            selectedDayIndex != null && selectedDayIndex >= 0
              ? selectedDayIndex
              : undefined
          }
          loading={loading}
          onPrevWeek={canPrev ? handlePrevWeek : undefined}
          onNextWeek={canNext ? handleNextWeek : undefined}
          renderRing={(day: DayProgress, size: number) => (
            <PrayerProgressTrackerRing
              statuses={day.statuses}
              isMenstruating={day.isMenstruating}
              isToday={day.isToday}
              isFuture={day.isFuture}
              size={size}
              strokeWidth={2.5}
            />
          )}
        />
      ) : emptyText ? (
        <View style={styles.obligatoryPrayersEmpty}>
          <Text style={styles.obligatoryPrayersEmptyText}>{emptyText}</Text>
        </View>
      ) : null}
    </View>
  );
}
