import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
  FlatList,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import {
  applyMissedRamadanAnalyticsView,
  formatMissedRamadanChartHoursLabel,
  formatMissedRamadanFastCountLabel,
  formatMissedRamadanFastTimeLabel,
  getMissedRamadanFastsPastAchievement,
  getMissedRamadanFastsPastAchievementSlice,
  getMissedRamadanTimeSpentByPeriod,
  getTotalMissedRamadanTimeSpentMinutes,
  type MissedRamadanAnalyticsView,
} from "@/src/screens/private/goalprogressloggingscreen/missedRamadanFastsPastAchievementData";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import { QuranHoursPastAchievementChartBlock } from "../QuranHoursPastAchievements/QuranHoursPastAchievementChartBlock";
import { TopSpace } from "@/components/atoms/TopSpace";
import { FontAwesome } from "@expo/vector-icons";
import {
  getGoalById,
  GoalData,
} from "@/src/screens/private/home/components/goalsData";
import { Image } from "expo-image";

type Props = {
  refreshKey?: number;
};
type StudyMaterialItem = NonNullable<GoalData["studyMaterial"]>[number];
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

const ANALYTICS_VIEWS: MissedRamadanAnalyticsView[] = [
  "completedVsIncomplete",
  "completedVsTime",
];

const ANALYTICS_VIEW_LABEL_KEYS: Record<MissedRamadanAnalyticsView, string> = {
  completedVsIncomplete: "progressLogging.analyticsCompletedVsIncomplete",
  completedVsTime: "progressLogging.analyticsCompletedVsTime",
};

const RAMADAN_BAR_COLORS: [string, string] = [
  Colors.light.ringRamadan,
  Colors.light.goldenBright,
];
const STUDY_CARD_WIDTH_RATIO = 0.42;
const STUDY_CARD_GAP = 10;
export function MissedRamadanFastsPastAchievements({ refreshKey = 0 }: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const [period, setPeriod] = useState<PastAchievementPeriod>("monthly");
  const [analyticsView, setAnalyticsView] =
    useState<MissedRamadanAnalyticsView>("completedVsIncomplete");
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);
  const goalData = getGoalById("fasting-ramadan");
  const studyMaterial = goalData?.studyMaterial ?? [];
  console.log("goal data", goalData);
  console.log("study material", studyMaterial);
  const periodSlice = useMemo(
    () => getMissedRamadanFastsPastAchievementSlice(period),
    [period, refreshKey],
  );
  const { width: screenWidth } = useWindowDimensions();
  const studyCardWidth = screenWidth * STUDY_CARD_WIDTH_RATIO;
  const baseAchievement = useMemo(
    () => getMissedRamadanFastsPastAchievement(period),
    [period, refreshKey],
  );

  const timeSpentByPeriod = useMemo(
    () => getMissedRamadanTimeSpentByPeriod(periodSlice),
    [periodSlice],
  );

  const achievement = useMemo(
    () =>
      applyMissedRamadanAnalyticsView(
        baseAchievement,
        periodSlice,
        analyticsView,
      ),
    [analyticsView, baseAchievement, periodSlice],
  );

  const totalTimeSpentMinutes = useMemo(
    () => getTotalMissedRamadanTimeSpentMinutes(timeSpentByPeriod),
    [timeSpentByPeriod],
  );

  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [period, analyticsView, refreshKey]);

  const handleBarPress = useCallback((index: number | null) => {
    setHintDismissed(true);
    setSelectedBarIndex((current) => (current === index ? null : index));
  }, []);

  const selectedBasePeriod =
    selectedBarIndex !== null
      ? periodSlice.chartPeriods[selectedBarIndex]
      : null;

  const displayCompleted =
    selectedBasePeriod?.completed ?? periodSlice.completedFasts;
  const displayIncomplete =
    selectedBasePeriod?.incomplete ?? periodSlice.incompleteFasts;

  const selectedPeriodTimeSpentMinutes =
    selectedBarIndex !== null
      ? (timeSpentByPeriod[selectedBarIndex] ?? 0)
      : totalTimeSpentMinutes;

  const showCalendar =
    period === "monthly" && analyticsView === "completedVsIncomplete";
  const showChart = !showCalendar;
  const showChartHint =
    showChart && !hintDismissed && selectedBarIndex === null;
  const deltaIsPositive = baseAchievement.previousPeriodDeltaPercent >= 0;

  const chartFormatBarValue =
    analyticsView === "completedVsTime"
      ? formatMissedRamadanChartHoursLabel
      : formatMissedRamadanFastCountLabel;
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
                color={
                  deltaIsPositive ? Colors.light.green : Colors.light.white
                }
              />
              <Text
                style={[
                  styles.deltaText,
                  {
                    color: deltaIsPositive
                      ? Colors.light.green
                      : Colors.light.white,
                  },
                ]}
              >
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
          {t("progressLogging.achievementSummaryMissedRamadan", {
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
              {formatNumber(periodSlice.targetFasts)}{" "}
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
            <Text style={styles.statValueCompleted}>
              {formatMissedRamadanFastCountLabel(displayCompleted)}
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
              {analyticsView === "completedVsTime"
                ? formatMissedRamadanFastTimeLabel(
                    selectedPeriodTimeSpentMinutes,
                  )
                : formatMissedRamadanFastCountLabel(displayIncomplete)}
            </Text>
          </View>
        </View>

        {showCalendar ? (
          <>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={styles.legendDotFilled} />
                <Text style={styles.legendText}>
                  {t("progressLogging.missedRamadanLegendCompletedFast")}
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "baseline",
                    gap: 2,
                  }}
                >
                  <View style={styles.legendDotOutlined} />
                  <FontAwesome
                    name="warning"
                    size={5}
                    color={Colors.light.golden}
                  />
                </View>

                <Text style={styles.legendText}>
                  {t("progressLogging.missedRamadanLegendIncompletePlanned")}
                </Text>
              </View>
            </View>
            <TopSpace top={12} />
            <CalendarGrid
              mode="missed_ramadan_achievement"
              currentDate={periodSlice.calendarMonthDate}
              windowStartDate={periodSlice.periodStartDate}
              windowEndDate={periodSlice.periodEndDate}
              completedFastDates={periodSlice.completedDates}
              incompletePlannedFastDates={periodSlice.incompletePlannedDates}
              bgColor={Colors.light.greybuttonBackground}
            />
          </>
        ) : (
          <View
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => false}
          >
            <QuranHoursPastAchievementChartBlock
              chartData={achievement.chartData}
              selectedBarIndex={selectedBarIndex}
              onBarPress={handleBarPress}
              chartKey={`missed-ramadan-${period}-${analyticsView}-${refreshKey}`}
              yMax={achievement.yMax}
              yTicks={achievement.yTicks}
              showHint={showChartHint}
              onDismissHint={() => setHintDismissed(true)}
              hintText={t("progressLogging.chartTapHint")}
              hintActionText={t("progressLogging.okGotIt")}
              pageCount={achievement.pageCount}
              activePageIndex={selectedBarIndex ?? achievement.activePageIndex}
              formatBarValue={chartFormatBarValue}
              barColors={RAMADAN_BAR_COLORS}
              valueLabelColor={Colors.light.ringRamadan}
            />
          </View>
        )}
      </View>
      {studyMaterial.length > 0 ? (
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
    backgroundColor: Colors.light.calendarBg,
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
    color: Colors.light.goldenBright,
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
    gap: 16,
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
  legendDotFilled: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.ringRamadan,
  },
  legendDotOutlined: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.2,
    borderColor: Colors.light.ringRamadan,
    backgroundColor: "transparent",
  },
  legendText: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.3,
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
});
