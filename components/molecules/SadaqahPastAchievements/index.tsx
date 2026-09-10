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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { AchivementArrowIcon } from "@/assets/icons/AchivementArrowIcon";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import {
  applySadaqahAnalyticsView,
  formatSadaqahAmountLabel,
  getSadaqahPastAchievement,
  type SadaqahAnalyticsView,
} from "@/src/screens/private/goalprogressloggingscreen/sadaqahPastAchievementData";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import { INCOMPLETE_BAR_COLOR } from "../QuranHoursPastAchievements/pastAchievementStyles";
import { QuranHoursPastAchievementChartBlock } from "../QuranHoursPastAchievements/QuranHoursPastAchievementChartBlock";
import { getGoalById, type GoalId } from "@/src/screens/private/home/components/goalsData";
import { PastAchievementStudyMaterial } from "@/components/molecules/PastAchievementStudyMaterial";
import { formatTotalTime } from "@/src/screens/private/home/timeSpentData";
import {
  PAST_ACHIEVEMENT_NO_DATA,
  isPastAchievementBarEmpty,
} from "@/src/utils/pastAchievementNoData";
import { InsightCard } from "../InsightCard";
import { SADAQAH_INSIGHT_CARDS } from "./insightCardsData";

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

const PERIOD_PHRASE: Record<PastAchievementPeriod, string> = {
  monthly: "Last month",
  threeMonths: "Over the past 3 months",
  sixMonths: "Over the past 6 months",
};

// Category tabs per goal
const VOLUNTEERING_TABS = [
  "All",
  "Distributing Food",
  "Shaping Futures",
  "Offering Compassion",
  "Building Shelters",
];
const SADAQAH_JARIYAH_TABS = [
  "All",
  "Honoring Parents",
  "Sponsoring Orphans",
  "Building Wells",
  "Sustaining Mosques",
  "Teaching Quran",
  "Sheltering Lives",
  "Providing Healthcare",
  "Spreading Knowledge",
  "Providing Clothing",
  "Planting Trees",
];
const LILLAH_TABS = [
  "All",
  "Food Relief",
  "Qurbani for the Poor",
  "Household Essentials",
  "Debt Assistance",
  "Qard Hassan",
];
const ZAKAT_TABS = [
  "All",
  "Zakah al-Mal",
  "Zakah al-Fitr",
];
const KAFFARAH_TABS = [
  "All",
  "Breaking Fast",
  "Breaking Oath",
  "Zihar",
];
const FIDYA_TABS = [
  "All",
  "Missed Fasts",
  "Elderly Exemption",
];

function getTabsForGoal(goalId: GoalId): string[] {
  if (goalId === "sadaqah-volunteering") return VOLUNTEERING_TABS;
  if (goalId === "sadaqah-jariyah") return SADAQAH_JARIYAH_TABS;
  if (goalId === "sadaqah-Lillah") return LILLAH_TABS;
  if (goalId === "sadaqah-zakat") return ZAKAT_TABS;
  if (goalId === "sadaqah-kafarah") return KAFFARAH_TABS;
  if (goalId === "sadaqah-fidya") return FIDYA_TABS;
  return [];
}

export function SadaqahPastAchievements({ goalId, isDetailed = false }: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const router = useRouter();
const [selectedTab, setSelectedTab] = useState<string>("All");
  const [period, setPeriod] = useState<PastAchievementPeriod>("monthly");

  const isVolunteering = goalId === "sadaqah-volunteering";
  const isFidya = goalId === "sadaqah-fidya";
  const isKaffarah = goalId === "sadaqah-kafarah";
  const isZakat = goalId === "sadaqah-zakat";
  // For Fidya and Kaffarah: values are plain counts (meals / items), not dollars
  const isCountGoal = isFidya || isKaffarah;

  const [analyticsView, setAnalyticsView] = useState<SadaqahAnalyticsView>(
    "completedVsIncomplete"
  );
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);
  // Kaffarah sub-type filter: All / Meals / Clothing Items
  const [kaffarahSubType, setKaffarahSubType] = useState<string>("All");
  const goalData = getGoalById(goalId);
  const cleanGoalLabel = goalData?.title || "";

  const tabs = useMemo(() => getTabsForGoal(goalId), [goalId]);

  useEffect(() => {
    setSelectedTab("All");
  }, [goalId]);

  const studyMaterial = useMemo(() => getGoalById(goalId)?.studyMaterial ?? [], [goalId]);
const baseAchievementRaw = useMemo(
    () => getSadaqahPastAchievement(goalId, period, isVolunteering, isKaffarah ? kaffarahSubType : undefined),
    [goalId, period, isVolunteering, isKaffarah, kaffarahSubType]
  );

  const baseAchievement = useMemo(() => {
    let data = { ...baseAchievementRaw };

    if (selectedTab !== "All") {
      const multiplier = 0.35 + (selectedTab.length % 5) * 0.1;
      data = {
        ...data,
        achievementPercent: Math.min(100, Math.round(data.achievementPercent * multiplier * 1.5)),
        completedAmount: Math.round(data.completedAmount * multiplier),
        incompleteAmount: Math.round(data.incompleteAmount * multiplier),
        totalTimeSpentMinutes: Math.round(data.totalTimeSpentMinutes * multiplier),
        chartData: data.chartData.map((item: any, idx: number) => {
          const variation = 0.5 + ((idx * 7 + selectedTab.length * 3) % 10) / 10;
          const barMultiplier = multiplier * variation;
          return {
            ...item,
            completedAmount: Math.round(item.completedAmount * barMultiplier),
            incompleteAmount: Math.round(item.incompleteAmount * barMultiplier),
            completedHours: Math.round(item.completedHours * barMultiplier),
            incompleteHours: Math.round(item.incompleteHours * barMultiplier),
            timeSpentMinutes: Math.round(item.timeSpentMinutes * barMultiplier),
          };
        }),
      };
    }
    return data;
  }, [baseAchievementRaw, selectedTab]);

  const achievement = useMemo(
    () => applySadaqahAnalyticsView(baseAchievement, analyticsView, isVolunteering),
    [baseAchievement, analyticsView, isVolunteering]
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
    selectedBaseWeek?.completedAmount ?? baseAchievement.completedAmount;
  const displayBaseIncomplete =
    selectedBaseWeek?.incompleteAmount ?? baseAchievement.incompleteAmount;
  const displayTimeSpentMinutes =
    selectedBaseWeek?.timeSpentMinutes ?? baseAchievement.totalTimeSpentMinutes;

  const showNoDataDash = isPastAchievementBarEmpty(
    displayBaseCompleted,
    displayBaseIncomplete,
  );

  const renderInsights = () => {
    const cards = SADAQAH_INSIGHT_CARDS[goalId]?.[period as "monthly" | "threeMonths" | "sixMonths"];
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
  const deltaIsPositive = baseAchievement.previousPeriodDeltaPercent > 0;
  const deltaIsZero = baseAchievement.previousPeriodDeltaPercent === 0;
  const deltaAbs = Math.abs(baseAchievement.previousPeriodDeltaPercent);

  // For "Completed vs. Time Spent" view
  const isTimeSpentView = analyticsView === "completedVsTimeSpent";
  // Approximate time % of the period (treat 720 hrs = 30 day month baseline)
  const timeSpentPercent =
    Math.round((baseAchievement.totalTimeSpentMinutes / (720 * 60)) * 100 * 10) / 10;

  // Top-left metric label switches in time-spent view
  const topMetricLabel = isTimeSpentView
    ? "TIME SPENT"
    : t("progressLogging.achievementsLabel").toUpperCase();
  const topMetricValue = isTimeSpentView
    ? timeSpentPercent
    : baseAchievement.achievementPercent;

  const periodLabel =
    period === "monthly" ? "month" : period === "threeMonths" ? "3M period" : "6M period";

  // Summary sentence
  const renderSummaryText = () => {
    if (!isDetailed) return null;

    if (analyticsView === "completedByCategory") {
      return (
        <Text style={styles.summaryText}>
          <Text>{PERIOD_PHRASE[period]}, </Text>
          <Text style={styles.summaryBold}>{formatNumber(baseAchievement.achievementPercent)}%</Text>
          <Text> of your {cleanGoalLabel} donations were toward </Text>
          <Text style={styles.summaryBold}>
            {selectedTab === "All" ? "all categories" : selectedTab.toLowerCase()}
          </Text>
          <Text> — </Text>
          <Text style={styles.summaryBold}>{deltaAbs}%</Text>
          <Text> {deltaIsPositive ? "more" : "less"} than the previous {periodLabel}.</Text>
        </Text>
      );
    }

    // Kaffarah-specific summary (mentions sub-type)
    const kaffarahSubLabel =
      kaffarahSubType === "Meals" ? "meal " :
        kaffarahSubType === "Clothing Items" ? "clothing " : "";

    if (isTimeSpentView) {
      const timeStr = formatTotalTime(baseAchievement.totalTimeSpentMinutes / 60);
      const deltaSuffix = deltaIsZero
        ? "— the same amount of time you spent last month."
        : `— ${deltaAbs}% ${deltaIsPositive ? "more" : "less"} time than the previous ${periodLabel}.`;

      let kaffarahGoalText = <Text style={styles.summaryBold}>{kaffarahSubLabel}Kaffarah goal</Text>;
      if (isKaffarah && kaffarahSubType === "Meals") {
        kaffarahGoalText = <Text style={styles.summaryBold}>meal kaffarah goal not on your goal of donating meals as kaffarah</Text>;
      }

      return (
        <Text style={styles.summaryText}>
          <Text>{PERIOD_PHRASE[period]}, you spent </Text>
          <Text style={styles.summaryBold}>{timeStr}</Text>
          <Text> ({formatNumber(timeSpentPercent)}% of the month) on your </Text>
          {isKaffarah
            ? kaffarahGoalText
            : <Text style={styles.summaryBold}>{cleanGoalLabel}</Text>
          }
          <Text> {isKaffarah ? "" : "goal "}{isKaffarah ? deltaSuffix : deltaSuffix}</Text>
        </Text>
      );
    }

    // completedVsIncomplete (default)
    const deltaCompletedSuffix = deltaIsZero
      ? "— the same as the previous period."
      : `— ${deltaAbs}% ${deltaIsPositive ? "more" : "less"} than the previous ${periodLabel}.`;
    return (
      <Text style={styles.summaryText}>
        <Text>{PERIOD_PHRASE[period]}, you achieved </Text>
        <Text style={styles.summaryBold}>{formatNumber(baseAchievement.achievementPercent)}%</Text>
        {isKaffarah
          ? <Text> of your {kaffarahSubLabel}Kaffarah goal {deltaCompletedSuffix}</Text>
          : <Text> of your {cleanGoalLabel} goal {deltaCompletedSuffix}</Text>
        }
      </Text>
    );
  };

  // Second stat column (right side of stats row)
  const renderSecondStat = () => {
    if (analyticsView === "completedByCategory") return null;
    if (isTimeSpentView) {
      return (
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>TIME SPENT</Text>
          <Text style={styles.statValueIncomplete}>
            {showNoDataDash
              ? PAST_ACHIEVEMENT_NO_DATA
              : formatTotalTime(displayTimeSpentMinutes / 60)}
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.statColumn}>
        <Text style={styles.statLabel}>INCOMPLETE</Text>
        <Text style={styles.statValueIncomplete}>
          {showNoDataDash
            ? PAST_ACHIEVEMENT_NO_DATA
            : isCountGoal
              ? `${Math.round(displayBaseIncomplete)}`
              : formatSadaqahAmountLabel(displayBaseIncomplete, isVolunteering)}
        </Text>
      </View>
    );
  };

  // Kaffarah GOAL row unit
  const kaffarahGoalUnit =
    kaffarahSubType === "Meals" ? "meals" :
      kaffarahSubType === "Clothing Items" ? "clothing items" :
        "meals / clothing items";

  return (
    <>
    <View style={styles.section}>
      <View style={styles.card}>
        {/* ── Header row ── */}
        <View style={styles.cardHeader}>
          <AchivementArrowIcon />
          <Text style={styles.sectionTitle}>
            {t("progressLogging.pastGoalAchievements")}
          </Text>
          {!isDetailed && (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(private)/pastachievementdetailedstatistics",
                  params: { goalId },
                })
              }
              style={{ marginLeft: "auto", padding: 4 }}
            >
              <Ionicons name="chevron-forward" size={20} color={Colors.light.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Top: metric + period toggles ── */}
        <View style={styles.topRow}>
          {/* Left: label + big % + delta badge */}
          <View style={styles.achievementBlock}>
            <Text style={styles.achievementCaption}>{topMetricLabel}</Text>
            <Text style={styles.achievementPercent}>
              {showNoDataDash
                ? PAST_ACHIEVEMENT_NO_DATA
                : formatNumber(topMetricValue)}
              <Text style={styles.achievementPercentSymbol}>%</Text>
            </Text>
            {deltaIsZero ? (
              // Neutral dot badge for 0%
              <View style={[styles.deltaBadge, styles.deltaBadgeNeutral]}>
                <Text style={styles.deltaText}>
                  ● 0% previous month
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.deltaBadge,
                  !deltaIsPositive && styles.deltaBadgeNegative,
                ]}
              >
                <Ionicons
                  name={deltaIsPositive ? "arrow-up" : "arrow-down"}
                  size={10}
                  color={deltaIsPositive ? Colors.light.green : Colors.light.subtext}
                />
                <Text
                  style={[
                    styles.deltaText,
                    !deltaIsPositive && styles.deltaTextNegative,
                  ]}
                >
                  {deltaAbs}% previous month
                </Text>
              </View>
            )}
          </View>

          {/* Right: period toggle + date nav */}
          <View style={{ alignItems: "flex-end", gap: 8 }}>
            <View style={styles.periodToggle}>
              {PERIODS.map((item) => {
                const isActive = period === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setPeriod(item)}
                    style={[
                      styles.periodButton,
                      isActive ? styles.periodButtonActive : styles.periodButtonInactive,
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
                <Ionicons name="chevron-back" size={20} color={Colors.light.white} />
              </TouchableOpacity>
              <Text style={styles.dateRange} numberOfLines={1}>
                {achievement.dateRangeLabel}
              </Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.navBtn}>
                <Ionicons name="chevron-forward" size={20} color={Colors.light.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Summary sentence ── */}
        {renderSummaryText()}

        {/* ── Kaffarah Sub-Type Tabs ── */}
        {isKaffarah && (
          <View style={{ marginBottom: 12, flexDirection: "row", gap: 10 }}>
            {["All", "Meals", "Clothing Items"].map((tab) => {
              const isActive = kaffarahSubType === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setKaffarahSubType(tab)}
                  style={[
                    styles.categoryTab,
                    isActive ? styles.categoryTabActive : styles.categoryTabInactive,
                    { flexGrow: 1, paddingVertical: 6, paddingHorizontal: 4 }
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={[
                      styles.categoryTabText,
                      isActive ? styles.categoryTabTextActive : styles.categoryTabTextInactive,
                      { textAlign: "center", fontSize: 12 }
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── GOAL row – full-width dark box ── */}
        <View style={styles.goalHeader}>
          <Text style={styles.goalLabel}>{t("progressLogging.goal")}</Text>
          <View style={styles.goalValueRow}>
            <Text style={styles.goalValue}>
              {showNoDataDash
                ? PAST_ACHIEVEMENT_NO_DATA
                : isVolunteering
                  ? `${baseAchievement.goalAmount} hours`
                  : isCountGoal
                    ? `${baseAchievement.goalAmount}`
                    : formatSadaqahAmountLabel(baseAchievement.goalAmount, false)}
            </Text>
            {(isFidya || isKaffarah) && (
              <View style={styles.goalUnitPill}>
                <Text style={styles.goalUnitPillText}>
                  {isFidya ? "meals" : kaffarahGoalUnit}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Analytics view toggle ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.analyticsToggle}
        >
          <Pressable
            onPress={() => setAnalyticsView("completedVsIncomplete")}
            style={[
              styles.analyticsButton,
              analyticsView === "completedVsIncomplete"
                ? styles.analyticsButtonActive
                : styles.analyticsButtonInactive,
            ]}
          >
            <Text
              style={[
                styles.analyticsButtonText,
                analyticsView === "completedVsIncomplete" && styles.analyticsButtonTextActive,
              ]}
            >
              Completed vs. Incomplete
            </Text>
          </Pressable>

          {/* "Completed by Category" — hidden for Fidya, Kaffarah, and Zakat */}
          {!isFidya && !isKaffarah && !isZakat && (
            <Pressable
              onPress={() => {
                setAnalyticsView("completedByCategory");
                setSelectedTab("All");
              }}
              style={[
                styles.analyticsButton,
                analyticsView === "completedByCategory"
                  ? styles.analyticsButtonActive
                  : styles.analyticsButtonInactive,
              ]}
            >
              <Text
                style={[
                  styles.analyticsButtonText,
                  analyticsView === "completedByCategory" && styles.analyticsButtonTextActive,
                ]}
              >
                Completed by Category
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => setAnalyticsView("completedVsTimeSpent")}
            style={[
              styles.analyticsButton,
              analyticsView === "completedVsTimeSpent"
                ? styles.analyticsButtonActive
                : styles.analyticsButtonInactive,
            ]}
          >
            <Text
              style={[
                styles.analyticsButtonText,
                analyticsView === "completedVsTimeSpent" && styles.analyticsButtonTextActive,
              ]}
            >
              Completed vs. Time Spent
            </Text>
          </Pressable>
        </ScrollView>

        {/* ── Category tabs (only when Completed by Category) ── */}
        {isDetailed && analyticsView === "completedByCategory" && tabs.length > 0 && (
          <View style={styles.categoryTabsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryTabsContainer}
            >
              {tabs.map((tab) => {
                const isActive = selectedTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setSelectedTab(tab)}
                    style={[
                      styles.categoryTab,
                      isActive ? styles.categoryTabActive : styles.categoryTabInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryTabText,
                        isActive ? styles.categoryTabTextActive : styles.categoryTabTextInactive,
                      ]}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>COMPLETED</Text>
            <Text style={styles.statValueCompleted}>
              {showNoDataDash
                ? PAST_ACHIEVEMENT_NO_DATA
                : isCountGoal
                  ? `${Math.round(displayBaseCompleted)}`
                  : formatSadaqahAmountLabel(displayBaseCompleted, isVolunteering)}
            </Text>
          </View>
          {renderSecondStat()}
        </View>

        {/* ── Chart ── */}
        <View
          onStartShouldSetResponder={() => isDetailed}
          onMoveShouldSetResponder={() => false}
        >
          <QuranHoursPastAchievementChartBlock
            chartData={achievement.chartData}
            selectedBarIndex={isDetailed ? selectedBarIndex : null}
            onBarPress={isDetailed ? handleBarPress : () => { }}
            chartKey={`${goalId}-${period}-${analyticsView}-${selectedTab}`}
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
            formatBarValue={(val) =>
              isTimeSpentView
                ? formatTotalTime(val / 60)
                : formatSadaqahAmountLabel(val, isVolunteering)
            }
            isPrayerGoal={true}
            showPagination={isDetailed}
            showBarLine={false}
          />
        </View>
      </View>
      {renderInsights()}
    </View>

    <PastAchievementStudyMaterial items={studyMaterial} isDetailed={isDetailed} />
    </>
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
    alignItems: "flex-start",
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
  },
  achievementPercent: {
    color: Colors.light.white,
    fontSize: 28,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: 0,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deltaBadgeNegative: {
    backgroundColor: Colors.light.calendarBg,
  },
  deltaBadgeNeutral: {
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
  periodToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 3,
    backgroundColor: Colors.light.blackBackground,
    borderRadius: 6,
  },
  periodButton: {
    borderRadius: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
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
  },
  summaryText: {
    color: Colors.light.grey,
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    lineHeight: 20,
  },
  summaryBold: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
    lineHeight: 20,
  },
  // Full-width dark GOAL row
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.blackBackground,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  goalLabel: {
    color: Colors.light.subtext,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  goalValue: {
    color: Colors.light.white,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    fontSize: 22,
  },
  goalValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  goalUnitPill: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  goalUnitPillText: {
    color: Colors.light.subtext,
    fontSize: 12,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  // Analytics toggle
  analyticsToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  analyticsButton: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
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
    fontSize: 13,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  analyticsButtonTextActive: {
    color: Colors.light.white,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
  },
  // Category chips
  categoryTabsWrapper: {
    marginHorizontal: -14,
  },
  categoryTabsContainer: {
    paddingHorizontal: 14,
    gap: 8,
  },
  categoryTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTabActive: {
    backgroundColor: Colors.light.green,
  },
  categoryTabInactive: {
    backgroundColor: Colors.light.blackBackground,
  },
  categoryTabText: {
    fontSize: 12,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  categoryTabTextActive: {
    color: Colors.light.background,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
  },
  categoryTabTextInactive: {
    color: Colors.light.grey,
  },
  // Stats row
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
  statValueIncomplete: {
    color: Colors.light.white,
    fontSize: 22,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "700",
  },
  insightsSection: {
    marginTop: 8,
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
    paddingRight: 20,
  },
  insightCardFixed: {
    width: 140,
    flex: 0,
    minWidth: "auto",
  },
  learnMoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  learnMoreSeeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
