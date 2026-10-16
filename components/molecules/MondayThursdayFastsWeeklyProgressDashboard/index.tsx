import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { FastingDashboardIcon } from "@/assets/icons/FastingDashboardIcon";
import {
  getDayLabelTextStyle,
  mondayThursdayDayLabelStyles,
  shouldShowTodayLabelBackground,
} from "./mondayThursdayFastDayStyles";
import { rfs } from "@/src/utils/responsive";

export type MondayThursdayFastsWeeklyProgressDashboardProps = {
  weekSummary: MondayThursdayFastWeekSummary;
  selectedDayIndex?: number | null;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  /** Frame / week fetch in progress */
  loading?: boolean;
  /** Called after a completed log is deleted so the parent can refresh. */
  onDeleted?: () => void;
};

function mapMondayThursdayDayToSinglePrayerDay(
  day: MondayThursdayFastDayProgress,
): SinglePrayerDayProgress {
  const isCompleted = day.state === "completed";

  return {
    day: day.day,
    date: day.date,
    // Fasting rings show no count under the day label (Figma).
    prayersLogged: 0,
    isLogged: isCompleted,
    isBestDay: false,
    isToday: day.isToday,
    isMenstruation: Boolean(day.isMenstruating),
    // Keep planned / today / missed days pressable; rings own the visuals.
    isFuture:
      day.state === "future" ||
      day.state === "goalAchieved" ||
      day.state === "disabledPast" ||
      day.state === "todayDisabled",
    canDelete: day.canDelete,
  };
}

export function MondayThursdayFastsWeeklyProgressDashboard({
  weekSummary,
  selectedDayIndex,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  loading = false,
  onDeleted,
}: MondayThursdayFastsWeeklyProgressDashboardProps) {
  const { t } = useTranslation();
  const { mutate: deleteFastLog, isPending: isDeletingLog } =
    useDeleteFastingLog();

  const mappedWeekDays = useMemo(
    () => weekSummary.weekDays.map(mapMondayThursdayDayToSinglePrayerDay),
    [weekSummary.weekDays],
  );

  const defaultSelectedIndex =
    selectedDayIndex ??
    Math.max(
      mappedWeekDays.findIndex((day) => day.isToday),
      0,
    );

  const vsLastWeek = weekSummary.showPreviousWeekStat
    ? weekSummary.weekOverWeekDelta
    : null;

  const motivationalQuote = useMemo(() => {
    if (loading) return "---";

    if (weekSummary.motivationalQuote?.trim()) {
      return weekSummary.motivationalQuote.trim();
    }

    switch (weekSummary.motivationalQuoteKey) {
      case "weekOneProgress":
        return t("progressLogging.mondayThursdayWeekOneMotivation", {
          week: weekSummary.motivationalQuoteParams?.week ?? 1,
          percent: weekSummary.motivationalQuoteParams?.percent ?? 0,
        });
      case "buildingMomentum":
        return t("progressLogging.mondayThursdayBuildingMomentum", {
          count: weekSummary.motivationalQuoteParams?.count ?? 0,
        });
      case "tabarakAllah":
        return t("progressLogging.mondayThursdayTabarakAllahMotivation");
      case "stayConsistent":
        return t("progressLogging.mondayThursdayStayConsistentMotivation", {
          percent: weekSummary.motivationalQuoteParams?.percent ?? 0,
        });
      case "planNext":
      default:
        return t("progressLogging.mondayThursdayPlanNextMotivation");
    }
  }, [
    loading,
    t,
    weekSummary.motivationalQuote,
    weekSummary.motivationalQuoteKey,
    weekSummary.motivationalQuoteParams,
  ]);

  const streakLabelText = useMemo(
    () =>
      loading
        ? "---"
        : t("progressLogging.mondayThursdayWeeklyStreak", {
            count: weekSummary.streakWeeks,
          }),
    [loading, t, weekSummary.streakWeeks],
  );

  const renderDayRing = useCallback(
    (args: SinglePrayerDayRingRenderArgs) => {
      const mondayThursdayDay = weekSummary.weekDays[args.index];
      if (!mondayThursdayDay) return null;

      return (
        <MondayThursdayFastDayRing
          size={args.size}
          state={mondayThursdayDay.state}
          isMenstruating={Boolean(mondayThursdayDay.isMenstruating)}
          isPlanned={Boolean(mondayThursdayDay.isSelected)}
          isToday={mondayThursdayDay.isToday}
        />
      );
    },
    [weekSummary.weekDays],
  );

  const handleDeleteLog = useCallback(
    (date: string) => {
      deleteFastLog(
        { fastingType: "MONDAY_THURSDAY", date },
        {
          onSuccess: () => {
            onDeleted?.();
          },
        },
      );
    },
    [deleteFastLog, onDeleted],
  );

  return (
    <SinglePrayerWeeklyProgressDashboard
      weekDays={mappedWeekDays}
      weekRangeLabel={weekSummary.weekRangeLabel}
      weekFraction={weekSummary.weekFraction}
      streakDays={weekSummary.streakWeeks}
      streakLabelText={streakLabelText}
      vsLastWeek={vsLastWeek}
      motivationalQuote={motivationalQuote}
      selectedDayIndex={defaultSelectedIndex}
      onDayPress={onDayPress}
      onPrevWeek={onPrevWeek}
      onNextWeek={onNextWeek}
      loading={loading}
      allowLogDeletion
      onDeleteLog={handleDeleteLog}
      isDeletingLog={isDeletingLog}
      renderDayRing={renderDayRing}
      comparisonVariant="fasts"
      statsRow={
        <View style={styles.statsRow}>
          <FastingDashboardIcon size={28} color={Colors.light.seagreen} />
          <Text style={styles.statsText} numberOfLines={1}>
            <Text style={styles.statsCount}>
              {loading ? "---" : weekSummary.completedFastsThisWeek}
            </Text>{" "}
            {loading
              ? ""
              : t("progressLogging.mondayThursdayWeeklyTotalFasts")}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 8,
    paddingVertical: 20,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 2,
  },

  weekFractionText: {
    color: Colors.light.white,
    fontSize: rfs(13),
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    flexShrink: 0,
  },
  navBtn: {
    padding: 2,
  },
  weekRangeText: {
    color: Colors.light.white,
    fontSize: rfs(14),
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    textAlign: "center",
  },
  daysRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingBottom: 10,
  },
  dayColumn: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 6,
    paddingBottom: 4,
  },
  dayColumnMarkedForDeletion: {
    zIndex: 99999,
  },
  dayColumnBlurred: {
    opacity: 0.35,
  },
  dayItemWrapper: {
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 1,
    minWidth: 0,
  },
  /** Figma today / delete chip — wraps ring + day label (must contrast card bg) */
  dayItemTodayChip: {
    backgroundColor: Colors.light.dayProgressCardBg,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 2,
  },
  /** #16 / #17 — thin red border when marked for delete */
  dayItemDeleteBorder: {
    borderWidth: 1,
    borderColor: Colors.light.red,
    borderRadius: 6,
  },
  /** #16 — padding when delete border has no today chip */
  dayItemDeletePadding: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 2,
  },
  deleteButton: {
    height: 20,
    width: 24,
    backgroundColor: Colors.light.red,
    borderRadius: 5,
    zIndex: 1000,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: -10,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexWrap: "nowrap",
    transform: [{ translateX: -12 }],
  },
  statsText: {
    color: Colors.light.white,
    fontSize: rfs(14),
    fontFamily: fonts.primary.medium,
    flexShrink: 1,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  statsCount: {
    color: Colors.light.white,
    fontWeight: "700",
    fontSize: rfs(22),
    fontFamily: fonts.primary.bold,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  streakText: {
    color: Colors.light.seagreen,
    fontSize: rfs(13),
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
  },
  previousWeekText: {
    color: Colors.light.white,
    fontSize: rfs(13),
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
  },
  quoteBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    minWidth: 120,
  },
  quoteText: {
    flex: 1,
    color: Colors.light.subtext,
    fontSize: rfs(13),
    lineHeight: rfs(16),
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
});
