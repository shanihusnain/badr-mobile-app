import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import {
  InsightCardFlashIcon,
  InsightCardGoalTrackedIcon,
  InsightCardGoodDayIcon,
  InsightCardTickIcon,
  InsightCardTimeSpentIcon,
  InsightCardWeeklyAverageIcon,
  AchivementArrowIcon,
  NegativeProgressIcon,
  PositiveProgressIcon,
} from "@/assets/icons";
import {
  formatDuration,
  formatGoalHoursLabel,
  getQuranHoursPastAchievement,
  hoursToMinutes,
  toHoursPastAchievementSummary,
  type PastAchievementPeriod,
} from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import type { QuranHoursGoalId } from "@/src/screens/private/goalprogressloggingscreen/types";
import {
  PAST_ACHIEVEMENT_NO_DATA,
  isPastAchievementBarEmpty,
} from "@/src/utils/pastAchievementNoData";
import { QuranHoursPastAchievementChartBlock } from "./QuranHoursPastAchievementChartBlock";
import { GraphBarSelectionFooter } from "./GraphBarSelectionFooter";
import { ListeningPastAchievementMetricsSection } from "./ListeningPastAchievementMetricsSection";
import { InsightCard } from "../InsightCard";
import type { InsightCardData } from "../PrayerPastAchievements/insightCardsData";
import { TopSpace } from "@/components/atoms/TopSpace";
import { getGoalById } from "@/src/screens/private/home/components/goalsData";
import { PastAchievementStudyMaterial } from "@/components/molecules/PastAchievementStudyMaterial";
import { useGetQuranGoalAchievements } from "@/src/api/queries/useGetQuranGoalAchievements";
import { resolveQuranTypeFromGoalId } from "@/src/utils/quranGoalMap";
import {
  createEmptyQuranHoursAchievement,
  mapQuranApiKeyInsightsToCards,
  mapQuranGoalAchievementsToUi,
  type MappedQuranHoursAchievements,
} from "@/src/utils/quranHoursGoalAchievementsMap";
import { shiftPrayerAchievementsPeriodStart } from "@/src/utils/prayerGoalAchievementsMap";

type Props = {
  goalId: QuranHoursGoalId;
  isDetailed?: boolean;
  initialPeriod?: PastAchievementPeriod;
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
const PERIOD_DELTA_LABEL_KEYS_TAJWEED: Record<PastAchievementPeriod, string> = {
  monthly: "progressLogging.previousMonth",
  threeMonths: "progressLogging.previousThreeMonthsShort",
  sixMonths: "progressLogging.previousSixMonthsShort",
};

const DETAILED_SUMMARY_KEYS: Record<
  QuranHoursGoalId,
  Record<PastAchievementPeriod, string>
> = {
  "quran-listening": {
    monthly: "progressLogging.listeningDetailedSummaryMonthly",
    threeMonths: "progressLogging.listeningDetailedSummaryThreeMonths",
    sixMonths: "progressLogging.listeningDetailedSummarySixMonths",
  },
  "quran-Tajweed": {
    monthly: "progressLogging.tajweedDetailedSummaryMonthly",
    threeMonths: "progressLogging.tajweedDetailedSummaryThreeMonths",
    sixMonths: "progressLogging.tajweedDetailedSummarySixMonths",
  },
};

const DETAILED_SUMMARY_WEEK_KEYS: Record<QuranHoursGoalId, string> = {
  "quran-listening": "progressLogging.listeningDetailedSummaryWeek",
  "quran-Tajweed": "progressLogging.tajweedDetailedSummaryWeek",
};

const DETAILED_SUMMARY_MONTH_BAR_KEYS: Record<QuranHoursGoalId, string> = {
  "quran-listening": "progressLogging.listeningDetailedSummaryMonthBar",
  "quran-Tajweed": "progressLogging.tajweedDetailedSummaryMonthBar",
};

const PERIOD_INSIGHT_SUBTITLE: Record<PastAchievementPeriod, string> = {
  monthly: "VS. LAST MONTH",
  threeMonths: "VS. LAST 3 MONTHS",
  sixMonths: "VS. LAST 6 MONTHS",
};

const GOAL_TYPE_KEYS: Record<QuranHoursGoalId, string> = {
  "quran-listening": "quran_listening",
  "quran-Tajweed": "quran_tajweed",
};

const LOADING_DASH = "---";
const QURAN_INSIGHT_ICON_SIZE = 14;

/** Compact clock label for Tajweed bar values, e.g. 4.5 → "4:30". */
function formatHoursAsClockLabel(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

function getQuranHoursInsightIcon(card: InsightCardData) {
  const title = card.title.toUpperCase();
  const name = card.iconName;
  if (name === "calendar-outline" || title.includes("GOAL TRACKED")) {
    return <InsightCardGoalTrackedIcon size={QURAN_INSIGHT_ICON_SIZE} />;
  }
  if (name === "checkmark-circle-outline" || title.includes("COMPLETED")) {
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
  if (name === "time-outline" || title.includes("TIME")) {
    return <InsightCardTimeSpentIcon size={QURAN_INSIGHT_ICON_SIZE} />;
  }
  return undefined;
}

export function QuranHoursPastAchievements({
  goalId,
  isDetailed = false,
  initialPeriod = "monthly",
}: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const formatNumber = useLocaleNumber();
  const [period, setPeriod] = useState<PastAchievementPeriod>(initialPeriod);
  const [periodStartParam, setPeriodStartParam] = useState<string | null>(null);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);
  const goalData = getGoalById(goalId);
  const studyMaterial = goalData?.studyMaterial ?? [];

  const quranGoalType = resolveQuranTypeFromGoalId(goalId);
  const usesAchievementsApi =
    quranGoalType === "LISTENING" || quranGoalType === "TAJWEED";

  const { data: achievementsApiData, isLoading: isAchievementsLoading } =
    useGetQuranGoalAchievements(quranGoalType, {
      period,
      periodStart: periodStartParam,
      enabled: usesAchievementsApi && !!quranGoalType,
    });

  const showPlaceholders =
    usesAchievementsApi && (!achievementsApiData || isAchievementsLoading);

  const achievement = useMemo(() => {
    if (usesAchievementsApi) {
      if (!achievementsApiData) return createEmptyQuranHoursAchievement();
      return mapQuranGoalAchievementsToUi(achievementsApiData, period);
    }
    return getQuranHoursPastAchievement(goalId, period);
  }, [usesAchievementsApi, achievementsApiData, goalId, period]);

  const hoursGoalSummary = useMemo(
    () => toHoursPastAchievementSummary(achievement, period),
    [achievement, period],
  );

  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [period, goalId, periodStartParam]);

  const handlePeriodChange = useCallback((next: PastAchievementPeriod) => {
    setPeriod(next);
    setPeriodStartParam(null);
  }, []);

  const handleNavigateBack = useCallback(() => {
    if (!usesAchievementsApi || !achievementsApiData) return;
    const canBack =
      achievementsApiData.canNavigateBack ??
      achievementsApiData.hasPrevious ??
      false;
    if (!canBack) return;
    const nextStart = shiftPrayerAchievementsPeriodStart(
      achievementsApiData.periodStart,
      achievementsApiData.periodEnd,
      -1,
    );
    setPeriodStartParam(nextStart);
  }, [usesAchievementsApi, achievementsApiData]);

  const handleNavigateForward = useCallback(() => {
    if (!usesAchievementsApi || !achievementsApiData) return;
    const canForward =
      achievementsApiData.canNavigateForward ??
      achievementsApiData.hasNext ??
      false;
    if (!canForward) return;
    const nextStart = shiftPrayerAchievementsPeriodStart(
      achievementsApiData.periodStart,
      achievementsApiData.periodEnd,
      1,
    );
    setPeriodStartParam(nextStart);
  }, [usesAchievementsApi, achievementsApiData]);

  const canNavigateBack = usesAchievementsApi
    ? !showPlaceholders &&
      !!(
        achievementsApiData?.canNavigateBack ?? achievementsApiData?.hasPrevious
      )
    : true;
  const canNavigateForward = usesAchievementsApi
    ? !showPlaceholders &&
      !!(
        achievementsApiData?.canNavigateForward ?? achievementsApiData?.hasNext
      )
    : true;

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

  const handleNavigateToDetailed = useCallback(() => {
    router.push({
      pathname: "/(private)/pastachievementdetailedstatistics",
      params: {
        goalId,
        period,
        goalType: GOAL_TYPE_KEYS[goalId],
      },
    });
  }, [goalId, period, router]);

  const selectedWeek =
    !showPlaceholders && selectedBarIndex !== null
      ? achievement.chartData[selectedBarIndex]
      : null;
  const selectedPeriodAchievement =
    !showPlaceholders && selectedBarIndex !== null
      ? hoursGoalSummary.achievements[selectedBarIndex]
      : null;

  const displayCompletedHours =
    selectedWeek?.completedHours ?? achievement.completedHours;
  const displayIncompleteHours =
    selectedWeek?.incompleteHours ?? achievement.incompleteHours;
  const displayCompletedMinutes =
    selectedPeriodAchievement?.completedMinutes ??
    hoursGoalSummary.totalCompletedMinutes;
  const displayIncompleteMinutes =
    selectedPeriodAchievement?.incompleteMinutes ??
    hoursGoalSummary.totalIncompleteMinutes;
  const displayGoalHours = selectedWeek
    ? selectedWeek.completedHours + selectedWeek.incompleteHours
    : achievement.goalHours;

  const showNoDataDash =
    showPlaceholders ||
    isPastAchievementBarEmpty(displayCompletedHours, displayIncompleteHours);

  const mappedAchievement = achievement as MappedQuranHoursAchievements;
  const apiNarrative =
    typeof mappedAchievement.narrative === "string"
      ? mappedAchievement.narrative
      : null;
  const selectedBucketNarrative = selectedWeek?.narrative;
  const keyInsightsHeader =
    typeof mappedAchievement.keyInsightsHeader === "string"
      ? mappedAchievement.keyInsightsHeader
      : null;

  const insightCards = useMemo(() => {
    if (!usesAchievementsApi) return [];
    return mapQuranApiKeyInsightsToCards(achievementsApiData, {
      period,
      noDataLabel: t("progressLogging.insightNoData"),
      isLoading: showPlaceholders,
    });
  }, [usesAchievementsApi, achievementsApiData, period, showPlaceholders, t]);

  /** Same gate as PrayerPastAchievements: hide detail chevron until chart has completed data. */
  const showDetailedStatsChevron =
    !isDetailed &&
    !!achievementsApiData?.chart?.buckets?.some(
      (item) => (item?.completedMinutes ?? 0) > 0,
    );

  const selectedBarGoalTotal = useMemo(() => {
    if (selectedBarIndex === null) {
      return 0;
    }

    if (selectedWeek) {
      return Math.max(
        selectedWeek.stackTotalHours,
        displayCompletedHours + displayIncompleteHours,
        1,
      );
    }

    return displayGoalHours;
  }, [
    displayCompletedHours,
    displayIncompleteHours,
    displayGoalHours,
    selectedBarIndex,
    selectedWeek,
  ]);

  const showChartHint =
    isDetailed && !hintDismissed && selectedBarIndex === null;
  const deltaIsPositive = achievement.previousPeriodDeltaPercent >= 0;

  const renderDetailedSummary = () => {
    if (showPlaceholders) {
      return <Text style={styles.summaryTextDetailed}>{LOADING_DASH}</Text>;
    }

    if (selectedBucketNarrative?.trim()) {
      return (
        <Text style={styles.summaryTextDetailed}>
          {selectedBucketNarrative.trim()}
        </Text>
      );
    }

    if (
      selectedBarIndex === null &&
      typeof apiNarrative === "string" &&
      apiNarrative.trim()
    ) {
      return (
        <Text style={styles.summaryTextDetailed}>{apiNarrative.trim()}</Text>
      );
    }

    if (selectedBarIndex !== null && selectedWeek && period === "monthly") {
      const weeklyGoal = achievement.periodGoalHours;
      const weekPercent =
        selectedWeek.achievementPct ??
        Math.min(
          100,
          Math.round(
            (selectedWeek.completedHours / Math.max(weeklyGoal, 1)) * 100,
          ),
        );

      return (
        <Text style={styles.summaryTextDetailed}>
          {t(DETAILED_SUMMARY_WEEK_KEYS[goalId], {
            week: formatNumber(selectedBarIndex + 1),
            completed: formatDuration(
              selectedWeek.completedMinutes ??
                hoursToMinutes(selectedWeek.completedHours),
            ),
            percent: formatNumber(weekPercent),
          })}
        </Text>
      );
    }

    if (selectedBarIndex !== null && selectedWeek && period !== "monthly") {
      const periodTotal =
        selectedWeek.completedHours + selectedWeek.incompleteHours;
      const monthPercent =
        selectedWeek.achievementPct ??
        Math.min(
          100,
          Math.round(
            (selectedWeek.completedHours / Math.max(periodTotal, 1)) * 100,
          ),
        );

      return (
        <Text style={styles.summaryTextDetailed}>
          {t(DETAILED_SUMMARY_MONTH_BAR_KEYS[goalId], {
            range: selectedWeek.dateLabel.replace(/\n/g, " "),
            completed: formatDuration(
              selectedWeek.completedMinutes ??
                hoursToMinutes(selectedWeek.completedHours),
            ),
            percent: formatNumber(monthPercent),
          })}
        </Text>
      );
    }

    const summaryKey = DETAILED_SUMMARY_KEYS[goalId][period];

    return (
      <Text style={styles.summaryTextDetailed}>
        {t(summaryKey, {
          percent: formatNumber(achievement.achievementPercent),
          goalTotal: formatGoalHoursLabel(achievement.goalHours),
          completed: formatDuration(hoursGoalSummary.totalCompletedMinutes),
          delta: formatNumber(Math.abs(achievement.previousPeriodDeltaPercent)),
          direction: deltaIsPositive
            ? t("progressLogging.periodComparisonIncrease")
            : t("progressLogging.periodComparisonDecrease"),
          range: achievement.dateRangeLabel,
        })}
      </Text>
    );
  };
  const formatChartBarValue = useCallback(
    (hours: number) => formatHoursAsClockLabel(hours),
    [],
  );

  const renderInsights = () => {
    if (!usesAchievementsApi) return null;
    if (!insightCards.length) return null;

    return (
      <View style={styles.insightsSection}>
        <View style={styles.insightsHeader}>
          <Text style={styles.insightsTitleLabel}>
            {t("progressLogging.keyInsights")}
          </Text>
          <Text style={styles.insightsSubtitleLabel}>
            {keyInsightsHeader?.trim() || PERIOD_INSIGHT_SUBTITLE[period]}
          </Text>
        </View>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.insightsScrollContent}
        >
          {insightCards.map((card, index) => (
            <InsightCard
              key={`${card.title}-${index}`}
              {...card}
              icon={getQuranHoursInsightIcon(card)}
              style={{
                ...styles.insightCardFixed,
                width: width * 0.42,
                maxWidth: width * 0.42,
                minWidth: width * 0.42,
              }}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.section, isDetailed && styles.sectionDetailed]}>
      <View style={styles.card}>
            <View style={styles.cardHeader}>
              <AchivementArrowIcon size={15} color={Colors.light.subtext} />
              <Text style={styles.sectionTitleTajweed}>
                {t("progressLogging.pastGoalAchievements")}
              </Text>
              {!isDetailed && showDetailedStatsChevron ? (
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

            <View style={styles.tajweedAchievementPeriodRow}>
              <View style={styles.achievementBlockTajweed}>
                <Text style={styles.achievementCaptionTajweed}>
                  ACHIEVEMENT
                </Text>
                <View style={styles.achievementPercentRow}>
                  <Text style={styles.achievementPercentTajweed}>
                    {showPlaceholders
                      ? LOADING_DASH
                      : showNoDataDash
                        ? PAST_ACHIEVEMENT_NO_DATA
                        : formatNumber(achievement.achievementPercent)}
                  </Text>
                  {!showPlaceholders ? (
                    <Text style={styles.achievementPercentSymbolTajweed}>%</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.periodToggleTajweed}>
                {PERIODS.map((item) => {
                  const isActive = period === item;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => handlePeriodChange(item)}
                      style={[
                        styles.periodButtonTajweed,
                        isActive
                          ? styles.periodButtonActive
                          : styles.periodButtonInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.periodButtonTextTajweed,
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

            <View style={styles.tajweedDeltaDateRow}>
              <View style={styles.deltaSlot}>
                {!showPlaceholders ? (
                  <View style={styles.deltaBadgeTajweed}>
                    {deltaIsPositive ? (
                      <PositiveProgressIcon />
                    ) : (
                      <NegativeProgressIcon />
                    )}
                    <Text style={styles.deltaTextTajweed} numberOfLines={1}>
                      {`${formatNumber(Math.abs(achievement.previousPeriodDeltaPercent))}% ${t(PERIOD_DELTA_LABEL_KEYS_TAJWEED[period])}`}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.deltaBadgePlaceholder} />
                )}
              </View>
              <View style={styles.periodNavRowTajweed}>
                <View style={styles.dateNavRowTajweed}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.navBtnTajweed}
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
                    style={styles.dateRangeTajweed}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {showPlaceholders
                      ? LOADING_DASH
                      : achievement.dateRangeLabel}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.navBtnTajweed}
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

            <View style={styles.goalHeaderTajweed}>
              <Text style={styles.goalLabelTajweed}>
                {t("progressLogging.goal")}
              </Text>
              <View style={styles.goalValueRowTajweed}>
                <Text style={styles.goalPillValueTajweed}>
                  {showPlaceholders
                    ? LOADING_DASH
                    : showNoDataDash
                      ? PAST_ACHIEVEMENT_NO_DATA
                      : formatNumber(
                          isDetailed ? displayGoalHours : achievement.goalHours,
                        )}
                </Text>
                <View style={styles.goalPillTajweed}>
                  <Text style={styles.goalPillTextTajweed}>
                    {t("progressLogging.unitHours")}
                  </Text>
                </View>
              </View>
            </View>

        {isDetailed ? (
          <ListeningPastAchievementMetricsSection
            completedMinutes={displayCompletedMinutes}
            incompleteMinutes={displayIncompleteMinutes}
            formatDuration={
              showNoDataDash ? () => PAST_ACHIEVEMENT_NO_DATA : formatDuration
            }
            completedLabel={t("progressLogging.completed")}
            incompleteLabel={t("progressLogging.incomplete")}
            completedValueColor={Colors.light.green}
            incompleteValueColor={Colors.light.yellow}
          />
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>
                {t("progressLogging.completed")}
              </Text>
              <Text style={styles.statValueCompleted}>
                {showNoDataDash
                  ? PAST_ACHIEVEMENT_NO_DATA
                  : formatDuration(hoursToMinutes(displayCompletedHours))}
              </Text>
            </View>
            <View style={[styles.statColumn, styles.statColumnEnd]}>
              <Text style={styles.statLabel}>
                {t("progressLogging.incomplete")}
              </Text>
              <Text style={styles.statValueIncomplete}>
                {showNoDataDash
                  ? PAST_ACHIEVEMENT_NO_DATA
                  : formatDuration(hoursToMinutes(displayIncompleteHours))}
              </Text>
            </View>
          </View>
        )}

        <View
          onStartShouldSetResponder={() => isDetailed}
          onMoveShouldSetResponder={() => false}
        >
          <QuranHoursPastAchievementChartBlock
            chartData={showPlaceholders ? [] : achievement.chartData}
            selectedBarIndex={
              isDetailed && !showPlaceholders ? selectedBarIndex : null
            }
            onBarPress={
              isDetailed && !showPlaceholders
                ? handleBarPressDetailed
                : handleBarPressCompact
            }
            chartKey={`${goalId}-${period}-${periodStartParam ?? "latest"}${isDetailed ? "-detailed" : ""}-${showPlaceholders ? "loading" : "ready"}`}
            yMax={achievement.yMax}
            yTicks={achievement.yTicks}
            showHint={showChartHint && !showPlaceholders}
            onDismissHint={() => setHintDismissed(true)}
            hintText={t("progressLogging.chartTapHint")}
            hintActionText={t("progressLogging.okGotIt")}
            pageCount={achievement.pageCount}
            activePageIndex={selectedBarIndex ?? achievement.activePageIndex}
            formatBarValue={formatChartBarValue}
            showPagination={isDetailed}
            showAllBarValueLabels={!showPlaceholders}
            valueLabelColor={Colors.light.green}
            barColors={[Colors.light.green, Colors.light.yellow]}
          />
        </View>

        {isDetailed ? (
          <GraphBarSelectionFooter
            visible={selectedBarIndex !== null}
            completed={displayCompletedHours}
            incomplete={displayIncompleteHours}
            goalTotal={selectedBarGoalTotal}
            onClose={handleCloseBarSelection}
          />
        ) : null}
      </View>
      {renderInsights()}
      {/* 
      <PastAchievementStudyMaterial
        items={studyMaterial}
        isDetailed={isDetailed}
      /> */}
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
  compactTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    borderRadius: 14,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  cardHeaderBlock: {
    gap: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sectionTitle: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    flexShrink: 1,
  },
  sectionTitleDetailed: {
    color: Colors.light.white,
    fontSize: 13,
  },
  sectionTitleTajweed: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    letterSpacing: 0,
    textTransform: "uppercase",
    flexShrink: 1,
    marginLeft: 6,
  },
  tajweedAchievementPeriodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tajweedDeltaDateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  achievementBlockTajweed: {
    gap: 6,
    marginTop: 6,
    marginBottom: -2,
  },
  achievementCaptionTajweed: {
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
  achievementPercentTajweed: {
    color: Colors.light.white,
    fontSize: 28,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  achievementPercentSymbolTajweed: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 16,
    marginBottom: 1,
    marginLeft: 2,
  },
  deltaSlot: {
    minWidth: 0,
    marginRight: 8,
    justifyContent: "center",
    height: 24,
  },
  deltaBadgeTajweed: {
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
  deltaTextTajweed: {
    color: Colors.light.white,
    fontSize: 11,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  periodToggleTajweed: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 2,
    backgroundColor: Colors.light.blackBackground,
    borderRadius: 6,
    maxWidth: "70%",
  },
  periodButtonTajweed: {
    flex: 1,
    borderRadius: 5,
    paddingHorizontal: 0,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  periodButtonTextTajweed: {
    color: Colors.light.grey,
    fontSize: 13,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  periodNavRowTajweed: {
    width: 185,
    height: 24,
    justifyContent: "center",
    alignItems: "stretch",
    flexShrink: 0,
    marginTop: -26,
  },
  dateNavRowTajweed: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  navBtnTajweed: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  dateRangeTajweed: {
    flex: 1,
    minWidth: 0,
    color: Colors.light.white,
    fontSize: 13,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    textAlign: "center",
  },
  goalHeaderTajweed: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    backgroundColor: Colors.light.blackBackground,
    paddingLeft: 10,
    paddingRight: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  goalLabelTajweed: {
    color: Colors.light.subtext,
    fontSize: 14,
    fontFamily: fonts.primary.bold,
    fontWeight: "600",
    textTransform: "uppercase",
    lineHeight: 20,
  },
  goalValueRowTajweed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  goalPillTajweed: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 2,
    marginLeft: -4,
  },
  goalPillTextTajweed: {
    color: Colors.light.white,
    fontSize: 10,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
  goalPillValueTajweed: {
    color: Colors.light.white,
    fontWeight: "600",
    fontFamily: fonts.primary.bold,
    fontSize: 22,
  },
  achievementBlock: {
    alignItems: "flex-start",
    gap: 4,
  },
  achievementCaption: {
    color: Colors.light.subtext,
    fontSize: 13,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  achievementCaptionDetailed: {
    fontSize: 11,
    fontFamily: fonts.primary.heavy,
    fontWeight: "800",
  },
  achievementPercent: {
    color: Colors.light.white,
    fontSize: 40,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    lineHeight: 44,
  },
  achievementPercentDetailed: {
    fontSize: 28,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 28,
    textTransform: "uppercase",
  },
  achievementPercentSymbol: {
    fontSize: 22,
    lineHeight: 22,
    transform: [{ translateY: -8 }],
  },
  achievementPercentSymbolDetailed: {
    fontSize: 16,
    lineHeight: 16,
    transform: [{ translateY: -6 }],
  },
  deltaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.lightgreen,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  deltaBadgeNegative: {
    backgroundColor: Colors.light.dullWhiteOpacity,
  },
  deltaText: {
    color: Colors.light.green,
    fontSize: 11,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  deltaTextNegative: {
    color: Colors.light.subtext,
  },
  periodNavRow: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  periodToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 3,
    backgroundColor: Colors.light.blackBackground,
    borderRadius: 6,
    flexShrink: 0,
  },
  periodButton: {
    borderRadius: 5,
    paddingHorizontal: 23,
    paddingVertical: 6,
    minWidth: 36,
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: Colors.light.greybuttonBackground,
  },
  periodButtonInactive: {
    backgroundColor: Colors.light.blackBackground,
  },
  periodButtonText: {
    color: Colors.light.grey,
    fontSize: 12,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  periodButtonTextActive: {
    color: Colors.light.green,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  dateNavRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 2,
    minWidth: 0,
  },
  navBtn: {
    padding: 2,
  },
  dateRange: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    textAlign: "center",
    flexShrink: 1,
  },
  summaryText: {
    color: Colors.light.grey,
    fontSize: 12,
    fontFamily: fonts.primary.regular,
    lineHeight: 17,
    textAlign: "center",
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
    gap: 8,
  },
  goalValueBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  goalPill: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 8,
    paddingHorizontal: 2,
    paddingVertical: 5,
  },
  goalPillText: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    opacity: 0.8,
  },
  goalPillValue: {
    color: Colors.light.white,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    fontSize: 22,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statColumn: {
    gap: 4,
  },
  statColumnEnd: {
    alignItems: "flex-end",
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
    color: Colors.light.green,
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
  },
  statValueIncomplete: {
    color: Colors.light.yellow,
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
  },
  insightsTitle: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  insightsSection: {
    marginTop: 16,
  },
  insightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  insightsTitleLabel: {
    color: Colors.light.white,
    fontSize: 11,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  insightsSubtitleLabel: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  insightsScrollContent: {
    flexDirection: "row",
    gap: 10,
  },
  insightCardFixed: {
    width: 200,
    minWidth: 160,
  },
});
