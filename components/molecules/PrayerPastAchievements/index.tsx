import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
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
  applyPrayerAnalyticsView,
  formatPrayerCountLabel,
  formatPrayerTimeSpentLabel,
  getPrayerPastAchievement,
  type PrayerAnalyticsView,
} from "@/src/screens/private/goalprogressloggingscreen/prayerPastAchievementData";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import { INCOMPLETE_BAR_COLOR } from "../QuranHoursPastAchievements/pastAchievementStyles";
import { QuranHoursPastAchievementChartBlock } from "../QuranHoursPastAchievements/QuranHoursPastAchievementChartBlock";
import { InsightCard } from "../InsightCard";
import { PRAYER_INSIGHT_CARDS } from "./insightCardsData";
import {
  getGoalById,
  type GoalId,
} from "@/src/screens/private/home/components/goalsData";

type Props = {
  goalId: GoalId;
  isDetailed?: boolean;
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

const ANALYTICS_VIEWS: PrayerAnalyticsView[] = [
  "completedVsIncomplete",
  "inMosqueVsOutOfMosque",
  "completedByCategory",
  "completedVsTimeSpent"
];

const ANALYTICS_VIEW_LABEL_KEYS: Record<PrayerAnalyticsView, string> = {
  completedVsIncomplete: "progressLogging.analyticsCompletedVsIncomplete",
  completedVsTimeSpent: "progressLogging.analyticsCompletedVsTimeSpent",
  inMosqueVsOutOfMosque: "progressLogging.analyticsInMosqueVsOutOfMosque",
  completedByCategory: "Completed by Category",
};

const PERIOD_PHRASE: Record<PastAchievementPeriod, string> = {
  monthly: "Over the past month",
  threeMonths: "Over the past three months",
  sixMonths: "Over the past six months",
};

const MISSED_PRAYER_TABS = ["All", "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const SUNNAH_RAWATIB_TABS = [
  "All",
  "Before Fajr",
  "Before Dhuhr",
  "After Dhuhr",
  "Before Asr",
  "After Maghrib",
  "After Isha",
];
const QIYAM_TABS = ["All", "After Isha", "Tahajjud"];

export function PrayerPastAchievements({ goalId, isDetailed = false }: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [selectedPrayerTab, setSelectedPrayerTab] = useState<string>("All");
  const [period, setPeriod] = useState<PastAchievementPeriod>("monthly");
  const [analyticsView, setAnalyticsView] = useState<PrayerAnalyticsView>(
    "completedVsIncomplete"
  );
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);
  const goalData = getGoalById(goalId);
  const cleanGoalLabel = goalData?.title || "";

  useEffect(() => {
    if (goalId === "prayer-qiyam" && analyticsView === "completedByCategory" && selectedPrayerTab === "All") {
      setSelectedPrayerTab("After Isha");
    }
  }, [goalId, analyticsView, selectedPrayerTab]);

  const baseAchievementRaw = useMemo(
    () => getPrayerPastAchievement(goalId, period),
    [goalId, period]
  );

  const baseAchievement = useMemo(() => {
    let data = { ...baseAchievementRaw };

    const isMissed = goalId === "prayer-missed";
    const isSunnah = goalId === "prayer-sunnah";
    const isQiyam = goalId === "prayer-qiyam";

    if ((isMissed || isSunnah || isQiyam) && selectedPrayerTab !== "All") {
      const multipliers: Record<string, number> = {
        Fajr: 0.25,
        Dhuhr: 0.35,
        Asr: 0.15,
        Maghrib: 0.2,
        Isha: 0.1,
        "Before Fajr": 0.2,
        "Before Dhuhr": 0.2,
        "After Dhuhr": 0.15,
        "Before Asr": 0.15,
        "After Maghrib": 0.1,
        "After Isha": 0.35, // bumped up slightly for Qiyam visual variance
        Tahajjud: 0.65, // major portion of Qiyam
      };
      const multiplier = multipliers[selectedPrayerTab] || 0.4;

      data = {
        ...data,
        achievementPercent: Math.min(100, Math.round(data.achievementPercent * multiplier * 1.5)),
        completedPrayers: Math.round(data.completedPrayers * multiplier),
        incompletePrayers: Math.round(data.incompletePrayers * multiplier),
        totalTimeSpentMinutes: Math.round(data.totalTimeSpentMinutes * multiplier),
        chartData: data.chartData.map((item: any, idx: number) => {
          // deterministic variation so the graph shape physically changes
          const variation = 0.5 + ((idx * 7 + selectedPrayerTab.length * 3) % 10) / 10;
          const barMultiplier = multiplier * variation;

          return {
            ...item,
            completedPrayers: Math.round(item.completedPrayers * barMultiplier),
            incompletePrayers: Math.round(item.incompletePrayers * barMultiplier),
            timeSpentMinutes: Math.round(item.timeSpentMinutes * barMultiplier),
          };
        }),
      };
    }
    return data;
  }, [baseAchievementRaw, goalId, selectedPrayerTab]);

  const achievement = useMemo(
    () => applyPrayerAnalyticsView(baseAchievement, analyticsView),
    [baseAchievement, analyticsView]
  );

  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [period, goalId, analyticsView]);

  const handleBarPress = useCallback((index: number | null) => {
    setHintDismissed(true);
    setSelectedBarIndex((prev) => (prev === index ? null : index));
  }, []);

  const selectedBaseWeek =
    selectedBarIndex !== null
      ? (baseAchievement.chartData[selectedBarIndex] as any)
      : null;

  const displayBaseCompleted =
    selectedBaseWeek?.completedPrayers ?? baseAchievement.completedPrayers;
  const displayBaseIncomplete =
    selectedBaseWeek?.incompletePrayers ?? baseAchievement.incompletePrayers;

  const displayTimeSpent =
    selectedBaseWeek?.timeSpentMinutes ?? baseAchievement.totalTimeSpentMinutes;

  const renderInsights = () => {
    const cards = PRAYER_INSIGHT_CARDS[goalId]?.[period as "monthly" | "threeMonths" | "sixMonths"];
    if (!cards || !isDetailed) return null;

    return (
      <View style={styles.insightsSection}>
        <View style={styles.insightsHeader}>
          <Text style={styles.insightsTitleLabel}>KEY INSIGHTS</Text>
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
          {cards.map((c, i) => (
            <InsightCard key={i} {...c} style={styles.insightCardFixed} />
          ))}
        </ScrollView>
      </View>
    );
  };

  const showChartHint = !hintDismissed && selectedBarIndex === null;
  const deltaIsPositive = baseAchievement.previousPeriodDeltaPercent >= 0;

  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons
            name="trending-up"
            size={19}
            color={Colors.light.subtext}
          />
          <Text style={styles.sectionTitle}>
            {t("progressLogging.pastGoalAchievements")}
          </Text>
          {!isDetailed && (
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/(private)/pastachievementdetailedstatistics", params: { goalId } })}
              style={{ marginLeft: "auto", padding: 4 }}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.light.white}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.topRow}>
          <View style={styles.achievementBlock}>
            <Text style={styles.achievementCaption}>
              {t("progressLogging.achievementsLabel").toUpperCase()}
            </Text>
            <Text style={styles.achievementPercent}>
              {formatNumber(achievement.achievementPercent)}
              <Text style={styles.achievementPercentSymbol}>%</Text>
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
                color={deltaIsPositive ? Colors.light.green : Colors.light.subtext}
              />
              <Text
                style={[
                  styles.deltaText,
                  !deltaIsPositive && styles.deltaTextNegative,
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
                  size={24}
                  color={Colors.light.dullWhite}
                />
              </TouchableOpacity>
              <Text style={styles.dateRange} numberOfLines={1}>
                {achievement.dateRangeLabel}
              </Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.navBtn}>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={Colors.light.dullWhite}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {isDetailed && (
          <>
            <Text style={styles.summaryText}>
              <Text>{PERIOD_PHRASE[period]}, you achieved </Text>
              <Text style={styles.summaryBold}>{formatNumber(baseAchievement.achievementPercent)}%</Text>
              <Text> of your {cleanGoalLabel} prayer goals — </Text>
              <Text style={styles.summaryBold}>{formatNumber(Math.abs(baseAchievement.previousPeriodDeltaPercent))}%</Text>
              <Text>
                {" "}
                {deltaIsPositive ? "more" : "less"} than the previous{" "}
                {period === "monthly" && "month"}
                {period === "threeMonths" && (
                  <><Text style={styles.summaryBold}>3M</Text> period</>
                )}
                {period === "sixMonths" && (
                  <><Text style={styles.summaryBold}>6M</Text> period</>
                )}
                .
              </Text>
            </Text>

            {(goalId === "prayer-missed" || goalId === "prayer-sunnah") && (
              <View style={styles.missedPrayerTabsWrapper}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.missedPrayerTabsContainer}
                >
                  {(goalId === "prayer-missed" ? MISSED_PRAYER_TABS : SUNNAH_RAWATIB_TABS).map((prayer) => {
                    const isActive = selectedPrayerTab === prayer;
                    return (
                      <TouchableOpacity
                        key={prayer}
                        onPress={() => setSelectedPrayerTab(prayer)}
                        style={[
                          styles.missedPrayerTab,
                          isActive ? styles.missedPrayerTabActive : styles.missedPrayerTabInactive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.missedPrayerTabText,
                            isActive ? styles.missedPrayerTabTextActive : styles.missedPrayerTabTextInactive,
                          ]}
                        >
                          {prayer}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </>
        )}

        <View style={styles.goalHeader}>
          <Text style={styles.goalLabel}>{t("progressLogging.goal")}</Text>
          <View style={styles.goalValueRow}>
            <Text style={styles.goalPillValue}>
              {formatNumber(baseAchievement.goalPrayers)}{" "}
            </Text>
            <View style={styles.goalPill}>
              <Text style={styles.goalPillText}>
                prayers
              </Text>
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.analyticsToggle}>
          {ANALYTICS_VIEWS.filter(v => {
            if (goalId === "prayer-fiveDailyPrayers") return v !== "completedByCategory";
            if (goalId === "prayer-qiyam") return v !== "inMosqueVsOutOfMosque";
            return v === "completedVsIncomplete" || v === "completedVsTimeSpent";
          }).map((view) => {
            const isActive = analyticsView === view;

            let label = view === "completedByCategory" ? "Completed by Category" : t(ANALYTICS_VIEW_LABEL_KEYS[view]);
            if (goalId === "prayer-fiveDailyPrayers") {
              if (view === "completedVsIncomplete") label = "On-Time vs. Qadha";
              else if (view === "inMosqueVsOutOfMosque") label = "On-Time: In-Mosque vs. Out-of-Mosque";
              else if (view === "completedVsTimeSpent") label = "On-Time & Qadha vs. Time Spent";
            }

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
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {goalId === "prayer-qiyam" && analyticsView !== "completedVsIncomplete" && (
          <View style={[styles.missedPrayerTabsWrapper, { marginTop: 12 }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.missedPrayerTabsContainer}
            >
              {(analyticsView === "completedByCategory" ? QIYAM_TABS.filter(t => t !== "All") : QIYAM_TABS).map((prayer) => {
                const isActive = selectedPrayerTab === prayer;
                return (
                  <TouchableOpacity
                    key={prayer}
                    onPress={() => setSelectedPrayerTab(prayer)}
                    style={[
                      styles.missedPrayerTab,
                      isActive ? styles.missedPrayerTabActive : styles.missedPrayerTabInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.missedPrayerTabText,
                        isActive ? styles.missedPrayerTabTextActive : styles.missedPrayerTabTextInactive,
                      ]}
                    >
                      {prayer}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>
              {goalId === "prayer-fiveDailyPrayers"
                ? (analyticsView === "inMosqueVsOutOfMosque" ? "IN-MOSQUE" : "ON-TIME")
                : t("progressLogging.completed")}
            </Text>
            <Text
              style={[
                styles.statValueCompleted,
                analyticsView === "inMosqueVsOutOfMosque" && { color: "#00E5FF" }
              ]}
            >
              {formatPrayerCountLabel(displayBaseCompleted)}
            </Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>
              {analyticsView === "completedVsTimeSpent"
                ? t("progressLogging.timeSpentLabel")
                : (goalId === "prayer-fiveDailyPrayers"
                  ? (analyticsView === "inMosqueVsOutOfMosque" ? "OUT-OF-MOSQUE" : "QADHA")
                  : (analyticsView === "completedByCategory" ? "NIGHTS" : t("progressLogging.incomplete")))}
            </Text>
            <Text
              style={
                (analyticsView === "completedVsTimeSpent" || analyticsView === "completedByCategory")
                  ? styles.statValueTimeSpent
                  : styles.statValueIncomplete
              }
            >
              {analyticsView === "completedVsTimeSpent"
                ? formatPrayerTimeSpentLabel(displayTimeSpent)
                : formatPrayerCountLabel(displayBaseIncomplete)}
            </Text>
          </View>
        </View>

        <View
          onStartShouldSetResponder={() => isDetailed}
          onMoveShouldSetResponder={() => false}
        >
          <QuranHoursPastAchievementChartBlock
            chartData={achievement.chartData}
            selectedBarIndex={isDetailed ? selectedBarIndex : null}
            onBarPress={isDetailed ? handleBarPress : () => { }}
            chartKey={`${goalId}-${period}-${analyticsView}-${selectedPrayerTab}`}
            yMax={achievement.yMax}
            yTicks={achievement.yTicks}
            showHint={isDetailed ? showChartHint : false}
            onDismissHint={() => {
              setHintDismissed(true);
              if (achievement.chartData.length > 0) {
                setSelectedBarIndex(achievement.chartData.length - 1);
              }
            }}
            hintText={t("progressLogging.chartTapHint")}
            hintActionText={t("progressLogging.okGotIt")}
            pageCount={achievement.pageCount}
            activePageIndex={selectedBarIndex ?? achievement.activePageIndex}
            formatBarValue={formatPrayerCountLabel}
            isPrayerGoal={true}
            showPagination={isDetailed}
            showBarLine={goalId === "prayer-qiyam"}
          />
        </View>
      </View>

      {renderInsights()}
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
    color: Colors.light.white,
    fontSize: 13,
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
    fontSize: 11,
    fontFamily: fonts.primary.heavy,
    fontWeight: "800",
    //textTransform: "uppercase",
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
    backgroundColor: Colors.light.calendarBg,
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
    paddingHorizontal: 18,
    paddingVertical: 8,
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
    fontSize: 13,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    textAlign: "center",
    flexShrink: 1,
  },
  summaryText: {
    color: Colors.light.grey,
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    lineHeight: 20,
    letterSpacing: 0,
  },
  summaryBold: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 20,
    letterSpacing: 0,
  },
  missedPrayerTabsWrapper: {
    marginTop: 6,
    marginBottom: 6,
    marginHorizontal: -16, // to allow scroll bleeding if container has padding
  },
  missedPrayerTabsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  missedPrayerTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  missedPrayerTabActive: {
    backgroundColor: Colors.light.green,
  },
  missedPrayerTabInactive: {
    backgroundColor: Colors.light.blackBackground,
  },
  missedPrayerTabText: {
    fontSize: 12,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  missedPrayerTabTextActive: {
    color: Colors.light.background,
    fontWeight: "600",
  },
  missedPrayerTabTextInactive: {
    color: Colors.light.grey,
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
    paddingHorizontal: 6,
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
    gap: 8,
  },
  analyticsButton: {
    // flex: 1,
    borderRadius: 6,
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
    fontSize: 14,
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
  insightsSection: {
    marginTop: 8,
  },
  insightsDottedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderStyle: "dashed",
    width: "100%",
    marginBottom: 16,
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
  },
  insightsSubtitleLabel: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  insightsScrollContent: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 20, // Add some padding to the end of the scroll
  },
  insightCardFixed: {
    width: 140,
    flex: 0,
    minWidth: "auto",
  },
});
