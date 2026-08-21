import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { LighteningIcon } from "@/assets/icons/LighteningIcon";
import {
  AimIcon,
  BestdayStarIcon,
  DashBoardCalenderIcon,
  PrayerMatIcon,
} from "@/assets/icons";

export type TahiyatUlWudhuDayProgress = {
  day: string;
  isLogged?: boolean;
  prayersLogged: number;
  isBestDay?: boolean;
  isMenstruation?: boolean;
  isFuture?: boolean;
  isToday?: boolean;
};

export type TahiyatUlWudhuWeeklyProgressDashboardProps = {
  weekDays: TahiyatUlWudhuDayProgress[];
  weekRangeLabel?: string;
  weekFraction?: string;
  totalPrayersThisWeek?: number;
  streakDays?: number;
  /**
   * Prayer delta vs the previous week.
   * `null` / omitted on week 1 (no comparison slot). Present from week 2 onward.
   */
  vsLastWeek?: number | null;
  motivationalQuote?: string;
  selectedDayIndex?: number;
  statsIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  loading?: boolean;
  /** When true, remaining unlogged cycle days render as empty outlined circles. */
  isGoalCompleted?: boolean;
};

const CARD_HORIZONTAL_PADDING = 16;
const WRAPPER_WIDTH_RATIO = 0.92;
const RING_SIZE_MAX = 24;

const LOADING_WEEK: TahiyatUlWudhuDayProgress[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
].map((day) => ({
  day,
  prayersLogged: 0,
  isLogged: false,
}));

type DayRingProps = {
  size: number;
  hasLog: boolean;
  isBestDay: boolean;
  isSelected: boolean;
  isFuture: boolean;
  isMenstruation: boolean;
  showEmptyOutline: boolean;
};

function TahiyatUlWudhuDayRing({
  size,
  hasLog,
  isBestDay,
  isSelected,
  isFuture,
  isMenstruation,
  showEmptyOutline,
}: DayRingProps) {
  return (
    <View
      style={[
        styles.ringOuter,
        {
          width: size + 5,
          height: size + 5,
          borderRadius: 8,
        },
        isSelected && styles.ringOuterSelected,
      ]}
    >
      <View
        style={[
          styles.ringInner,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          isMenstruation
            ? styles.ringInnerMenstruation
            : showEmptyOutline
              ? styles.ringInnerDimOutline
              : isFuture
                ? styles.ringInnerFuture
                : hasLog
                  ? [
                      styles.ringInnerLogged,
                      isSelected && styles.ringInnerLoggedToday,
                    ]
                  : isSelected
                    ? styles.ringInnerSelectedEmpty
                    : styles.ringInnerEmpty,
        ]}
      >
        {isBestDay && !isFuture && !showEmptyOutline && !isMenstruation && (
          <BestdayStarIcon />
        )}
      </View>
    </View>
  );
}

export function TahiyatUlWudhuWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  totalPrayersThisWeek = 0,
  streakDays = 0,
  vsLastWeek = null,
  motivationalQuote = "",
  selectedDayIndex = 6,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  loading = false,
  isGoalCompleted = false,
}: TahiyatUlWudhuWeeklyProgressDashboardProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const displayWeekDays = loading ? LOADING_WEEK : weekDays;
  const showComparison = !loading && vsLastWeek != null;
  const vsLastWeekMagnitude = Math.abs(vsLastWeek ?? 0);
  const vsLastWeekImproved = (vsLastWeek ?? 0) > 0;

  const [activeDayIndex, setActiveDayIndex] = useState(selectedDayIndex);

  useEffect(() => {
    setActiveDayIndex(selectedDayIndex);
  }, [selectedDayIndex]);

  const availableWidth =
    screenWidth * WRAPPER_WIDTH_RATIO - CARD_HORIZONTAL_PADDING;
  const ringSize = Math.min(
    RING_SIZE_MAX,
    Math.floor((availableWidth / 7) * 0.62),
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <DashBoardCalenderIcon size={24} color={Colors.light.graylightshade} />
          <Text style={styles.weekFractionText} numberOfLines={1}>
            {loading
              ? "---"
              : `${weekFraction} ${t("homeScreen.weeklyProgress_weeks")}`}
          </Text>
        </View>

        <View style={styles.headerNav}>
          <TouchableOpacity
            onPress={onPrevWeek}
            disabled={!onPrevWeek || loading}
            activeOpacity={onPrevWeek && !loading ? 0.7 : 1}
            style={styles.navBtn}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={
                onPrevWeek && !loading
                  ? Colors.light.dullWhite
                  : Colors.light.dullWhite + "4D"
              }
            />
          </TouchableOpacity>
          <View style={styles.weekRangeTextWrap}>
            <Text
              style={styles.weekRangeText}
              numberOfLines={1}
              ellipsizeMode="tail"
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {loading ? "---" : weekRangeLabel}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onNextWeek}
            disabled={!onNextWeek || loading}
            activeOpacity={onNextWeek && !loading ? 0.7 : 1}
            style={styles.navBtn}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={
                onNextWeek && !loading
                  ? Colors.light.dullWhite
                  : Colors.light.dullWhite + "4D"
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.daysRow}>
        {displayWeekDays.map((day, index) => {
          const isSelected = !loading && index === activeDayIndex;
          const hasLog = day.prayersLogged > 0 || !!day.isLogged;
          const isFuture = !!day.isFuture;
          const isMenstruation = !!day.isMenstruation;
          const showEmptyOutline =
            !loading &&
            isGoalCompleted &&
            !hasLog &&
            !isMenstruation;
          const isInactiveOutline = isFuture || showEmptyOutline;

          return (
            <TouchableOpacity
              key={`${day.day}-${index}`}
              style={[
                styles.dayColumn,
                day.isBestDay && !isInactiveOutline && { zIndex: 2 },
              ]}
              onPress={() => {
                if (loading || isFuture) return;
                setActiveDayIndex(index);
                onDayPress?.(index);
              }}
              activeOpacity={loading || isFuture ? 1 : 0.75}
              disabled={loading || isFuture}
            >
              <View
                style={[
                  styles.dayItemWrapper,
                  isSelected && styles.dayItemSelected,
                ]}
              >
                <TahiyatUlWudhuDayRing
                  size={ringSize}
                  hasLog={hasLog}
                  isBestDay={!!day.isBestDay}
                  isSelected={isSelected}
                  isFuture={isFuture}
                  isMenstruation={isMenstruation}
                  showEmptyOutline={showEmptyOutline}
                />

                <Text
                  style={[
                    day.isBestDay && !isInactiveOutline && !loading
                      ? styles.bestDayLabel
                      : styles.dayLabel,
                    {
                      color: loading
                        ? Colors.light.subtext
                        : showEmptyOutline
                          ? "rgba(255, 255, 255, 0.12)"
                          : isFuture
                            ? "rgba(255, 255, 255, 0.45)"
                            : day.isBestDay
                              ? Colors.light.green
                              : isSelected
                                ? Colors.light.white
                                : Colors.light.subtext,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {loading
                    ? "---"
                    : day.isBestDay && !isInactiveOutline
                      ? "BEST DAY!"
                      : day.day}
                </Text>

                <View style={styles.durationSlot}>
                  <Text
                    style={[
                      {
                        color: loading
                          ? Colors.light.grey
                          : isInactiveOutline
                            ? "transparent"
                            : day.isBestDay
                              ? Colors.light.green
                              : isSelected
                                ? Colors.light.white
                                : Colors.light.grey,
                      },
                      styles.durationText,
                    ]}
                    numberOfLines={1}
                  >
                    {loading
                      ? "---"
                      : isInactiveOutline
                        ? ""
                        : day.isBestDay
                          ? day.prayersLogged.toString()
                          : day.prayersLogged > 0
                            ? day.prayersLogged.toString()
                            : ""}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.statsAndFooterContainer}>
        <View style={styles.statsRow}>
          <PrayerMatIcon />
          <Text style={styles.statsText} numberOfLines={1}>
            <Text style={styles.statsCount}>
              {loading ? "---" : totalPrayersThisWeek}
            </Text>
            {loading ? "" : " prayers this week"}
          </Text>
        </View>

        <View
          style={[
            styles.footerRow,
            showComparison && styles.footerRowWithComparison,
          ]}
        >
          <View style={styles.streakBadge}>
            <LighteningIcon />
            <Text style={styles.streakText}>
              {loading
                ? "---"
                : t("homeScreen.weeklyProgress_dayStreak", {
                    count: streakDays,
                  })}
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
                {vsLastWeekMagnitude === 0 ? (
                  t("homeScreen.weeklyProgress_samePrayersAsLastWeek")
                ) : (
                  <>
                    <Text style={styles.comparisonCount}>
                      {vsLastWeekMagnitude}
                    </Text>
                    {` ${t("homeScreen.weeklyProgress_prayersVsLastWeek")}`}
                  </>
                )}
              </Text>
            </View>
          ) : (
            <View style={[styles.quoteBlock, styles.quoteBlockInline]}>
              <AimIcon />
              <View style={styles.quoteTextWrap}>
                <Text style={styles.quoteText}>
                  {loading
                    ? "---"
                    : motivationalQuote ||
                      "Masha'Allah, may Allah always fill your heart with His love and light!"}
                </Text>
              </View>
            </View>
          )}
        </View>

        {showComparison ? (
          <View style={styles.quoteBlock}>
            <AimIcon />
            <View style={styles.quoteTextWrap}>
              <Text style={styles.quoteText}>
                {motivationalQuote ||
                  "Masha'Allah, may Allah always fill your heart with His love and light!"}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 8,
    paddingVertical: 16,
    gap: 24,
    zIndex: 150,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    minWidth: 0,
    width: "100%",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  weekFractionText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    lineHeight: 19,
    marginLeft: 0,
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    flexShrink: 1,
    minWidth: 0,
    flexGrow: 1,
  },
  navBtn: {
    padding: 2,
    flexShrink: 0,
  },
  weekRangeTextWrap: {
    flexShrink: 1,
    minWidth: 0,
    flexGrow: 1,
  },
  weekRangeText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    textAlign: "center",
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  daysRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    overflow: "visible",
  },
  dayColumn: {
    flex: 1,
    alignItems: "center",
    overflow: "visible",
  },
  dayItemWrapper: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 4,
    borderRadius: 8,
    width: "100%",
    overflow: "visible",
  },
  dayItemSelected: {
    backgroundColor: Colors.light.dayProgressCardBg,
    paddingTop: 3,
    paddingBottom: 18,
  },
  bestDayLabel: {
    color: Colors.light.green,
    fontSize: 9,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    textAlign: "center",
    marginTop: 4,
    width: 64,
    marginHorizontal: -14,
  },
  ringOuter: {
    alignItems: "center",
    justifyContent: "center",
    borderColor: "transparent",
  },
  ringOuterSelected: {},
  ringInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringInnerLogged: {
    backgroundColor: Colors.light.green,
  },
  ringInnerLoggedToday: {
    borderWidth: 1.5,
    borderColor: Colors.light.bordercolortodayselectedring,
  },
  ringInnerMenstruation: {
    backgroundColor: Colors.light.red,
  },
  ringInnerEmpty: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  ringInnerSelectedEmpty: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.28)",
  },
  /** Upcoming days while goal is still in progress (not 100%). */
  ringInnerFuture: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.32)",
  },
  /** Remaining days after goal is 100% — same outline style, much dimmer. */
  ringInnerDimOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  dayLabel: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    marginTop: 4,
    textAlign: "center",
  },
  durationSlot: {
    height: 18,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    marginTop: 4,
  },
  durationText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexWrap: "nowrap",
  },
  statsText: {
    color: Colors.light.white,
    fontSize: 13,
    fontFamily: fonts.primary.medium,
    flexShrink: 1,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  statsCount: {
    color: Colors.light.white,
    fontWeight: "700",
    fontSize: 20,
    fontFamily: fonts.primary.bold,
  },
  statsAndFooterContainer: {
    gap: 8,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
  },
  footerRowWithComparison: {
    justifyContent: "flex-end",
    gap: 16,
    paddingRight: 18,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  streakText: {
    color: Colors.light.white,
    fontSize: 13,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
  },
  quoteBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    alignSelf: "stretch",
    minWidth: 0,
    width: "100%",
    marginTop: 4,
  },
  quoteBlockInline: {
    flex: 1,
    width: undefined,
    minWidth: 0,
    marginTop: 0,
  },
  quoteTextWrap: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  comparisonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },
  comparisonText: {
    color: Colors.light.white,
    fontSize: 13,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    lineHeight: 14,
    letterSpacing: 0.1,
  },
  comparisonCount: {
    color: Colors.light.white,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    lineHeight: 14,
    letterSpacing: 0.1,
  },
  quoteText: {
    color: Colors.light.white,
    fontSize: 13,
    lineHeight: 15,
    letterSpacing: -0.1,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
});
