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
import { DashBoardCalenderIcon } from "@/assets/icons/DashBoardCalenderIcon";
import { GoatIcon } from "@/assets/icons/GoatIcon";
import { HouseWithHeartIcon } from "@/assets/icons/HouseWithHeartIcon";
import { DebtAssistanceIcon } from "@/assets/icons/DebtAssistanceIcon";
import { FlowCardQardHassanIcon } from "@/assets/icons/FlowCardQardHassanIcon";
import { FlowCardFoodReliefIcon } from "@/assets/icons/FlowCardFoodReleifIcon";
import { DashBoardHandHeartIcon } from "@/assets/icons/DashBoardHandHeartIcon";
import { BinIcon } from "@/assets/icons";
import {
  LillahCategoryId,
  getLillahCategory,
} from "@/src/screens/private/goalprogressloggingscreen/lillahCategories";
import { PrayerWeeklyDashboardBody } from "@/components/molecules/PrayerWeeklyDashboardBody";
import { PrayerWeeklyProgressFooter } from "@/components/molecules/PrayerWeeklyProgressFooter";
import { useDeleteSadaqahLog } from "@/src/api/mutations/useDeleteSadaqahLog";
import type { LillahCategoryId } from "@/src/screens/private/goalprogressloggingscreen/lillahCategories";
import { LillahDayRing } from "./LillahDayRing";

export type LillahDayProgress = {
  day: string;
  /** YYYY-MM-DD — required for delete API. */
  date?: string;
  category: LillahCategoryId | null;
  /** Dollar amount given on this day */
  amount: number;
  isBestDay?: boolean;
  isToday?: boolean;
  isFuture?: boolean;
  /**
   * Blur day: days after the user achieves 100% of their goal.
   */
  isBlurDay?: boolean;
  canDelete?: boolean;
};

export type LillahWeeklyProgressDashboardProps = {
  weekDays: LillahDayProgress[];
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

function formatDayAmount(value: number, currencyCode: string): string {
  const currency = String(currencyCode || "USD")
    .trim()
    .toUpperCase();
  if (currency === "USD") return `$${value}`;
  return `${currency} ${value}`;
}

function mapLillahDayToSinglePrayerDay(
  day: LillahDayProgress,
  currencyCode: string,
): SinglePrayerDayProgress {
  const hasLog = day.amount > 0 && day.category !== null;
  const dateKey = normalizeDayDate(day.date);
  const isToday = dateKey
    ? dateKey === getLocalTodayString()
    : !!day.isToday;

  return {
    day: day.day,
    date: dateKey ?? day.date,
    prayersLogged: hasLog ? Math.max(1, day.amount) : 0,
    isLogged: hasLog,
    isBestDay: !!day.isBestDay && hasLog,
    isToday,
    // Blur / post-completion days stay non-interactive like future days.
    isFuture: isToday ? false : !!day.isFuture || !!day.isBlurDay,
    canDelete: day.canDelete,
    durationLabel: hasLog
      ? formatDayAmount(day.amount, currencyCode)
      : undefined,
  };
}

export function LillahWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  totalThisWeek = 350,
  streakDays = 1,
  vsLastWeek = null,
  vsLastWeekDisplay = null,
  motivationalQuote = "Share your blessings with the needy today, seeking only Allah's pleasure.",
  selectedDayIndex = 6,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  loading = false,
  onDeleted,
  allowLogDeletion = true,
  sadaqahType = "LILLAH",
  currencyCode = "USD",
}: LillahWeeklyProgressDashboardProps) {
  const { mutateAsync: deleteSadaqahLog, isPending: isDeletingLog } =
    useDeleteSadaqahLog();

  const currency = String(currencyCode || "USD")
    .trim()
    .toUpperCase();

  const mappedWeekDays = useMemo(
    () =>
      weekDays.map((day) => mapLillahDayToSinglePrayerDay(day, currency)),
    [weekDays, currency],
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
      const lillahDay = weekDays[args.index];
      if (!lillahDay) return null;

      const hasLog =
        lillahDay.amount > 0 && lillahDay.category !== null;

      return (
        <LillahDayRing
          size={args.size}
          category={lillahDay.category}
          hasLog={hasLog}
          isBestDay={Boolean(lillahDay.isBestDay && hasLog)}
          isToday={Boolean(lillahDay.isToday)}
          isFuture={Boolean(lillahDay.isFuture)}
          isBlurDay={Boolean(lillahDay.isBlurDay)}
          showEmptyOutline={args.showEmptyOutline}
        />
      );
    },
    [weekDays],
  );

  const totalLabel =
    currency === "USD" ? `$${totalThisWeek}` : `${currency} ${totalThisWeek}`;

  return (
    <SinglePrayerWeeklyProgressDashboard
      weekDays={mappedWeekDays}
      weekRangeLabel={weekRangeLabel}
      weekFraction={weekFraction}
      streakDays={streakDays}
      vsLastWeek={null}
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
                  {formatAmount(totalThisWeek)}
                </Text>
                {" spent in total this week"}
              </>
            )}
          </Text>
        </View>

        <PrayerWeeklyProgressFooter
          loading={loading}
          streakDays={streakDays}
          vsLastWeek={vsLastWeek}
          vsLastWeekDisplay={vsLastWeekDisplay}
          motivationalQuote={motivationalQuote}
          comparisonVariant="hours"
        />
      </PrayerWeeklyDashboardBody>
    </View>
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
