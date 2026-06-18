import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  FlatList,
  useWindowDimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import {
  applyCompletionAnalyticsView,
  formatCompletionCountLabel,
  formatCompletionTimeSpentLabel,
  formatJuzRangeLabel,
  getCompletionJuzProgressPercent,
  getCompletionTimeSpentByPeriod,
  getQuranCompletionPastAchievement,
  getQuranCompletionPastAchievementSlice,
  getTotalCompletionTimeSpentMinutes,
  type CompletionAnalyticsView,
  type CompletionPastAchievementRecord,
} from "@/src/screens/private/goalprogressloggingscreen/quranRecitationCompletionPastAchievementData";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import type { CompletionGoalId } from "@/src/screens/private/goalprogressloggingscreen/types";
import { INCOMPLETE_BAR_COLOR } from "../QuranHoursPastAchievements/pastAchievementStyles";
import { QuranHoursPastAchievementChartBlock } from "../QuranHoursPastAchievements/QuranHoursPastAchievementChartBlock";
import {
  getGoalById,
  type GoalData,
} from "@/src/screens/private/home/components/goalsData";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Image } from "expo-image";

type Props = {
  goalId: CompletionGoalId;
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

const GOAL_SUMMARY_KEY =
  "progressLogging.achievementSummaryRecitationCompletion";

const ANALYTICS_VIEWS: CompletionAnalyticsView[] = [
  "completedVsIncomplete",
  "completedVsTimeSpent",
];

const ANALYTICS_VIEW_LABEL_KEYS: Record<CompletionAnalyticsView, string> = {
  completedVsIncomplete: "progressLogging.analyticsCompletedVsIncomplete",
  completedVsTimeSpent: "progressLogging.analyticsCompletedVsTimeSpent",
};

type StudyMaterialItem = NonNullable<GoalData["studyMaterial"]>[number];

const STUDY_CARD_WIDTH_RATIO = 0.42;
const STUDY_CARD_GAP = 10;

export function QuranCompletionPastAchievements({ goalId }: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const { width: screenWidth } = useWindowDimensions();
  const studyCardWidth = screenWidth * STUDY_CARD_WIDTH_RATIO;
  const [period, setPeriod] = useState<PastAchievementPeriod>("monthly");
  const [analyticsView, setAnalyticsView] = useState<CompletionAnalyticsView>(
    "completedVsIncomplete",
  );
  const goalData = getGoalById(goalId);
  const studyMaterial = goalData?.studyMaterial ?? [];
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);

  const periodSlice = useMemo(
    () => getQuranCompletionPastAchievementSlice(period),
    [period],
  );

  const baseAchievement = useMemo(
    () => getQuranCompletionPastAchievement(period),
    [period],
  );

  const timeSpentByPeriod = useMemo(
    () => getCompletionTimeSpentByPeriod(periodSlice),
    [periodSlice],
  );

  const achievement = useMemo(
    () =>
      applyCompletionAnalyticsView(baseAchievement, periodSlice, analyticsView),
    [analyticsView, baseAchievement, periodSlice],
  );

  const totalTimeSpentMinutes = useMemo(
    () => getTotalCompletionTimeSpentMinutes(timeSpentByPeriod),
    [timeSpentByPeriod],
  );

  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [period, goalId, analyticsView]);

  const handleBarPress = useCallback((index: number) => {
    setHintDismissed(true);
    setSelectedBarIndex((current) => (current === index ? null : index));
  }, []);

  const selectedBaseWeek =
    selectedBarIndex !== null
      ? baseAchievement.chartData[selectedBarIndex]
      : null;

  const displayBaseCompleted =
    selectedBaseWeek?.completedHours ?? baseAchievement.completedHours;
  const displayBaseIncomplete =
    selectedBaseWeek?.incompleteHours ?? baseAchievement.incompleteHours;

  const selectedPeriodTimeSpentMinutes =
    selectedBarIndex !== null
      ? (timeSpentByPeriod[selectedBarIndex] ?? 0)
      : totalTimeSpentMinutes;

  const showChartHint = !hintDismissed && selectedBarIndex === null;
  const deltaIsPositive = baseAchievement.previousPeriodDeltaPercent >= 0;

  const renderCompletionRow = (item: CompletionPastAchievementRecord) => {
    const progressPercent = getCompletionJuzProgressPercent(
      item.completedJuzCount,
      item.totalJuzCount,
    );
    const isCompleted = item.status === "completed";

    return (
      <View
        key={`completion-${item.completionNumber}`}
        style={styles.completionRow}
      >
        <View style={styles.completionRowHeader}>
          <Text style={styles.completionRowTitle}>
            {t("progressLogging.completionRowTitle", {
              number: formatNumber(item.completionNumber),
            })}
          </Text>
          <Text style={styles.completionRowJuz}>
            {formatJuzRangeLabel(item.startJuz, item.endJuz)}
          </Text>
          <View
            style={[
              styles.statusChip,
              isCompleted
                ? styles.statusChipCompleted
                : styles.statusChipIncomplete,
            ]}
          >
            <Text
              style={[
                styles.statusChipText,
                isCompleted
                  ? styles.statusChipTextCompleted
                  : styles.statusChipTextIncomplete,
              ]}
            >
              {isCompleted
                ? t("progressLogging.completed")
                : t("progressLogging.incomplete")}
            </Text>
          </View>
        </View>

        <View style={styles.goalProgressTrack}>
          <View
            style={[
              styles.goalProgressCompleted,
              { width: `${progressPercent}%` },
            ]}
          />
        </View>
        <Text style={styles.juzProgressLabel}>
          {t("progressLogging.juzProgressLabel", {
            completed: formatNumber(item.completedJuzCount),
            total: formatNumber(item.totalJuzCount),
          })}
        </Text>
      </View>
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
            <Text style={styles.studyTypeBadgeText}>
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

  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons
            name="trophy-outline"
            size={16}
            color={Colors.light.white}
          />
          <Text style={styles.sectionTitle}>
            {t("progressLogging.pastGoalAchievements")}
          </Text>
        </View>

        <View style={styles.topRow}>
          <View style={styles.achievementBlock}>
            <Text style={styles.achievementCaption}>
              {t("progressLogging.achievementsLabel")}
            </Text>
            <Text style={styles.achievementPercent}>
              {formatNumber(achievement.achievementPercent)}
              <Text style={styles.achievementPercentSymbol}>%</Text>
            </Text>
            <View style={styles.deltaBadge}>
              <Ionicons
                name={deltaIsPositive ? "arrow-up" : "arrow-down"}
                size={11}
                color={Colors.light.green}
              />
              <Text style={styles.deltaText}>
                {deltaIsPositive ? "+" : ""}
                {formatNumber(baseAchievement.previousPeriodDeltaPercent)}%{" "}
                {t("progressLogging.previousMonth")}
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
                  size={14}
                  color={Colors.light.dullWhite}
                />
              </TouchableOpacity>
              <Text style={styles.dateRange} numberOfLines={1}>
                {achievement.dateRangeLabel}
              </Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.navBtn}>
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={Colors.light.dullWhite}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.summaryText}>
          {t(GOAL_SUMMARY_KEY, {
            percent: formatNumber(baseAchievement.achievementPercent),
            delta: formatNumber(
              Math.abs(baseAchievement.previousPeriodDeltaPercent),
            ),
            direction: deltaIsPositive
              ? t("progressLogging.periodComparisonIncrease")
              : t("progressLogging.periodComparisonDecrease"),
          })}
        </Text>

        <View style={styles.goalHeader}>
          <Text style={styles.goalLabel}>{t("progressLogging.goal")}</Text>
          <View style={styles.goalValueRow}>
            <Text style={styles.goalPillValue}>
              {formatNumber(periodSlice.targetCompletions)}{" "}
            </Text>
            <View style={styles.goalPill}>
              <Text style={styles.goalPillText}>
                {t("progressLogging.unitCompletions")}
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
            <Text style={styles.statValueCompleted}>
              {formatCompletionCountLabel(displayBaseCompleted)}
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
                  ? styles.statValueTimeSpent
                  : styles.statValueIncomplete
              }
            >
              {analyticsView === "completedVsTimeSpent"
                ? formatCompletionTimeSpentLabel(selectedPeriodTimeSpentMinutes)
                : formatCompletionCountLabel(displayBaseIncomplete)}
            </Text>
          </View>
        </View>

        <View
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => false}
        >
          <QuranHoursPastAchievementChartBlock
            chartData={achievement.chartData}
            selectedBarIndex={selectedBarIndex}
            onBarPress={handleBarPress}
            chartKey={`${goalId}-${period}-${analyticsView}`}
            yMax={achievement.yMax}
            yTicks={achievement.yTicks}
            showHint={showChartHint}
            onDismissHint={() => setHintDismissed(true)}
            hintText={t("progressLogging.chartTapHint")}
            hintActionText={t("progressLogging.okGotIt")}
            pageCount={achievement.pageCount}
            activePageIndex={selectedBarIndex ?? achievement.activePageIndex}
            formatBarValue={formatCompletionCountLabel}
          />
        </View>

        {/* <View style={styles.completionRowsSection}>
          {periodSlice.completions.map(renderCompletionRow)}
        </View> */}
      </View>

      {studyMaterial.length > 0 ? (
        <>
          <TopSpace top={16} />
          <View style={styles.studyHeaderRow}>
            <Text style={styles.insightsTitle}>
              {t("progressLogging.studyMaterial")}
            </Text>
            <View style={styles.studySeeAllRow}>
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  achievementPercent: {
    color: Colors.light.white,
    fontSize: 40,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    lineHeight: 44,
  },
  achievementPercentSymbol: {
    fontSize: 22,
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
  deltaText: {
    color: Colors.light.green,
    fontSize: 11,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
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
  statValueTimeSpent: {
    color: Colors.light.white,
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
  },
  completionRowsSection: {
    gap: 14,
    marginTop: 4,
  },
  completionRow: {
    gap: 8,
  },
  completionRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  completionRowTitle: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    flexShrink: 0,
  },
  completionRowJuz: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontFamily: fonts.primary.regular,
    flex: 1,
  },
  statusChip: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  statusChipCompleted: {
    backgroundColor: Colors.light.lightgreen,
  },
  statusChipIncomplete: {
    backgroundColor: Colors.light.calendarBg,
  },
  statusChipText: {
    fontSize: 10,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  statusChipTextCompleted: {
    color: Colors.light.green,
  },
  statusChipTextIncomplete: {
    color: Colors.light.yellow,
  },
  goalProgressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.calendarBg,
    overflow: "hidden",
  },
  goalProgressCompleted: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: Colors.light.green,
  },
  juzProgressLabel: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
  insightsTitle: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  studyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  studySeeAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  studyTypeBadgeText: {
    color: Colors.light.white,
    fontSize: 10,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  studyDescription: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    lineHeight: 16,
  },
});
