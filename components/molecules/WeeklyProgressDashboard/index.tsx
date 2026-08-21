import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Colors } from "@/constants/theme";
import { PrayerStatus } from "@/components/molecules/PrayerProgressTrackerRing";
import { useTranslation } from "react-i18next";
import { AimIcon, LighteningIcon, PrayerMatIcon } from "@/assets/icons";
import { fonts } from "@/assets/fonts";
import { TopSpace } from "@/components/atoms/TopSpace";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DayProgress {
  /** Short day label: Sun, Mon … Sat */
  day: string;
  /** Five prayer statuses for the day */
  statuses: PrayerStatus[];
  /** True when all 5 prayers are in menstruation cycle */
  isMenstruating?: boolean;
  isToday?: boolean;
  isFuture?: boolean;
}

export interface WeeklyProgressDashboardProps {
  /** Data for each day of the currently-visible week (7 items) */
  weekDays?: DayProgress[];
  /** e.g. "Nov 29 — Dec 5" */
  weekRangeLabel?: string;
  /** e.g. "1/4" */
  weekFraction?: string;
  /** Total on-time prayers this week */
  onTimePrayersCount?: number;
  /** Streak count in days */
  streakDays?: number;
  /**
   * On-time prayer delta vs the previous week.
   * `null` / omitted on week 1 (no comparison slot). Present from week 2 onward.
   */
  vsLastWeek?: number | null;
  /** Motivational quote shown at the bottom */
  motivationalQuote?: string;
  /** Index (0-6) of the currently highlighted/selected day */
  selectedDayIndex?: number;
  /** Called when user taps a day */
  onDayPress?: (index: number) => void;
  /** Called when user navigates to prev week */
  onPrevWeek?: () => void;
  /** Called when user navigates to next week */
  onNextWeek?: () => void;
  /**
   * Render prop: receives day data + size so the parent can inject
   * <PrayerProgressTrackerRing /> without coupling this component to it.
   */
  renderRing: (day: DayProgress, size: number) => React.ReactNode;
  /** Show "---" placeholders until the prayer-goal frame API responds. */
  loading?: boolean;
}

// ─── Dummy data (used when no props are supplied) ─────────────────────────────

const LOADING_WEEK: DayProgress[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
].map((day) => ({
  day,
  statuses: ["none", "none", "none", "none", "none"] as PrayerStatus[],
}));

const DUMMY_WEEK: DayProgress[] = [
  {
    day: "Sun",
    statuses: ["onTime", "onTime", "congregation", "missed", "none"],
  },
  {
    day: "Mon",
    statuses: ["onTime", "congregation", "onTime", "onTime", "none"],
  },
  {
    day: "Tue",
    statuses: ["missed", "onTime", "onTime", "congregation", "missed"],
  },
  { day: "Wed", statuses: ["onTime", "onTime", "onTime", "onTime", "onTime"] },
  {
    day: "Thu",
    statuses: ["congregation", "onTime", "missed", "onTime", "none"],
  },
  {
    day: "Fri",
    statuses: ["onTime", "congregation", "congregation", "onTime", "onTime"],
  },
  { day: "Sat", statuses: ["none", "none", "none", "none", "none"] },
];

const DAY_TRANSLATION_KEYS: Record<string, string> = {
  Sun: "homeScreen.weeklyProgress_daySun",
  Mon: "homeScreen.weeklyProgress_dayMon",
  Tue: "homeScreen.weeklyProgress_dayTue",
  Wed: "homeScreen.weeklyProgress_dayWed",
  Thu: "homeScreen.weeklyProgress_dayThu",
  Fri: "homeScreen.weeklyProgress_dayFri",
  Sat: "homeScreen.weeklyProgress_daySat",
};

// ─── Component ────────────────────────────────────────────────────────────────

// Card outer padding (left+right): wrapperPadding(4*2) + cardPadding(8*2)
const TOTAL_HORIZONTAL_PADDING = 24;
// Per-column internal padding (2px each side) * 7 columns
const COLUMN_PADDING_TOTAL = 4 * 7;

export const WeeklyProgressDashboard: React.FC<
  WeeklyProgressDashboardProps
> = ({
  weekDays = DUMMY_WEEK,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  onTimePrayersCount = 30,
  streakDays = 5,
  vsLastWeek = null,
  motivationalQuote = "Prayer brings blessings to\nyour day—answer its call\nwith devotion.",
  selectedDayIndex,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  renderRing,
  loading = false,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const { t, i18n } = useTranslation();
  const displayWeekDays = loading ? LOADING_WEEK : weekDays;
  const showComparison = !loading && vsLastWeek != null;
  const vsLastWeekMagnitude = Math.abs(vsLastWeek ?? 0);
  const vsLastWeekImproved = (vsLastWeek ?? 0) > 0;
  // Dynamically compute ring size so all 7 columns fit inside the card
  const availableWidth = screenWidth - TOTAL_HORIZONTAL_PADDING;
  const ringSize = Math.floor((availableWidth / 7) * 0.75); // 0.75 scale for smaller rings

  // If no controlled selectedDayIndex is passed, manage it internally
  const todayIndex = new Date().getDay(); // 0 = Sun
  const [internalSelected, setInternalSelected] = useState(todayIndex);

  const activeDayIndex = selectedDayIndex ?? internalSelected;

  const handleDayPress = (idx: number) => () => {
    setInternalSelected(idx);
    onDayPress?.(idx);
  };

  return (
    <View style={styles.card}>
      {/* ── Header row ─────────────────────────────────────────────────────── */}
      <View style={styles.headerRow}>
        {/* Calendar icon + week fraction */}
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={18}
            color={Colors.light.seagreen}
          />
          <Text style={styles.weekFractionText}>
            {loading
              ? "---"
              : `${weekFraction} ${t("homeScreen.weeklyProgress_weeks")}`}
          </Text>
        </View>

        {/* Week range navigation */}
        <View style={styles.headerNav}>
          <TouchableOpacity
            onPress={onPrevWeek}
            disabled={!onPrevWeek || loading}
            activeOpacity={onPrevWeek && !loading ? 0.7 : 1}
            style={styles.navBtn}
          >
            <Ionicons
              name={i18n.language === "ar" ? "chevron-forward" : "chevron-back"}
              size={16}
              color={
                onPrevWeek && !loading
                  ? Colors.light.dullWhite
                  : Colors.light.dullWhite + "4D"
              }
            />
          </TouchableOpacity>
          <Text style={styles.weekRangeText}>
            {loading ? "---" : weekRangeLabel}
          </Text>
          <TouchableOpacity
            onPress={onNextWeek}
            disabled={!onNextWeek || loading}
            activeOpacity={onNextWeek && !loading ? 0.7 : 1}
            style={styles.navBtn}
          >
            <Ionicons
              name={i18n.language === "ar" ? "chevron-back" : "chevron-forward"}
              size={16}
              color={
                onNextWeek && !loading
                  ? Colors.light.dullWhite
                  : Colors.light.dullWhite + "4D"
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Days row ───────────────────────────────────────────────────────── */}
      <View style={styles.daysRow}>
        {displayWeekDays.map((day, idx) => {
          const isActive = day.isToday;
          return (
            <TouchableOpacity
              key={`${day.day}-${idx}`}
              style={[styles.dayColumn, isActive && styles.dayColumnActive]}
              onPress={handleDayPress(idx)}
              activeOpacity={0.75}
              disabled={loading}
            >
              {/* Ring placeholder — parent injects <PrayerProgressTrackerRing> */}
              <View
                style={[
                  styles.ringWrapper,
                  { width: ringSize, height: ringSize },
                ]}
              >
                {renderRing(day, ringSize)}
              </View>
              <Text
                style={[styles.dayLabel, isActive && styles.dayLabelActive]}
              >
                {loading
                  ? "---"
                  : t(
                      (DAY_TRANSLATION_KEYS[day.day] ??
                        "homeScreen.weeklyProgress_daySun") as any,
                    )}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Divider ────────────────────────────────────────────────────────── */}
      <TopSpace top={25} />
      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <PrayerMatIcon />
        <Text style={styles.statsText}>
          <Text style={styles.statsCount}>
            {loading ? "---" : onTimePrayersCount}
          </Text>
          {loading ? "" : ` ${t("homeScreen.weeklyProgress_onTimePrayers")}`}
        </Text>
      </View>
      {/* ── Footer row ─────────────────────────────────────────────────────── */}
      <TopSpace top={8} />
      <View style={styles.footerRow}>
        <View style={styles.streakBadge}>
          <LighteningIcon />
          <Text style={styles.streakText}>
            {loading
              ? "---"
              : t("homeScreen.weeklyProgress_dayStreak", { count: streakDays })}
          </Text>
        </View>

        {showComparison ? (
          <View style={styles.comparisonBadge}>
            {vsLastWeekMagnitude > 0 ? (
              <Ionicons
                name={vsLastWeekImproved ? "caret-up" : "caret-down"}
                size={13}
                color={
                  vsLastWeekImproved ? Colors.light.green : Colors.light.grey
                }
              />
            ) : null}
            <Text style={styles.comparisonText}>
              <Text style={styles.comparisonCount}>
                {vsLastWeekMagnitude}
              </Text>
              {` ${t("homeScreen.weeklyProgress_vsLastWeek")}`}
            </Text>
          </View>
        ) : (
          <View style={styles.comparisonPlaceholder} />
        )}
      </View>

      <View style={styles.quoteBlock}>
        <AimIcon />
        <View style={styles.quoteTextWrap}>
          <Text style={styles.quoteText}>
            {loading ? "---" : motivationalQuote}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 8,
    paddingVertical: 16,
    width: "100%",
    alignSelf: "stretch",
  },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  weekFractionText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "fonts.primary.semibold",
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  navBtn: {
    padding: 2,
  },
  weekRangeText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "500",
  },

  // Days
  daysRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  dayColumn: {
    flex: 1,
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 2,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 24,
  },
  dayColumnActive: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  ringWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  dayLabel: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
  },
  dayLabelActive: {
    color: Colors.light.white,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  statsText: {
    color: Colors.light.white,
    fontSize: 13,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  statsCount: {
    color: Colors.light.white,
    fontWeight: "700",
    fontSize: 20,
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  streakText: {
    color: Colors.light.green,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  comparisonBadge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 0,
  },
  comparisonPlaceholder: {
    flex: 1,
    minWidth: 0,
  },
  comparisonText: {
    flex: 1,
    color: Colors.light.white,
    fontSize: 13,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  comparisonCount: {
    color: Colors.light.white,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  quoteBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    alignSelf: "stretch",
    minWidth: 0,
    width: "100%",
    marginTop: 4,
  },
  quoteTextWrap: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  quoteText: {
    color: Colors.light.white,
    fontSize: 13,
    lineHeight: 16,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
});
