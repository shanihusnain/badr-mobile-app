import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { getHizbMemorisationPastAchievement } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationHizbPastAchievementData";
import {
  applyMemorisationHizbAnalyticsView,
  formatMemorisationHizbTimeSpentChip,
  formatMemorisationHizbTimeSpentLabel,
  getMemorisationHizbGoalTrackedMonths,
  getMemorisationHizbPastAchievementFilters,
  getMemorisationHizbProgressRailRows,
  getMemorisationHizbTimeSpentByPeriod,
  getQuranMemorisationHizbPastAchievement,
  getQuranMemorisationHizbPastAchievementSlice,
  getTotalHizbMemorizedVerses,
  getTotalMemorisationHizbTimeSpentMinutes,
  hasMemorisationHizbPastAchievementLogs,
  type MemorisationHizbFilterId,
} from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationHizbPastAchievementSliceData";
import type { MemorisationAnalyticsView } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationSurahPastAchievementData";
import { applyTimeSpentOnlyGreenChart } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationPastAchievementData";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import {
  PAST_ACHIEVEMENT_NO_DATA,
  isPastAchievementBarEmpty,
} from "@/src/utils/pastAchievementNoData";
import type { HizbMemorisationGoalId } from "@/src/screens/private/goalprogressloggingscreen/types";
import { useOptionalMemorisationHizbContext } from "@/src/screens/private/goalprogressloggingscreen/memorisationHizbContext";
import { QuranHoursPastAchievementChartBlock } from "../QuranHoursPastAchievements/QuranHoursPastAchievementChartBlock";
import { GraphBarSelectionFooter } from "../QuranHoursPastAchievements/GraphBarSelectionFooter";
import { MemorisationHizbDetailCard } from "../QuranHoursPastAchievements/MemorisationHizbDetailCard";
import { InsightCard } from "../InsightCard";
import type { InsightCardData } from "../PrayerPastAchievements/insightCardsData";
import { getGoalById } from "@/src/screens/private/home/components/goalsData";
import { PastAchievementStudyMaterial } from "@/components/molecules/PastAchievementStudyMaterial";
import { memorisationPastAchievementStyles as styles } from "./memorisationPastAchievementsStyles";
import {
  AchivementArrowIcon,
  InsightCardFlashIcon,
  InsightCardGoalTrackedIcon,
  InsightCardGoodDayIcon,
  InsightCardTickIcon,
  InsightCardTimeSpentIcon,
  InsightCardWeeklyAverageIcon,
  NegativeProgressIcon,
  PositiveProgressIcon,
} from "@/assets/icons";

const PERIODS: PastAchievementPeriod[] = ["monthly", "threeMonths", "sixMonths"];

const PERIOD_LABEL_KEYS: Record<PastAchievementPeriod, string> = {
  monthly: "progressLogging.periodMonthly",
  threeMonths: "progressLogging.periodThreeMonths",
  sixMonths: "progressLogging.periodSixMonths",
};

const ANALYTICS_VIEWS: MemorisationAnalyticsView[] = [
  "completedVsIncomplete",
  "completedVsTimeSpent",
];

const ANALYTICS_VIEW_LABEL_KEYS: Record<MemorisationAnalyticsView, string> = {
  completedVsIncomplete: "progressLogging.analyticsCompletedVsIncomplete",
  completedVsTimeSpent: "progressLogging.analyticsCompletedVsTimeSpent",
};

const PERIOD_DELTA_LABEL_KEYS: Record<PastAchievementPeriod, string> = {
  monthly: "progressLogging.previousMonth",
  threeMonths: "progressLogging.previousThreeMonthsShort",
  sixMonths: "progressLogging.previousSixMonthsShort",
};

const PERIOD_INSIGHT_SUBTITLE: Record<PastAchievementPeriod, string> = {
  monthly: "VS. LAST MONTH",
  threeMonths: "VS. LAST 3 MONTHS",
  sixMonths: "VS. LAST 6 MONTHS",
};

const QURAN_INSIGHT_ICON_SIZE = 14;

function getMemorisationInsightIcon(card: InsightCardData) {
  const title = card.title.toUpperCase();
  const name = card.iconName;
  if (name === "calendar-outline" || title.includes("GOAL TRACKED")) {
    return <InsightCardGoalTrackedIcon size={QURAN_INSIGHT_ICON_SIZE} />;
  }
  if (
    name === "checkmark-circle-outline" ||
    title.includes("COMPLETED") ||
    title.includes("MEMORIZED")
  ) {
    return <InsightCardTickIcon size={QURAN_INSIGHT_ICON_SIZE} />;
  }
  if (name === "flash" || title.includes("STREAK")) {
    return <InsightCardFlashIcon size={QURAN_INSIGHT_ICON_SIZE} />;
  }
  if (name === "sparkles" || title.includes("BEST")) {
    return <InsightCardGoodDayIcon size={QURAN_INSIGHT_ICON_SIZE} />;
  }
  if (name === "scale-balance" || title.includes("AVERAGE")) {
    return <InsightCardWeeklyAverageIcon size={QURAN_INSIGHT_ICON_SIZE} />;
  }
  if (
    name === "time-outline" ||
    title.includes("TIME") ||
    name === "book-outline"
  ) {
    return <InsightCardTimeSpentIcon size={QURAN_INSIGHT_ICON_SIZE} />;
  }
  return undefined;
}

export function HizbMemorisationPastAchievements({
  goalId,
  isDetailed = false,
  initialPeriod = "monthly",
  initialAnalyticsView = "completedVsIncomplete",
  initialHizbId = "all",
}: {
  goalId: HizbMemorisationGoalId;
  isDetailed?: boolean;
  initialPeriod?: PastAchievementPeriod;
  initialAnalyticsView?: MemorisationAnalyticsView;
  initialHizbId?: string;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const hizbContext = useOptionalMemorisationHizbContext();
  const [period, setPeriod] = useState<PastAchievementPeriod>(initialPeriod);
  const [analyticsView, setAnalyticsView] =
    useState<MemorisationAnalyticsView>(initialAnalyticsView);
  const [hizbFilter, setHizbFilter] = useState<MemorisationHizbFilterId>(
    initialHizbId ?? "all",
  );
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);
  const goalData = getGoalById(goalId);
  const studyMaterial = goalData?.studyMaterial ?? [];

  const selectedHizbId: MemorisationHizbFilterId = hizbFilter;
  const refreshKey = hizbContext?.refreshKey ?? 0;
  const isHizbDrillDown = isDetailed && selectedHizbId !== "all";

  const hizbFilters = useMemo(
    () => getMemorisationHizbPastAchievementFilters(),
    [refreshKey],
  );

  const hizbDisplayName =
    hizbFilters.find((filter) => filter.id === selectedHizbId)?.hizbName ?? "";

  const goalUnitLabel = useMemo(() => {
    if (selectedHizbId === "all") {
      return t("monthlyGoalPlanner.hizbUnit_other");
    }
    return t("progressLogging.unitAyahs");
  }, [selectedHizbId, t]);

  const allPeriodSlice = useMemo(
    () => getQuranMemorisationHizbPastAchievementSlice(period, "all"),
    [period, refreshKey],
  );

  const periodSlice = useMemo(
    () =>
      getQuranMemorisationHizbPastAchievementSlice(period, selectedHizbId),
    [period, selectedHizbId, refreshKey],
  );

  const hasLogs = useMemo(
    () => hasMemorisationHizbPastAchievementLogs(periodSlice),
    [periodSlice],
  );

  const baseAchievement = useMemo(
    () => getQuranMemorisationHizbPastAchievement(period, selectedHizbId),
    [period, selectedHizbId, refreshKey],
  );

  const compactAchievement = useMemo(
    () => getHizbMemorisationPastAchievement(selectedHizbId),
    [selectedHizbId, refreshKey],
  );

  const timeSpentByPeriod = useMemo(
    () => getMemorisationHizbTimeSpentByPeriod(periodSlice),
    [periodSlice],
  );

  const achievement = useMemo(
    () =>
      applyMemorisationHizbAnalyticsView(
        baseAchievement,
        periodSlice,
        analyticsView,
      ),
    [analyticsView, baseAchievement, periodSlice],
  );

  const chartAchievement = useMemo(() => {
    if (analyticsView === "completedVsTimeSpent") {
      return applyTimeSpentOnlyGreenChart(baseAchievement, timeSpentByPeriod);
    }
    return achievement;
  }, [achievement, analyticsView, baseAchievement, timeSpentByPeriod]);

  const chartFormatBarValue = useMemo(() => {
    if (analyticsView === "completedVsTimeSpent") {
      return (hours: number) =>
        formatMemorisationHizbTimeSpentChip(Math.round(hours * 60));
    }
    return (value: number) =>
      t("progressLogging.memorisationAyahCount", {
        count: formatNumber(value),
      });
  }, [analyticsView, formatNumber, t]);

  const totalTimeSpentMinutes = useMemo(
    () => getTotalMemorisationHizbTimeSpentMinutes(timeSpentByPeriod),
    [timeSpentByPeriod],
  );

  const goalTrackedMonths = getMemorisationHizbGoalTrackedMonths(period);
  const totalMemorizedVerses = getTotalHizbMemorizedVerses(periodSlice);

  const progressRailRows = useMemo(
    () =>
      getMemorisationHizbProgressRailRows(
        allPeriodSlice,
        periodSlice,
        selectedHizbId,
        selectedBarIndex,
      ),
    [allPeriodSlice, periodSlice, selectedBarIndex, selectedHizbId],
  );

  const selectedBaseBar =
    selectedBarIndex !== null
      ? baseAchievement.chartData[selectedBarIndex]
      : null;

  const displayBaseCompleted =
    selectedBaseBar?.completedHours ?? baseAchievement.completedHours;
  const displayBaseIncomplete =
    selectedBaseBar?.incompleteHours ?? baseAchievement.incompleteHours;

  const showNoDataDash = isPastAchievementBarEmpty(
    displayBaseCompleted,
    displayBaseIncomplete,
  );

  const selectedPeriodTimeSpentMinutes =
    selectedBarIndex !== null
      ? (timeSpentByPeriod[selectedBarIndex] ?? 0)
      : totalTimeSpentMinutes;

  const selectedBarGoalTotal = useMemo(() => {
    if (selectedBarIndex === null) return 0;
    if (selectedBaseBar) {
      return Math.max(
        selectedBaseBar.stackTotalHours,
        displayBaseCompleted + displayBaseIncomplete,
        1,
      );
    }
    return periodSlice.totalAyahs;
  }, [
    displayBaseCompleted,
    displayBaseIncomplete,
    periodSlice.totalAyahs,
    selectedBarIndex,
    selectedBaseBar,
  ]);

  useEffect(() => {
    if (initialHizbId) {
      setHizbFilter(initialHizbId);
    }
  }, [initialHizbId]);

  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [period, goalId, selectedHizbId, analyticsView]);

  const handlePeriodChange = useCallback((next: PastAchievementPeriod) => {
    setPeriod(next);
  }, []);

  const handleBarPressDetailed = useCallback((index: number | null) => {
    setHintDismissed(true);
    setSelectedBarIndex(index);
  }, []);

  const handleCloseBarSelection = useCallback(() => {
    setSelectedBarIndex(null);
  }, []);

  const handleSelectHizbFilter = useCallback((id: MemorisationHizbFilterId) => {
    setHizbFilter(id);
    setSelectedBarIndex(null);
  }, []);

  const handleNavigateToDetailed = useCallback(() => {
    router.push({
      pathname: "/(private)/pastachievementdetailedstatistics",
      params: {
        goalId,
        period,
        analyticsView,
        goalCategory: "hizb",
        goalType: "quran_memorisation_hizb",
        selectedHizbFilter:
          selectedHizbId === "all" ? undefined : selectedHizbId,
      },
    });
  }, [analyticsView, goalId, period, router, selectedHizbId]);

  const showChartHint =
    isDetailed && !hintDismissed && selectedBarIndex === null;
  const deltaIsPositive = baseAchievement.previousPeriodDeltaPercent >= 0;

  const showDetailedStatsChevron = useMemo(() => {
    if (isDetailed) return false;
    if ((compactAchievement.memorizedAyahs ?? 0) > 0) return true;
    if ((compactAchievement.progressPercent ?? 0) > 0) return true;
    return compactAchievement.chartData.some(
      (item) => (item.completedHours ?? 0) > 0,
    );
  }, [
    compactAchievement.chartData,
    compactAchievement.memorizedAyahs,
    compactAchievement.progressPercent,
    isDetailed,
  ]);

  const showDeltaChip =
    !showNoDataDash &&
    Math.abs(baseAchievement.previousPeriodDeltaPercent) > 0;

  const renderAnalyticsToggle = () => (
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
  );

  const renderCompletedIncompleteStats = (noData: boolean) => (
    <View style={styles.statsRow}>
      <View style={styles.statColumn}>
        <Text style={styles.statLabel}>{t("progressLogging.completed")}</Text>
        <Text style={styles.statValueCompleted}>
          {noData ? PAST_ACHIEVEMENT_NO_DATA : formatNumber(displayBaseCompleted)}
        </Text>
      </View>
      <View style={styles.statColumn}>
        <Text style={styles.statLabel}>
          {analyticsView === "completedVsTimeSpent"
            ? t("progressLogging.timeSpentLabel")
            : t("progressLogging.incomplete")}
        </Text>
        <Text
          style={
            analyticsView === "completedVsTimeSpent"
              ? styles.statValueCompleted
              : styles.statValueIncomplete
          }
        >
          {analyticsView === "completedVsTimeSpent"
            ? noData
              ? PAST_ACHIEVEMENT_NO_DATA
              : formatMemorisationHizbTimeSpentLabel(selectedPeriodTimeSpentMinutes)
            : noData
              ? PAST_ACHIEVEMENT_NO_DATA
              : formatNumber(displayBaseIncomplete)}
        </Text>
      </View>
    </View>
  );

  const renderGoalHeader = () => (
    <View style={styles.goalHeader}>
      <Text style={styles.goalLabel}>{t("progressLogging.goal")}</Text>
      <View style={styles.goalPillRow}>
        <Text style={styles.goalPillValue}>
          {showNoDataDash
            ? PAST_ACHIEVEMENT_NO_DATA
            : formatNumber(periodSlice.totalAyahs)}{" "}
        </Text>
        <View style={styles.goalPill}>
          <Text style={styles.goalPillText}>{goalUnitLabel}</Text>
        </View>
      </View>
    </View>
  );

  const renderPeriodToggle = () => (
    <View style={styles.periodToggleListening}>
      {PERIODS.map((item) => {
        const isActive = period === item;
        return (
          <Pressable
            key={item}
            onPress={() => handlePeriodChange(item)}
            style={[
              styles.periodButtonListening,
              isActive
                ? styles.periodButtonActive
                : styles.periodButtonInactive,
            ]}
          >
            <Text
              style={[
                styles.periodButtonTextListening,
                isActive && styles.periodButtonTextActive,
              ]}
            >
              {t(PERIOD_LABEL_KEYS[item])}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderDateNav = () => (
    <View style={styles.dateNavRow}>
      <TouchableOpacity activeOpacity={0.7} style={styles.navBtn} disabled>
        <Ionicons
          name="chevron-back"
          size={24}
          color={Colors.light.subtext}
        />
      </TouchableOpacity>
      <Text style={styles.dateRange} numberOfLines={1} ellipsizeMode="tail">
        {baseAchievement.dateRangeLabel}
      </Text>
      <TouchableOpacity activeOpacity={0.7} style={styles.navBtn} disabled>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={Colors.light.subtext}
        />
      </TouchableOpacity>
    </View>
  );

  const renderHizbFilterTabs = () => {
    if (!isDetailed) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles.surahTabsRow}
      >
        {hizbFilters.map((filter) => {
          const isActive = selectedHizbId === filter.id;
          const label =
            filter.id === "all"
              ? t("progressLogging.hizbFilterAll")
              : filter.hizbName;

          return (
            <TouchableOpacity
              key={filter.id}
              activeOpacity={0.7}
              onPress={() => handleSelectHizbFilter(filter.id)}
              style={[
                styles.surahTab,
                isActive ? styles.surahTabActive : styles.surahTabInactive,
              ]}
            >
              <Text
                style={[
                  styles.surahTabText,
                  isActive && styles.surahTabTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderDetailedSummary = () => {
    if (
      selectedBarIndex !== null &&
      periodSlice.chartPeriods[selectedBarIndex]
    ) {
      const selectedPeriod = periodSlice.chartPeriods[selectedBarIndex];
      const percent = Math.min(
        100,
        Math.round(
          (selectedPeriod.completed /
            Math.max(selectedPeriod.completed + selectedPeriod.incomplete, 1)) *
            100,
        ),
      );

      return (
        <Text style={styles.summaryTextDetailed}>
          {t("progressLogging.memorisationHizbDetailedSummaryBar", {
            range: selectedPeriod.dateLabel,
            memorized: formatNumber(selectedPeriod.completed),
            hizb:
              selectedHizbId === "all"
                ? t("progressLogging.memorisationAllHizbsTitle")
                : hizbDisplayName,
            percent: formatNumber(percent),
          })}
        </Text>
      );
    }

    const summaryKey =
      period === "monthly"
        ? "progressLogging.memorisationHizbDetailedSummaryMonthly"
        : period === "threeMonths"
          ? "progressLogging.memorisationHizbDetailedSummaryThreeMonths"
          : "progressLogging.memorisationHizbDetailedSummarySixMonths";

    return (
      <Text style={styles.summaryTextDetailed}>
        {t(summaryKey, {
          percent: formatNumber(periodSlice.achievementPercent),
          memorized: formatNumber(periodSlice.memorizedAyahs),
          total: formatNumber(periodSlice.totalAyahs),
          hizb:
            selectedHizbId === "all"
              ? t("progressLogging.memorisationAllHizbsTitle")
              : hizbDisplayName,
          delta: formatNumber(Math.abs(periodSlice.previousPeriodDeltaPercent)),
          direction: deltaIsPositive
            ? t("progressLogging.periodComparisonIncrease")
            : t("progressLogging.periodComparisonDecrease"),
        })}
      </Text>
    );
  };

  const renderInsights = () => (
    <View style={styles.insightsSection}>
      <View style={styles.insightsHeader}>
        <Text style={styles.insightsTitleLabel}>
          {t("progressLogging.keyInsights")}
        </Text>
        <Text style={styles.insightsSubtitleLabel}>
          {PERIOD_INSIGHT_SUBTITLE[period]}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles.insightsScrollContent}
      >
        <InsightCard
          iconName="calendar-outline"
          icon={getMemorisationInsightIcon({
            iconFamily: "Ionicons",
            iconName: "calendar-outline",
            title: t("progressLogging.recitationInsightGoalTracked"),
            value: String(goalTrackedMonths),
          })}
          title={t("progressLogging.recitationInsightGoalTracked")}
          value={formatNumber(goalTrackedMonths)}
          subValue={t("progressLogging.recitationInsightMonths")}
          style={styles.insightCardFixed}
        />
        <InsightCard
          iconName="book-outline"
          icon={getMemorisationInsightIcon({
            iconFamily: "Ionicons",
            iconName: "book-outline",
            title: t("progressLogging.memorisationInsightTotalMemorized"),
            value: String(totalMemorizedVerses),
          })}
          title={t("progressLogging.memorisationInsightTotalMemorized")}
          value={formatNumber(totalMemorizedVerses)}
          subValue={t("progressLogging.memorisationInsightVersesMemorized")}
          style={styles.insightCardFixed}
        />
      </ScrollView>
    </View>
  );

  if (!isDetailed) {
    return (
      <View style={styles.section}>
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

          <View style={styles.achievementPeriodRow}>
            <View style={styles.achievementBlockCompact}>
              <Text style={styles.achievementCaptionCompact}>
                {t("progressLogging.achievementsLabel").toUpperCase()}
              </Text>
              <View style={styles.achievementPercentRow}>
                <Text style={styles.achievementPercentCompact}>
                  {showNoDataDash
                    ? PAST_ACHIEVEMENT_NO_DATA
                    : formatNumber(baseAchievement.achievementPercent)}
                </Text>
                {!showNoDataDash ? (
                  <Text style={styles.achievementPercentSymbolCompact}>%</Text>
                ) : null}
              </View>
            </View>
            {renderPeriodToggle()}
          </View>

          <View style={styles.deltaDateRow}>
            <View style={styles.deltaSlot}>
              {showDeltaChip ? (
                <View style={styles.deltaBadgeCompact}>
                  {deltaIsPositive ? (
                    <PositiveProgressIcon />
                  ) : (
                    <NegativeProgressIcon />
                  )}
                  <Text style={styles.deltaTextCompact} numberOfLines={1}>
                    {`${formatNumber(Math.abs(baseAchievement.previousPeriodDeltaPercent))}% ${t(PERIOD_DELTA_LABEL_KEYS[period])}`}
                  </Text>
                </View>
              ) : (
                <View style={styles.deltaBadgePlaceholder} />
              )}
            </View>
            <View style={styles.periodNavUnderToggle}>{renderDateNav()}</View>
          </View>

          {renderGoalHeader()}
          {renderAnalyticsToggle()}
          {renderCompletedIncompleteStats(showNoDataDash)}

          <View
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => false}
          >
            <QuranHoursPastAchievementChartBlock
              chartData={chartAchievement?.chartData ?? []}
              selectedBarIndex={null}
              onBarPress={() => {}}
              chartKey={`${goalId}-${period}-${selectedHizbId}-${analyticsView}-${refreshKey}`}
              yMax={chartAchievement?.yMax ?? compactAchievement.yMax}
              yTicks={chartAchievement?.yTicks ?? compactAchievement.yTicks}
              showHint={false}
              onDismissHint={() => setHintDismissed(true)}
              hintText={t("progressLogging.chartTapHint")}
              hintActionText={t("progressLogging.okGotIt")}
              pageCount={
                chartAchievement?.pageCount ?? compactAchievement.chartData.length
              }
              activePageIndex={0}
              formatBarValue={chartFormatBarValue}
              barColors={
                analyticsView === "completedVsTimeSpent"
                  ? [Colors.light.green, Colors.light.green]
                  : [Colors.light.green, Colors.light.warning]
              }
            />
          </View>
        </View>

        {renderInsights()}

        <PastAchievementStudyMaterial items={studyMaterial} showSeeAll={false} />
      </View>
    );
  }

  return (
    <View style={[styles.section, styles.sectionDetailed]}>
      <View style={styles.card}>
        <View style={styles.cardHeaderBlock}>
          <View style={styles.cardHeader}>
            <AchivementArrowIcon size={15} color={Colors.light.subtext} />
            <Text style={[styles.sectionTitle, styles.sectionTitleDetailed]}>
              {t("progressLogging.pastGoalAchievements")}
            </Text>
          </View>
          {isHizbDrillDown && analyticsView === "completedVsIncomplete" ? (
            <Text style={styles.drillDownHeader}>
              {t("progressLogging.memorisationHizbDrillDownHeader", {
                analytics: t(ANALYTICS_VIEW_LABEL_KEYS[analyticsView]),
                hizb: hizbDisplayName,
              })}
            </Text>
          ) : null}
        </View>

        <View style={styles.achievementPeriodRow}>
          <View style={styles.achievementBlockCompact}>
            <Text style={styles.achievementCaptionCompact}>
              {t("progressLogging.achievementsLabel").toUpperCase()}
            </Text>
            <View style={styles.achievementPercentRow}>
              <Text style={styles.achievementPercentCompact}>
                {showNoDataDash
                  ? PAST_ACHIEVEMENT_NO_DATA
                  : formatNumber(baseAchievement.achievementPercent)}
              </Text>
              {!showNoDataDash ? (
                <Text style={styles.achievementPercentSymbolCompact}>%</Text>
              ) : null}
            </View>
          </View>
          {renderPeriodToggle()}
        </View>

        <View style={styles.deltaDateRow}>
          <View style={styles.deltaSlot}>
            {showDeltaChip ? (
              <View style={styles.deltaBadgeCompact}>
                {deltaIsPositive ? (
                  <PositiveProgressIcon />
                ) : (
                  <NegativeProgressIcon />
                )}
                <Text style={styles.deltaTextCompact} numberOfLines={1}>
                  {`${formatNumber(Math.abs(baseAchievement.previousPeriodDeltaPercent))}% ${t(PERIOD_DELTA_LABEL_KEYS[period])}`}
                </Text>
              </View>
            ) : (
              <View style={styles.deltaBadgePlaceholder} />
            )}
          </View>
          <View style={styles.periodNavUnderToggle}>{renderDateNav()}</View>
        </View>

        {renderDetailedSummary()}
        {renderHizbFilterTabs()}

        {renderGoalHeader()}
        {renderAnalyticsToggle()}
        {renderCompletedIncompleteStats(showNoDataDash)}

        {isHizbDrillDown && !hasLogs ? (
          <View style={styles.emptyStateInline}>
            <Text style={styles.emptyStateText}>
              {t("progressLogging.memorisationHizbNoDataForPeriod")}
            </Text>
          </View>
        ) : null}

        <View
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => false}
        >
          <QuranHoursPastAchievementChartBlock
            chartData={chartAchievement?.chartData ?? []}
            selectedBarIndex={selectedBarIndex}
            onBarPress={handleBarPressDetailed}
            chartKey={`${goalId}-${period}-${selectedHizbId}-${analyticsView}`}
            yMax={chartAchievement?.yMax ?? 10}
            yTicks={chartAchievement?.yTicks ?? [0, 5, 10]}
            showHint={showChartHint}
            onDismissHint={() => setHintDismissed(true)}
            hintText={t("progressLogging.chartTapHint")}
            hintActionText={t("progressLogging.okGotIt")}
            pageCount={chartAchievement?.pageCount ?? 1}
            activePageIndex={
              selectedBarIndex ?? chartAchievement?.activePageIndex ?? 0
            }
            formatBarValue={chartFormatBarValue}
            showPagination
            barColors={
              analyticsView === "completedVsTimeSpent"
                ? [Colors.light.green, Colors.light.green]
                : [Colors.light.green, Colors.light.warning]
            }
          />
        </View>

        <GraphBarSelectionFooter
          visible={selectedBarIndex !== null}
          completed={displayBaseCompleted}
          incomplete={displayBaseIncomplete}
          goalTotal={selectedBarGoalTotal}
          onClose={handleCloseBarSelection}
        />

        {progressRailRows.length > 0 ? (
          <View style={styles.progressRailSection}>
            {progressRailRows.map((row) => (
              <MemorisationHizbDetailCard
                key={`memorisation-hizb-rail-${row.hizbId}`}
                row={row}
                analyticsView={analyticsView}
                formatTimeChip={formatMemorisationHizbTimeSpentChip}
              />
            ))}
          </View>
        ) : null}
      </View>

      {renderInsights()}
    </View>
  );
}
