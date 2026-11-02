import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { DashBoardHandHeartIcon } from "@/assets/icons/DashBoardHandHeartIcon";
import {
  SinglePrayerWeeklyProgressDashboard,
  type SinglePrayerDayProgress,
  type SinglePrayerDayRingRenderArgs,
} from "@/components/molecules/SinglePrayerWeeklyProgressDashboard";
import { useDeleteSadaqahLog } from "@/src/api/mutations/useDeleteSadaqahLog";
import type { VolunteeringCategoryId } from "@/src/screens/private/goalprogressloggingscreen/volunteeringCategories";
import { VolunteeringDayRing } from "./VolunteeringDayRing";

export type VolunteeringDayProgress = {
  day: string;
  /** YYYY-MM-DD — required for delete API. */
  date?: string;
  category: VolunteeringCategoryId | null;
  /** Minutes volunteered on this day */
  minutesLogged: number;
  isBestDay?: boolean;
  isToday?: boolean;
  isFuture?: boolean;
  /**
   * Blur day: days after the user achieves 100% of their goal.
   */
  isBlurDay?: boolean;
  canDelete?: boolean;
};

export type VolunteeringWeeklyProgressDashboardProps = {
  weekDays: VolunteeringDayProgress[];
  weekRangeLabel?: string;
  weekFraction?: string;
  totalMinutesThisWeek?: number;
  streakDays?: number;
  /** `null` on week 1 / no comparison. */
  vsLastWeek?: number | null;
  vsLastWeekDisplay?: string | null;
  motivationalQuote?: string;
  selectedDayIndex?: number;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  /** Frame / week-fetch loading — match Missed Zakat placeholders. */
  loading?: boolean;
  /** Bump parent refresh after a successful delete. */
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

/** Day caption under the ring — design uses `1:00` style. */
function formatDayMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) return "";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}`;
  return `0:${m.toString().padStart(2, "0")}`;
}

function formatTotalTime(totalMinutes: number): string {
  if (totalMinutes <= 0) return "0h 0m";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function mapVolunteeringDayToSinglePrayerDay(
  day: VolunteeringDayProgress,
): SinglePrayerDayProgress {
  const hasLog = day.minutesLogged > 0 && day.category !== null;
  const dateKey = normalizeDayDate(day.date);
  const isToday = dateKey ? dateKey === getLocalTodayString() : !!day.isToday;

  return {
    day: day.day,
    date: dateKey ?? day.date,
    prayersLogged: hasLog ? Math.max(1, day.minutesLogged) : 0,
    isLogged: hasLog,
    isBestDay: !!day.isBestDay && hasLog,
    isToday,
    // Blur / post-completion days stay non-interactive like future days.
    isFuture: isToday ? false : !!day.isFuture || !!day.isBlurDay,
    canDelete: day.canDelete,
    durationLabel: hasLog ? formatDayMinutes(day.minutesLogged) : undefined,
  };
}

export function VolunteeringWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  totalMinutesThisWeek = 150,
  streakDays = 0,
  vsLastWeek = null,
  vsLastWeekDisplay = null,
  motivationalQuote = "When you help others, you help yourself grow spiritually—stay inspired!",
  selectedDayIndex = 6,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  loading = false,
  onDeleted,
  allowLogDeletion = true,
  sadaqahType = "VOLUNTEERING",
}: VolunteeringWeeklyProgressDashboardProps) {
  const { mutateAsync: deleteSadaqahLog, isPending: isDeletingLog } =
    useDeleteSadaqahLog();

  const mappedWeekDays = useMemo(
    () => weekDays.map(mapVolunteeringDayToSinglePrayerDay),
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

  const renderDayRing = useCallback(
    (args: SinglePrayerDayRingRenderArgs) => {
      const volunteeringDay = weekDays[args.index];
      if (!volunteeringDay) return null;

      const hasLog =
        volunteeringDay.minutesLogged > 0 &&
        volunteeringDay.category !== null;

      return (
        <VolunteeringDayRing
          size={args.size}
          category={volunteeringDay.category}
          hasLog={hasLog}
          isBestDay={Boolean(volunteeringDay.isBestDay && hasLog)}
          isToday={Boolean(args.day.isToday)}
          isFuture={Boolean(volunteeringDay.isFuture)}
          isBlurDay={Boolean(volunteeringDay.isBlurDay)}
          showEmptyOutline={args.showEmptyOutline}
        />
      );
    },
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
      renderDayRing={renderDayRing}
      showTodayChip
      greenActivityCaptions
      statsRow={
        <View style={styles.statsRow}>
          <DashBoardHandHeartIcon size={24} color={Colors.light.lightblue} />
          <Text style={styles.statsText} numberOfLines={1}>
            {loading ? (
              "---"
            ) : (
              <>
                <Text style={styles.statsCount}>
                  {formatTotalTime(totalMinutesThisWeek)}
                </Text>
                {" volunteered this week"}
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
  statsCount: {
    color: Colors.light.white,
    fontWeight: "600",
    fontSize: 20,
    fontFamily: fonts.primary.bold,
    letterSpacing: 0.12,
  },
});
