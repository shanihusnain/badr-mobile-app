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
import { PrayerMatIcon } from "@/assets/icons";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DayProgress {
  /** Short day label: Sun, Mon … Sat */
  day: string;
  /** Five prayer statuses for the day */
  statuses: PrayerStatus[];
  /** True when all 5 prayers are in menstruation cycle */
  isMenstruating?: boolean;
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
}

// ─── Dummy data (used when no props are supplied) ─────────────────────────────

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
  motivationalQuote = "Prayer brings blessings to\nyour day—answer its call\nwith devotion.",
  selectedDayIndex,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  renderRing,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const { t, i18n } = useTranslation();

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
            {weekFraction} {t("homeScreen.weeklyProgress_weeks")}
          </Text>
        </View>

        {/* Week range navigation */}
        <View style={styles.headerNav}>
          <TouchableOpacity
            onPress={onPrevWeek}
            activeOpacity={0.7}
            style={styles.navBtn}
          >
            <Ionicons
              name={i18n.language === "ar" ? "chevron-forward" : "chevron-back"}
              size={16}
              color={Colors.light.dullWhite}
            />
          </TouchableOpacity>
          <Text style={styles.weekRangeText}>{weekRangeLabel}</Text>
          <TouchableOpacity
            onPress={onNextWeek}
            activeOpacity={0.7}
            style={styles.navBtn}
          >
            <Ionicons
              name={i18n.language === "ar" ? "chevron-back" : "chevron-forward"}
              size={16}
              color={Colors.light.dullWhite}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Days row ───────────────────────────────────────────────────────── */}
      <View style={styles.daysRow}>
        {weekDays.map((day, idx) => {
          const isActive = idx === activeDayIndex;
          return (
            <TouchableOpacity
              key={day.day}
              style={[styles.dayColumn, isActive && styles.dayColumnActive]}
              onPress={handleDayPress(idx)}
              activeOpacity={0.75}
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
                {t(
                  (DAY_TRANSLATION_KEYS[day.day] ??
                    "homeScreen.weeklyProgress_daySun") as any,
                )}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Divider ────────────────────────────────────────────────────────── */}

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <PrayerMatIcon />
        <Text style={styles.statsText}>
          <Text style={styles.statsCount}>{onTimePrayersCount}</Text>{" "}
          {t("homeScreen.weeklyProgress_onTimePrayers")}
        </Text>
      </View>

      {/* ── Footer row ─────────────────────────────────────────────────────── */}
      <View style={styles.footerRow}>
        {/* Streak */}
        <View style={styles.streakBadge}>
          <Ionicons name="flash" size={13} color={Colors.light.green} />
          <Text style={styles.streakText}>
            {t("homeScreen.weeklyProgress_dayStreak", { count: streakDays })}
          </Text>
        </View>

        {/* Quote */}
        <View style={styles.quoteBlock}>
          <MaterialCommunityIcons
            name="recycle"
            size={13}
            color={Colors.light.seagreen}
          />
          <Text style={styles.quoteText}>{motivationalQuote}</Text>
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
    paddingVertical: 24,
    gap: 20,
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
    fontFamily: "fonts.primary.semibold",
  },
  dayLabelActive: {
    color: Colors.light.white,
    fontWeight: "700",
    fontFamily: "fonts.primary.bold",
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 22,
  },
  statsText: {
    color: Colors.light.dullWhite,
    fontSize: 12,
  },
  statsCount: {
    color: Colors.light.white,
    fontWeight: "700",
    fontSize: 20,
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakText: {
    color: Colors.light.green,
    fontSize: 12,
    fontWeight: "600",
  },
  quoteBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
  },
  quoteText: {
    flex: 1,
    color: Colors.light.subtext,
    fontSize: 13,
    lineHeight: 16,
  },
});
