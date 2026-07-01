import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
  FlatList,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import {
  formatDuration,
  formatGoalHoursLabel,
  getHoursGoalTrackedMonths,
  getQuranHoursPastAchievement,
  hoursToMinutes,
  toHoursPastAchievementSummary,
  type PastAchievementPeriod,
} from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import type { QuranHoursGoalId } from "@/src/screens/private/goalprogressloggingscreen/types";
import { INCOMPLETE_BAR_COLOR } from "./pastAchievementStyles";
import { QuranHoursPastAchievementChartBlock } from "./QuranHoursPastAchievementChartBlock";
import { GraphBarSelectionFooter } from "./GraphBarSelectionFooter";
import { ListeningPastAchievementMetricsSection } from "./ListeningPastAchievementMetricsSection";
import { InsightCard } from "../InsightCard";
import { TopSpace } from "@/components/atoms/TopSpace";
import {
  getGoalById,
  GoalData,
} from "@/src/screens/private/home/components/goalsData";
import { Image } from "expo-image";

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
const STUDY_CARD_WIDTH_RATIO = 0.42;
const STUDY_CARD_GAP = 10;
const PERIOD_LABEL_KEYS: Record<PastAchievementPeriod, string> = {
  monthly: "progressLogging.periodMonthly",
  threeMonths: "progressLogging.periodThreeMonths",
  sixMonths: "progressLogging.periodSixMonths",
};
const PERIOD_DELTA_LABEL_KEYS: Record<PastAchievementPeriod, string> = {
  monthly: "progressLogging.previousMonth",
  threeMonths: "progressLogging.previousThreeMonths",
  sixMonths: "progressLogging.previousSixMonths",
};
type StudyMaterialItem = NonNullable<GoalData["studyMaterial"]>[number];
const GOAL_SUMMARY_KEY: Record<QuranHoursGoalId, string> = {
  "quran-listening": "progressLogging.achievementSummaryListening",
  "quran-Tajweed": "progressLogging.achievementSummaryTajweed",
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

const TOTAL_TIME_INSIGHT_TITLE_KEYS: Record<QuranHoursGoalId, string> = {
  "quran-listening": "progressLogging.listeningInsightTotalListeningTime",
  "quran-Tajweed": "progressLogging.tajweedInsightTotalTime",
};

const GOAL_TYPE_KEYS: Record<QuranHoursGoalId, string> = {
  "quran-listening": "quran_listening",
  "quran-Tajweed": "quran_tajweed",
};

export function QuranHoursPastAchievements({
  goalId,
  isDetailed = false,
  initialPeriod = "monthly",
}: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const [period, setPeriod] = useState<PastAchievementPeriod>(initialPeriod);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  const studyCardWidth = screenWidth * STUDY_CARD_WIDTH_RATIO;
  const goalData = getGoalById(goalId);
  const studyMaterial = goalData?.studyMaterial ?? [];
  const achievement = useMemo(
    () => getQuranHoursPastAchievement(goalId, period),
    [goalId, period],
  );
  const hoursGoalSummary = useMemo(
    () => toHoursPastAchievementSummary(achievement, period),
    [achievement, period],
  );
  const goalTrackedMonths = useMemo(
    () => getHoursGoalTrackedMonths(period, achievement),
    [achievement, period],
  );

  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [period, goalId]);

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
    selectedBarIndex !== null ? achievement.chartData[selectedBarIndex] : null;
  const selectedPeriodAchievement =
    selectedBarIndex !== null
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
    if (selectedBarIndex !== null && selectedWeek && period === "monthly") {
      const weeklyGoal = achievement.periodGoalHours;
      const weekPercent = Math.min(
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
      const monthPercent = Math.min(
        100,
        Math.round(
          (selectedWeek.completedHours / Math.max(periodTotal, 1)) * 100,
        ),
      );

      return (
        <Text style={styles.summaryTextDetailed}>
          {t(DETAILED_SUMMARY_MONTH_BAR_KEYS[goalId], {
            range: selectedWeek.dateLabel,
            completed: formatDuration(
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

  const studyMaterialKeyExtractor = useCallback(
    (item: StudyMaterialItem) => String(item.id),
    [],
  );
  const renderStudyMaterialItem = useCallback(
    ({ item }: { item: StudyMaterialItem }) => (
      <View style={[styles.studyCard, { width: studyCardWidth }]}>
        <View style={styles.studyThumbnailWrap}>
          <Image
            source={{ uri: item.thumbnail }}
            style={styles.studyThumbnail}
            contentFit="cover"
          />
          <View style={styles.studyTypeBadge}>
            <Text
              style={{
                color: Colors.light.white,
                fontSize: 10,
                fontFamily: fonts.primary.medium,
                fontWeight: "500",
              }}
            >
              {item.type === "video"
                ? "VIDEO"
                : item.type === "podcast"
                  ? "PODCAST"
                  : "ARTICLE"}
            </Text>
          </View>
        </View>
        <Text style={styles.studyDescription} numberOfLines={3}>
          {item.description}
        </Text>
      </View>
    ),
    [studyCardWidth],
  );

  const studyItemSeparator = useCallback(
    () => <View style={{ width: STUDY_CARD_GAP }} />,
    [],
  );

  const formatChartBarValue = useCallback(
    (hours: number) => formatDuration(hoursToMinutes(hours)),
    [],
  );

  const renderInsights = () => {
    if (!isDetailed) {
      return null;
    }

    const insightCards = [
      {
        iconName: "calendar-outline" as const,
        title: t("progressLogging.recitationInsightGoalTracked"),
        value: formatNumber(goalTrackedMonths),
        subValue: t("progressLogging.recitationInsightMonths"),
      },
      {
        iconName: "time-outline" as const,
        title: t(TOTAL_TIME_INSIGHT_TITLE_KEYS[goalId]),
        value: formatNumber(hoursGoalSummary.totalActiveHours),
        subValue: t("progressLogging.listeningInsightActiveHrs"),
      },
    ];

    return (
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
          contentContainerStyle={styles.insightsScrollContent}
        >
          {insightCards.map((card) => (
            <InsightCard
              key={card.title}
              iconName={card.iconName}
              title={card.title}
              value={card.value}
              subValue={card.subValue}
              style={styles.insightCardFixed}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.section, isDetailed && styles.sectionDetailed]}>
      <View style={styles.card}>
        <View style={styles.cardHeaderBlock}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name={isDetailed ? "trending-up" : "trophy-outline"}
              size={isDetailed ? 19 : 16}
              color={isDetailed ? Colors.light.subtext : Colors.light.white}
            />
            <Text
              style={[
                styles.sectionTitle,
                isDetailed && styles.sectionTitleDetailed,
              ]}
            >
              {t("progressLogging.pastGoalAchievements")}
            </Text>
            {!isDetailed ? (
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
        </View>

        <View style={isDetailed ? styles.topRow : styles.compactTopRow}>
          <View style={[styles.achievementBlock]}>
            <Text
              style={[
                styles.achievementCaption,
                isDetailed && styles.achievementCaptionDetailed,
              ]}
            >
              {isDetailed
                ? t("progressLogging.achievementsLabel").toUpperCase()
                : t("progressLogging.achievementsLabel")}
            </Text>
            <Text
              style={[
                styles.achievementPercent,
                isDetailed && styles.achievementPercentDetailed,
              ]}
            >
              {formatNumber(achievement.achievementPercent)}
              <Text
                style={[
                  styles.achievementPercentSymbol,
                  isDetailed && styles.achievementPercentSymbolDetailed,
                ]}
              >
                %
              </Text>
            </Text>
            <View
              style={[
                styles.deltaBadge,
                !deltaIsPositive && styles.deltaBadgeNegative,
              ]}
            >
              <Ionicons
                name={deltaIsPositive ? "arrow-up" : "arrow-down"}
                size={11}
                color={
                  deltaIsPositive ? Colors.light.green : Colors.light.subtext
                }
              />
              <Text
                style={[
                  styles.deltaText,
                  !deltaIsPositive && styles.deltaTextNegative,
                ]}
              >
                {deltaIsPositive ? "+" : ""}
                {formatNumber(achievement.previousPeriodDeltaPercent)}%{" "}
                {t(PERIOD_DELTA_LABEL_KEYS[period])}
              </Text>
            </View>
          </View>
          <View style={styles.periodNavRow}>
            <View style={styles.periodToggle}>
              {PERIODS.map((item) => {
                const isActive = period === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setPeriod(item)}
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

            <View style={styles.dateNavRow}>
              <TouchableOpacity activeOpacity={0.7} style={styles.navBtn}>
                <Ionicons
                  name="chevron-back"
                  size={isDetailed ? 24 : 14}
                  color={Colors.light.dullWhite}
                />
              </TouchableOpacity>
              <Text style={styles.dateRange} numberOfLines={1}>
                {achievement.dateRangeLabel}
              </Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.navBtn}>
                <Ionicons
                  name="chevron-forward"
                  size={isDetailed ? 24 : 14}
                  color={Colors.light.dullWhite}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {isDetailed ? (
          renderDetailedSummary()
        ) : (
          <Text style={styles.summaryText}>
            {t(GOAL_SUMMARY_KEY[goalId], {
              percent: formatNumber(achievement.achievementPercent),
              delta: formatNumber(achievement.previousPeriodDeltaPercent),
            })}
          </Text>
        )}

        <View style={styles.goalHeader}>
          <Text style={styles.goalLabel}>
            {isDetailed
              ? t("progressLogging.recitationGoalTotalLabel")
              : t("progressLogging.goal")}
          </Text>
          {isDetailed ? (
            <View style={styles.goalValueRow}>
              <View style={styles.goalValueBlock}>
                <Text style={styles.goalPillValue}>
                  {formatGoalHoursLabel(displayGoalHours)}
                </Text>
                <View style={styles.goalPill}>
                  <Text style={styles.goalPillText}>
                    {t("progressLogging.unitHours")}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text style={styles.goalPillValue}>
                {formatNumber(achievement.goalHours)}{" "}
              </Text>
              <View style={styles.goalPill}>
                <Text style={styles.goalPillText}>
                  {t("progressLogging.unitHours")}
                </Text>
              </View>
            </View>
          )}
        </View>

        {isDetailed ? (
          <ListeningPastAchievementMetricsSection
            completedMinutes={displayCompletedMinutes}
            incompleteMinutes={displayIncompleteMinutes}
            formatDuration={formatDuration}
            completedLabel={t("progressLogging.completed")}
            incompleteLabel={t("progressLogging.incomplete")}
          />
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>
                {t("progressLogging.completed")}
              </Text>
              <Text style={styles.statValueCompleted}>
                {formatGoalHoursLabel(displayCompletedHours)}
              </Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>
                {t("progressLogging.incomplete")}
              </Text>
              <Text style={styles.statValueIncomplete}>
                {formatGoalHoursLabel(displayIncompleteHours)}
              </Text>
            </View>
          </View>
        )}

        <View
          onStartShouldSetResponder={() => isDetailed}
          onMoveShouldSetResponder={() => false}
        >
          <QuranHoursPastAchievementChartBlock
            chartData={achievement.chartData}
            selectedBarIndex={selectedBarIndex}
            onBarPress={
              isDetailed ? handleBarPressDetailed : handleBarPressCompact
            }
            chartKey={`${goalId}-${period}${isDetailed ? "-detailed" : ""}`}
            yMax={achievement.yMax}
            yTicks={achievement.yTicks}
            showHint={showChartHint}
            onDismissHint={() => setHintDismissed(true)}
            hintText={t("progressLogging.chartTapHint")}
            hintActionText={t("progressLogging.okGotIt")}
            pageCount={achievement.pageCount}
            activePageIndex={selectedBarIndex ?? achievement.activePageIndex}
            formatBarValue={isDetailed ? formatChartBarValue : undefined}
            showPagination={isDetailed}
            barColors={[Colors.light.green, INCOMPLETE_BAR_COLOR]}
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

      {studyMaterial.length > 0 && !isDetailed ? (
        <>
          <TopSpace top={16} />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.insightsTitle}>
              {t("progressLogging.studyMaterial")}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text style={styles.insightsTitle}>See All</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color={Colors.light.white}
              />
            </View>
          </View>
          <TopSpace top={16} />
          <FlatList
            horizontal
            data={studyMaterial}
            keyExtractor={studyMaterialKeyExtractor}
            renderItem={renderStudyMaterialItem}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={studyItemSeparator}
            contentContainerStyle={styles.studyListContent}
            decelerationRate="fast"
            snapToInterval={studyCardWidth + STUDY_CARD_GAP}
            snapToAlignment="start"
          />
        </>
      ) : null}
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
    gap: 6,
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
  },
  achievementPercentSymbolDetailed: {
    fontSize: 16,
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
    color: INCOMPLETE_BAR_COLOR,
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
  },
  studyListContent: {
    paddingRight: 4,
  },
  studyCard: {
    padding: 8,
    paddingBottom: 12,
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 8,
    gap: 8,
  },
  studyThumbnailWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  studyThumbnail: {
    width: "100%",
    height: "100%",
  },
  studyTypeBadge: {
    position: "absolute",
    right: 0,
    top: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: Colors.light.greybuttonBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  studyDescription: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    lineHeight: 16,
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
