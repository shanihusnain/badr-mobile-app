import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { AchivementArrowIcon } from "@/assets/icons/AchivementArrowIcon";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { useGetMenstruationPeriods } from "@/src/api/queries/useGetMenstruationPeriods";
import { useGetFastingGoalFrame } from "@/src/api/queries/useGetFastingGoalFrame";
import { expandMenstruationPeriodDates } from "@/src/utils/menstruationDates";
import { PLANNED_FASTS } from "@/src/screens/private/home/plannedFasts";
import {
  applyWhiteDaysAnalyticsView,
  formatWhiteDaysChartHoursLabel,
  formatWhiteDaysFastCountLabel,
  formatWhiteDaysFastTimeSpentLabel,
  getTotalWhiteDaysFastsCompleted,
  getTotalWhiteDaysTimeSpentMinutes,
  getWhiteDaysFastTimeSpentForDate,
  getWhiteDaysFastsPastAchievement,
  getWhiteDaysFastsPastAchievementSlice,
  getWhiteDaysGoalTrackedMonths,
  getWhiteDaysTimeSpentByPeriod,
  isWhiteDaysFastCompletedOnDate,
  isWhiteDaysFastMissedOnDate,
  shiftWhiteDaysPastAchievementAnchor,
  type WhiteDaysAnalyticsView,
} from "@/src/screens/private/goalprogressloggingscreen/whiteDaysFastsPastAchievementData";
import { getTodayDateString } from "@/src/screens/private/goalprogressloggingscreen/whiteDaysFastsData";
import { applyTimeSpentOnlyGreenChart } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationPastAchievementData";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import {
  PAST_ACHIEVEMENT_NO_DATA,
  isPastAchievementBarEmpty,
} from "@/src/utils/pastAchievementNoData";
import { QuranHoursPastAchievementChartBlock } from "../QuranHoursPastAchievements/QuranHoursPastAchievementChartBlock";
import { GraphBarSelectionFooter } from "../QuranHoursPastAchievements/GraphBarSelectionFooter";
import { TopSpace } from "@/components/atoms/TopSpace";
import { FontAwesome } from "@expo/vector-icons";
import { InsightCard } from "../InsightCard";
import { getGoalById } from "@/src/screens/private/home/components/goalsData";
import { PastAchievementStudyMaterial } from "@/components/molecules/PastAchievementStudyMaterial";
import {
  NegativeProgressIcon,
  PositiveProgressIcon,
} from "@/assets/icons";

type Props = {
  refreshKey?: number;
  isDetailed?: boolean;
  initialPeriod?: PastAchievementPeriod;
  initialAnalyticsView?: WhiteDaysAnalyticsView;
};
const PERIODS: PastAchievementPeriod[] = [
  "monthly",
  "threeMonths",
  "sixMonths",
];

const PERIOD_LABEL_KEYS: Record<PastAchievementPeriod, string> = {
  monthly: "progressLogging.periodMonthly",
  threeMonths: "progressLogging.periodThreeMonths",
  sixMonths: "progressLogging.periodSixMonths",
};

const ANALYTICS_VIEWS: WhiteDaysAnalyticsView[] = [
  "completedVsIncomplete",
  "completedVsTime",
];

const ANALYTICS_VIEW_LABEL_KEYS: Record<WhiteDaysAnalyticsView, string> = {
  completedVsIncomplete: "progressLogging.analyticsCompletedVsIncomplete",
  completedVsTime: "progressLogging.analyticsCompletedVsTime",
};

const PERIOD_DELTA_LABEL_KEYS: Record<PastAchievementPeriod, string> = {
  monthly: "progressLogging.previousMonth",
  threeMonths: "progressLogging.previousThreeMonthsShort",
  sixMonths: "progressLogging.previousSixMonthsShort",
};

const WHITE_DAYS_BAR_COLORS: [string, string] = [
  Colors.light.white,
  "rgba(255, 255, 255, 0.4)",
];
export function WhiteDaysFastsPastAchievements({
  refreshKey = 0,
  isDetailed = false,
  initialPeriod = "monthly",
  initialAnalyticsView = "completedVsIncomplete",
}: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const [period, setPeriod] = useState<PastAchievementPeriod>(initialPeriod);
  const [analyticsView, setAnalyticsView] =
    useState<WhiteDaysAnalyticsView>(initialAnalyticsView);
  const [anchorDate, setAnchorDate] = useState(getTodayDateString);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(
    null,
  );
  const [hintDismissed, setHintDismissed] = useState(false);
  const goalData = getGoalById("fasting-whiteDays");
  const studyMaterial = goalData?.studyMaterial ?? [];
  const { data: menstruationPeriodsResponse } = useGetMenstruationPeriods(true);
  const { data: fastingFrame } = useGetFastingGoalFrame("WHITE_DAYS");
  const periodSlice = useMemo(
    () => getWhiteDaysFastsPastAchievementSlice(period, anchorDate),
    [period, refreshKey, anchorDate],
  );

  const cycleStartDate = useMemo(() => {
    const fromFrame = String(fastingFrame?.cycle?.startDate ?? "").slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(fromFrame)) return fromFrame;
    return String(PLANNED_FASTS.cycleStartDate).slice(0, 10);
  }, [fastingFrame?.cycle?.startDate]);

  const cycleEndDate = useMemo(() => {
    const fromFrame = String(fastingFrame?.cycle?.endDate ?? "").slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(fromFrame)) return fromFrame;
    return String(PLANNED_FASTS.cycleEndDate).slice(0, 10);
  }, [fastingFrame?.cycle?.endDate]);

  const menstruationDates = useMemo(() => {
    return expandMenstruationPeriodDates(
      menstruationPeriodsResponse?.data?.periods,
      { rangeStart: cycleStartDate, rangeEnd: cycleEndDate },
    );
  }, [
    menstruationPeriodsResponse?.data?.periods,
    cycleStartDate,
    cycleEndDate,
    refreshKey,
  ]);

  const inCycle = useCallback(
    (date: string) => date >= cycleStartDate && date <= cycleEndDate,
    [cycleEndDate, cycleStartDate],
  );

  const calendarCompletedDates = useMemo(
    () => periodSlice.completedDates.filter(inCycle),
    [inCycle, periodSlice.completedDates],
  );

  const calendarMissedDates = useMemo(
    () =>
      periodSlice.missedDates.filter(
        (date) => inCycle(date) && !menstruationDates.includes(date),
      ),
    [inCycle, menstruationDates, periodSlice.missedDates],
  );

  const calendarUpcomingDates = useMemo(
    () =>
      periodSlice.upcomingDates.filter(
        (date) => inCycle(date) && !menstruationDates.includes(date),
      ),
    [inCycle, menstruationDates, periodSlice.upcomingDates],
  );

  const baseAchievement = useMemo(
    () => getWhiteDaysFastsPastAchievement(period, anchorDate),
    [period, refreshKey, anchorDate],
  );

  const timeSpentByPeriod = useMemo(
    () => getWhiteDaysTimeSpentByPeriod(periodSlice),
    [periodSlice],
  );

  const achievement = useMemo(
    () =>
      applyWhiteDaysAnalyticsView(baseAchievement, periodSlice, analyticsView),
    [analyticsView, baseAchievement, periodSlice],
  );

  const totalTimeSpentMinutes = useMemo(
    () => getTotalWhiteDaysTimeSpentMinutes(timeSpentByPeriod),
    [timeSpentByPeriod],
  );

  const goalTrackedMonths = getWhiteDaysGoalTrackedMonths(period);
  const totalFastsCompleted = getTotalWhiteDaysFastsCompleted(periodSlice);

  useEffect(() => {
    setSelectedBarIndex(null);
    setSelectedCalendarDate(null);
    setHintDismissed(false);
  }, [period, analyticsView, refreshKey, anchorDate]);

  const handlePeriodChange = useCallback((next: PastAchievementPeriod) => {
    setPeriod(next);
    setAnchorDate(getTodayDateString());
  }, []);

  const handleBarPressCompact = useCallback((index: number | null) => {
    setHintDismissed(true);
    setSelectedBarIndex((current) => (current === index ? null : index));
  }, []);

  const handleBarPressDetailed = useCallback((index: number | null) => {
    setHintDismissed(true);
    setSelectedBarIndex(index);
  }, []);

  const handleCloseBarSelection = useCallback(() => {
    setSelectedBarIndex(null);
  }, []);

  const handleCalendarDayPress = useCallback((date: string) => {
    setSelectedCalendarDate((current) => (current === date ? null : date));
  }, []);

  const handleCloseCalendarSelection = useCallback(() => {
    setSelectedCalendarDate(null);
  }, []);

  const handleNavigateToDetailed = useCallback(() => {
    router.push({
      pathname: "/(private)/pastachievementdetailedstatistics",
      params: {
        goalId: "fasting-whiteDays",
        period,
        analyticsView:
          analyticsView === "completedVsTime"
            ? "completedVsTimeSpent"
            : "completedVsIncomplete",
        goalCategory: "fasting",
        goalType: "white_days_fasts",
      },
    });
  }, [analyticsView, period, router]);

  const showCalendar = isDetailed
    ? period === "monthly"
    : period === "monthly" && analyticsView === "completedVsIncomplete";

  const todayMonthStart = useMemo(() => {
    const today = getTodayDateString();
    return `${today.slice(0, 8)}01`;
  }, [refreshKey]);

  const canNavigateBack = !showCalendar;
  const canNavigateForward = useMemo(() => {
    if (showCalendar) return false;
    const next = shiftWhiteDaysPastAchievementAnchor(anchorDate, "next");
    return next.slice(0, 7) <= todayMonthStart.slice(0, 7);
  }, [anchorDate, showCalendar, todayMonthStart]);

  const handleNavigateBack = useCallback(() => {
    if (!canNavigateBack) return;
    setAnchorDate((current) =>
      shiftWhiteDaysPastAchievementAnchor(current, "prev"),
    );
  }, [canNavigateBack]);

  const handleNavigateForward = useCallback(() => {
    if (!canNavigateForward) return;
    setAnchorDate((current) =>
      shiftWhiteDaysPastAchievementAnchor(current, "next"),
    );
  }, [canNavigateForward]);

  const displayCompleted = selectedCalendarDate
    ? isWhiteDaysFastCompletedOnDate(selectedCalendarDate)
      ? 1
      : 0
    : selectedBarIndex !== null
      ? (periodSlice.chartPeriods[selectedBarIndex]?.completed ?? 0)
      : periodSlice.completedFasts;
  const displayIncomplete = selectedCalendarDate
    ? isWhiteDaysFastMissedOnDate(selectedCalendarDate, periodSlice)
      ? 1
      : 0
    : selectedBarIndex !== null
      ? (periodSlice.chartPeriods[selectedBarIndex]?.incomplete ?? 0)
      : periodSlice.incompleteFasts;

  const selectedPeriodTimeSpentMinutes = selectedCalendarDate
    ? getWhiteDaysFastTimeSpentForDate(selectedCalendarDate)
    : selectedBarIndex !== null
      ? (timeSpentByPeriod[selectedBarIndex] ?? 0)
      : totalTimeSpentMinutes;

  const showNoDataDash =
    selectedCalendarDate == null &&
    isPastAchievementBarEmpty(displayCompleted, displayIncomplete);

  /** Same gate as Prayer/Quran: hide detail chevron until there is completed data. */
  const showDetailedStatsChevron =
    !isDetailed &&
    ((baseAchievement.achievementPercent ?? 0) > 0 ||
      (periodSlice.completedFasts ?? 0) > 0 ||
      baseAchievement.chartData.some(
        (item) => (item.completedHours ?? 0) > 0,
      ));

  const showChart = !showCalendar;
  const showChartHint =
    showChart && !hintDismissed && selectedBarIndex === null;
  const displayedDeltaPct = baseAchievement.previousPeriodDeltaPercent;
  const showDeltaChip =
    !showNoDataDash &&
    displayedDeltaPct !== null &&
    Math.abs(displayedDeltaPct) > 0;
  const deltaIsPositive = (displayedDeltaPct ?? 0) > 0;

  const cycleRangeLabel = useMemo(() => {
    const start = new Date(`${cycleStartDate}T12:00:00`);
    const end = new Date(`${cycleEndDate}T12:00:00`);
    const startLabel = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endLabel = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const year = String(end.getFullYear()).slice(-2);
    return `${startLabel} — ${endLabel}, ${year}`;
  }, [cycleEndDate, cycleStartDate]);

  const dateRangeLabel = showCalendar
    ? cycleRangeLabel
    : baseAchievement.dateRangeLabel;

  const chartAchievement = useMemo(() => {
    if (!showChart) return null;
    if (analyticsView === "completedVsTime") {
      return applyTimeSpentOnlyGreenChart(baseAchievement, timeSpentByPeriod);
    }
    return baseAchievement;
  }, [analyticsView, baseAchievement, showChart, timeSpentByPeriod]);

  const selectedBarGoalTotal = useMemo(() => {
    if (selectedBarIndex === null) return 0;
    const selectedBar = baseAchievement.chartData[selectedBarIndex];
    if (!selectedBar) return periodSlice.targetFasts;
    return Math.max(
      selectedBar.stackTotalHours,
      displayCompleted + displayIncomplete,
      1,
    );
  }, [
    baseAchievement.chartData,
    displayCompleted,
    displayIncomplete,
    periodSlice.targetFasts,
    selectedBarIndex,
  ]);

  const chartFormatBarValue =
    analyticsView === "completedVsTime"
      ? formatWhiteDaysChartHoursLabel
      : formatWhiteDaysFastCountLabel;

  const renderDetailedSummary = () => {
    if (!isDetailed) return null;

    const summaryKey =
      period === "monthly"
        ? "progressLogging.whiteDaysDetailedSummaryMonthly"
        : period === "threeMonths"
          ? "progressLogging.whiteDaysDetailedSummaryThreeMonths"
          : "progressLogging.whiteDaysDetailedSummarySixMonths";

    return (
      <Text style={styles.summaryTextDetailed}>
        {t(summaryKey, {
          percent: formatNumber(periodSlice.achievementPercent),
          completed: formatNumber(periodSlice.completedFasts),
          total: formatNumber(periodSlice.targetFasts),
          delta: formatNumber(Math.abs(periodSlice.previousPeriodDeltaPercent)),
          direction: deltaIsPositive
            ? t("progressLogging.periodComparisonIncrease")
            : t("progressLogging.periodComparisonDecrease"),
        })}
      </Text>
    );
  };

  const renderFastingInsights = () => {
    if (!isDetailed) return null;

    return (
      <View style={styles.insightsSection}>
        <View style={styles.insightsHeader}>
          <Text style={styles.insightsTitleLabel}>
            {t("progressLogging.keyInsights")}
          </Text>
          <Text style={styles.insightsSubtitleLabel}>
            {period === "monthly"
              ? "VS. LAST MONTH"
              : period === "threeMonths"
                ? "VS. LAST 3 MONTHS"
                : "VS. LAST 6 MONTHS"}
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.insightsScrollContent}
        >
          <InsightCard
            iconName="calendar-outline"
            title={t("progressLogging.recitationInsightGoalTracked")}
            value={formatNumber(goalTrackedMonths)}
            subValue={t("progressLogging.recitationInsightMonths")}
            style={styles.insightCardFixed}
          />
          <InsightCard
            iconName="checkmark-circle-outline"
            title={t("progressLogging.whiteDaysInsightTotalCompleted")}
            value={formatNumber(totalFastsCompleted)}
            subValue={t("progressLogging.whiteDaysInsightFastsCompleted")}
            style={styles.insightCardFixed}
          />
        </ScrollView>
      </View>
    );
  };
  return (
    <View style={[styles.section, isDetailed && styles.sectionDetailed]}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <AchivementArrowIcon size={15} color={Colors.light.subtext} />
          <Text style={styles.sectionTitle}>
            {t("progressLogging.pastGoalAchievements")}
          </Text>
          {showDetailedStatsChevron ? (
            <TouchableOpacity
              onPress={handleNavigateToDetailed}
              style={{ marginLeft: "auto", padding: 4 }}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.light.white}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={styles.achievementBlock}>
            <Text style={styles.achievementCaption}>
              {analyticsView === "completedVsTime"
                ? t("progressLogging.timeSpentLabel").toUpperCase()
                : "ACHIEVEMENT"}
            </Text>
            <View style={styles.achievementPercentRow}>
              <Text style={styles.achievementPercent}>
                {showNoDataDash
                  ? PAST_ACHIEVEMENT_NO_DATA
                  : formatNumber(baseAchievement.achievementPercent)}
              </Text>
              <Text style={styles.achievementPercentSymbol}>%</Text>
            </View>
          </View>
          <View style={styles.periodToggle}>
            {PERIODS.map((item) => {
              const isActive = period === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => handlePeriodChange(item)}
                  style={[
                    styles.periodButton,
                    isActive
                      ? styles.periodButtonActive
                      : styles.periodButtonInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      isActive && styles.periodButtonTextActive,
                    ]}
                  >
                    {t(PERIOD_LABEL_KEYS[item])}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={styles.deltaSlot}>
            {showDeltaChip ? (
              <View style={styles.deltaBadge}>
                {deltaIsPositive ? (
                  <PositiveProgressIcon />
                ) : (
                  <NegativeProgressIcon />
                )}
                <Text style={styles.deltaText} numberOfLines={1}>
                  {`${formatNumber(Math.abs(displayedDeltaPct ?? 0))}% ${t(
                    PERIOD_DELTA_LABEL_KEYS[period],
                  )}`}
                </Text>
              </View>
            ) : (
              <View style={styles.deltaBadgePlaceholder} />
            )}
          </View>

          <View style={styles.periodNavRow}>
            <View style={styles.dateNavRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.navBtn}
                onPress={handleNavigateBack}
                disabled={!canNavigateBack}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={
                    canNavigateBack
                      ? Colors.light.dullWhite
                      : Colors.light.subtext
                  }
                />
              </TouchableOpacity>
              <Text
                style={styles.dateRange}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {dateRangeLabel}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.navBtn}
                onPress={handleNavigateForward}
                disabled={!canNavigateForward}
              >
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={
                    canNavigateForward
                      ? Colors.light.dullWhite
                      : Colors.light.subtext
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {isDetailed ? renderDetailedSummary() : null}

        <View style={styles.goalHeader}>
          <Text style={styles.goalLabel}>{t("progressLogging.goal")}</Text>
          <View style={styles.goalValueRow}>
            <Text style={styles.goalPillValue}>
              {showNoDataDash
                ? PAST_ACHIEVEMENT_NO_DATA
                : formatNumber(periodSlice.targetFasts)}{" "}
            </Text>
            <View style={styles.goalPill}>
              <Text style={styles.goalPillText}>
                {t("progressLogging.unitFasts")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.analyticsToggle}>
          {ANALYTICS_VIEWS.map((view) => {
            const isActive = analyticsView === view;
            return (
              <Pressable
                key={view}
                onPress={() => setAnalyticsView(view)}
                style={[
                  styles.analyticsButton,
                  isActive
                    ? styles.analyticsButtonActive
                    : styles.analyticsButtonInactive,
                ]}
              >
                <Text
                  style={[
                    styles.analyticsButtonText,
                    isActive && styles.analyticsButtonTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {t(ANALYTICS_VIEW_LABEL_KEYS[view])}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>
              {t("progressLogging.completed")}
            </Text>
            <Text
              style={
                isDetailed
                  ? styles.statValueCompletedWhite
                  : styles.statValueCompleted
              }
            >
              {showNoDataDash
                ? PAST_ACHIEVEMENT_NO_DATA
                : formatWhiteDaysFastCountLabel(displayCompleted)}
            </Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>
              {analyticsView === "completedVsTime"
                ? t("progressLogging.timeSpentLabel")
                : t("progressLogging.incomplete")}
            </Text>
            <Text
              style={
                analyticsView === "completedVsTime"
                  ? styles.statValueTimeSpent
                  : styles.statValueIncomplete
              }
            >
              {showNoDataDash
                ? PAST_ACHIEVEMENT_NO_DATA
                : analyticsView === "completedVsTime"
                  ? formatWhiteDaysFastTimeSpentLabel(
                      selectedPeriodTimeSpentMinutes,
                    )
                  : formatWhiteDaysFastCountLabel(displayIncomplete)}
            </Text>
          </View>
        </View>

        {showCalendar ? (
          <>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={styles.legendDotFilledWhite} />
                <Text style={styles.legendText}>
                  {t("progressLogging.whiteDaysLegendCompletedFast")}
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.legendWarningWrap}>
                  <View style={styles.legendDotOutlinedWhite} />
                  <FontAwesome
                    name="warning"
                    size={5}
                    color={Colors.light.golden}
                  />
                </View>
                <Text style={styles.legendText}>
                  {t("progressLogging.whiteDaysLegendMissedFast")}
                </Text>
              </View>
              {isDetailed ? (
                <View style={styles.legendItem}>
                  <View style={styles.legendDotOutlinedWhite} />
                  <Text style={styles.legendText}>
                    {t("progressLogging.whiteDaysLegendUpcomingFast")}
                  </Text>
                </View>
              ) : null}
              <View style={styles.legendItem}>
                <View style={styles.legendDotMenstruation} />
                <Text style={styles.legendText}>
                  {t("progressLogging.whiteDaysLegendMenstruation")}
                </Text>
              </View>
            </View>
            <TopSpace top={12} />
            <CalendarGrid
              mode="white_days_achievement"
              currentDate={cycleStartDate}
              windowStartDate={cycleStartDate}
              windowEndDate={cycleEndDate}
              completedFastDates={calendarCompletedDates}
              missedFastDates={calendarMissedDates}
              incompletePlannedFastDates={calendarUpcomingDates}
              menstruationDates={menstruationDates}
              onDayPress={isDetailed ? handleCalendarDayPress : undefined}
              selectedDate={selectedCalendarDate ?? undefined}
              bgColor={Colors.light.greybuttonBackground}
            />
            {isDetailed && selectedCalendarDate ? (
              <GraphBarSelectionFooter
                visible={selectedCalendarDate !== null}
                completed={displayCompleted}
                incomplete={displayIncomplete}
                goalTotal={Math.max(displayCompleted + displayIncomplete, 1)}
                onClose={handleCloseCalendarSelection}
              />
            ) : null}
          </>
        ) : (
          <View
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => false}
          >
            <QuranHoursPastAchievementChartBlock
              chartData={chartAchievement?.chartData ?? achievement.chartData}
              selectedBarIndex={selectedBarIndex}
              onBarPress={
                isDetailed ? handleBarPressDetailed : handleBarPressCompact
              }
              chartKey={`white-days-${period}-${analyticsView}-${refreshKey}-${isDetailed ? "detailed" : "compact"}`}
              yMax={chartAchievement?.yMax ?? achievement.yMax}
              yTicks={chartAchievement?.yTicks ?? achievement.yTicks}
              showHint={showChartHint}
              onDismissHint={() => setHintDismissed(true)}
              hintText={t("progressLogging.chartTapHint")}
              hintActionText={t("progressLogging.okGotIt")}
              pageCount={chartAchievement?.pageCount ?? achievement.pageCount}
              activePageIndex={
                selectedBarIndex ??
                chartAchievement?.activePageIndex ??
                achievement.activePageIndex
              }
              formatBarValue={chartFormatBarValue}
              barColors={
                analyticsView === "completedVsTime"
                  ? [Colors.light.white, Colors.light.white]
                  : WHITE_DAYS_BAR_COLORS
              }
              valueLabelColor={Colors.light.white}
              showPagination={isDetailed}
            />
            {isDetailed ? (
              <GraphBarSelectionFooter
                visible={selectedBarIndex !== null}
                completed={displayCompleted}
                incomplete={displayIncomplete}
                goalTotal={selectedBarGoalTotal}
                onClose={handleCloseBarSelection}
              />
            ) : null}
          </View>
        )}
      </View>
      {renderFastingInsights()}
      <PastAchievementStudyMaterial items={studyMaterial} isDetailed={isDetailed} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  sectionDetailed: {
    marginTop: 0,
  },
  card: {
    borderRadius: 14,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sectionTitle: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    letterSpacing: 0,
    textTransform: "uppercase",
    flexShrink: 1,
    marginLeft: 6,
  },
  achievementBlock: {
    gap: 6,
    marginTop: 6,
    marginBottom: -2,
  },
  achievementCaption: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontFamily: fonts.primary.heavy,
    fontWeight: "800",
    marginTop: 10,
  },
  achievementPercentRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  achievementPercent: {
    color: Colors.light.white,
    fontSize: 28,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  achievementPercentSymbol: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 16,
    marginBottom: 1,
    marginLeft: 2,
  },
  deltaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 2,
    paddingHorizontal: 2,
    paddingVertical: 4,
    height: 24,
  },
  deltaBadgePlaceholder: {
    height: 24,
  },
  deltaText: {
    color: Colors.light.white,
    fontSize: 11,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  deltaSlot: {
    minWidth: 0,
    marginRight: 8,
    justifyContent: "center",
    height: 24,
  },
  periodNavRow: {
    width: 185,
    height: 24,
    justifyContent: "center",
    alignItems: "stretch",
    flexShrink: 0,
    marginTop: -26,
  },
  periodToggle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 2,
    backgroundColor: Colors.light.blackBackground,
    borderRadius: 6,
    maxWidth: "70%",
  },
  periodButton: {
    flex: 1,
    borderRadius: 5,
    paddingHorizontal: 0,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  periodButtonActive: {
    backgroundColor: Colors.light.greybuttonBackground,
  },
  periodButtonInactive: {
    backgroundColor: Colors.light.blackBackground,
  },
  periodButtonText: {
    color: Colors.light.grey,
    fontSize: 13,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  periodButtonTextActive: {
    color: Colors.light.green,
  },
  dateNavRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  navBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  dateRange: {
    flex: 1,
    minWidth: 0,
    color: Colors.light.white,
    fontSize: 13,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    textAlign: "center",
  },
  summaryText: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    lineHeight: 20,
    letterSpacing: 0,
  },
  summaryTextDetailed: {
    color: Colors.light.grey,
    fontSize: 12,
    fontFamily: fonts.primary.regular,
    lineHeight: 17,
    textAlign: "center",
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    backgroundColor: Colors.light.blackBackground,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  goalLabel: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  goalValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  goalPill: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 5,
  },
  goalPillText: {
    color: Colors.light.white,
    fontSize: 10,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    opacity: 0.6,
  },
  goalPillValue: {
    color: Colors.light.white,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    fontSize: 22,
  },
  analyticsToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 3,
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 6,
    gap: 4,
  },
  analyticsButton: {
    flex: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: "center",
  },
  analyticsButtonActive: {
    backgroundColor: Colors.light.green,
  },
  analyticsButtonInactive: {
    backgroundColor: Colors.light.blackBackground,
  },
  analyticsButtonText: {
    color: Colors.light.grey,
    fontSize: 10,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    textAlign: "center",
  },
  analyticsButtonTextActive: {
    color: Colors.light.white,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statColumn: {
    gap: 4,
  },
  statLabel: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  statValueCompleted: {
    color: Colors.light.white,
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
  },
  statValueCompletedWhite: {
    color: Colors.light.white,
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
  },
  statValueIncomplete: {
    color: Colors.light.white,
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
  },
  statValueTimeSpent: {
    color: Colors.light.white,
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 2,
    backgroundColor: Colors.light.calendarBg,
    padding: 12,
    borderRadius: 6,
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendWarningWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  legendDotFilledWhite: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.white,
    borderWidth: 1.2,
    borderColor: "#000000",
  },
  legendDotOutlinedWhite: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.2,
    borderColor: Colors.light.white,
    backgroundColor: "transparent",
  },
  legendDotMenstruation: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.red,
    borderWidth: 1.2,
    borderColor: Colors.light.white,
  },
  legendText: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  insightsSection: {
    marginTop: 16,
    gap: 12,
  },
  insightsHeader: {
    gap: 2,
  },
  insightsTitleLabel: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  insightsSubtitleLabel: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  insightsScrollContent: {
    gap: 10,
    paddingRight: 4,
  },
  insightCardFixed: {
    width: 160,
  },
  insightsTitle: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
