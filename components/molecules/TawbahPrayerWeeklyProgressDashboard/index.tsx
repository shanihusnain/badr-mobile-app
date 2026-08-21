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
import { AimIcon, LighteningIcon } from "@/assets/icons";
import { TopSpace } from "@/components/atoms/TopSpace";

export type TawbahPrayerDayProgress = {
  day: string;
  isToday?: boolean;
  isLogged?: boolean;
  prayersLogged: number;
  isBestDay?: boolean;
  isMenstruation?: boolean;
  isFuture?: boolean;
  isBlurDay?: boolean;
};

export type TawbahPrayerWeeklyProgressDashboardProps = {
  weekDays: TawbahPrayerDayProgress[];
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
};

const CARD_HORIZONTAL_PADDING = 16;
const WRAPPER_WIDTH_RATIO = 0.92;
const RING_SIZE_MAX = 34;

const LOADING_WEEK: TawbahPrayerDayProgress[] = [
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
  day: TawbahPrayerDayProgress;
  isSelected: boolean;
};

function TawbahPrayerDayRing({ size, day, isSelected }: DayRingProps) {
  const hasLog = day.prayersLogged > 0 || !!day.isLogged;

  const innerSizeStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const renderInner = () => {
    if (day.isMenstruation) {
      return (
        <View
          style={[
            innerSizeStyle,
            styles.ringInner,
            styles.ringInnerMenstruation,
          ]}
        />
      );
    }
    if (hasLog) {
      return (
        <View
          style={[innerSizeStyle, styles.ringInner, styles.ringInnerLogged]}
        >
          {day.isBestDay && (
            <Ionicons name="star" size={16} color={Colors.light.yellow} />
          )}
        </View>
      );
    }
    return (
      <View style={[innerSizeStyle, styles.ringInner, styles.ringInnerEmpty]} />
    );
  };

  return (
    <View
      style={[
        styles.ringOuter,
        { width: size + 10, height: size + 16, borderRadius: 8 },
        isSelected && styles.ringOuterSelected,
        day.isBlurDay && styles.ringOuterBlur,
      ]}
    >
      {renderInner()}
    </View>
  );
}

export function TawbahPrayerWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Dec 20 — 26",
  weekFraction = "4/4",
  totalPrayersThisWeek = 3,
  streakDays = 2,
  vsLastWeek = null,
  motivationalQuote = "Tabarak'Allah, goal achieved! May your heart forever savor the eternal sweetness of prayer.",
  selectedDayIndex = 1,
  statsIcon = "hand-heart",
  onDayPress,
  onPrevWeek,
  onNextWeek,
  loading = false,
}: TawbahPrayerWeeklyProgressDashboardProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const availableWidth =
    screenWidth * WRAPPER_WIDTH_RATIO - CARD_HORIZONTAL_PADDING;
  const ringSize = Math.min(
    RING_SIZE_MAX,
    Math.floor((availableWidth / 7) * 0.62),
  );

  const displayWeekDays = loading ? LOADING_WEEK : weekDays;
  const showComparison = !loading && vsLastWeek != null;
  const vsLastWeekMagnitude = Math.abs(vsLastWeek ?? 0);
  const vsLastWeekImproved = (vsLastWeek ?? 0) > 0;

  const [activeDayIndex, setActiveDayIndex] = useState(selectedDayIndex);

  useEffect(() => {
    setActiveDayIndex(selectedDayIndex);
  }, [selectedDayIndex]);

  const handleDayPress = (index: number) => () => {
    if (loading) return;
    setActiveDayIndex(index);
    onDayPress?.(index);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={16}
            color={Colors.light.seagreen}
          />
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
              size={14}
              color={
                onPrevWeek && !loading
                  ? Colors.light.dullWhite
                  : Colors.light.dullWhite + "4D"
              }
            />
          </TouchableOpacity>
          <Text style={styles.weekRangeText} numberOfLines={1}>
            {loading ? "---" : weekRangeLabel}
          </Text>
          <TouchableOpacity
            onPress={onNextWeek}
            disabled={!onNextWeek || loading}
            activeOpacity={onNextWeek && !loading ? 0.7 : 1}
            style={styles.navBtn}
          >
            <Ionicons
              name="chevron-forward"
              size={14}
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
          const isSelected = day.isToday;

          return (
            <TouchableOpacity
              key={`${day.day}-${index}`}
              style={styles.dayColumn}
              onPress={handleDayPress(index)}
              activeOpacity={0.75}
              disabled={loading}
            >
              <View
                style={[
                  styles.dayItemWrapper,
                  isSelected && styles.dayItemSelected,
                ]}
              >
                <TawbahPrayerDayRing
                  size={ringSize}
                  day={day}
                  isSelected={isSelected ?? false}
                />

                <Text
                  style={[
                    day.isBestDay && !loading
                      ? styles.bestDayLabel
                      : styles.dayLabel,
                  ]}
                  numberOfLines={1}
                >
                  {loading ? "---" : day.isBestDay ? "BEST DAY!" : day.day}
                </Text>

                <View style={styles.durationSlot}>
                  <Text
                    style={[
                      day.isBestDay
                        ? styles.durationTextBest
                        : styles.durationTextNormal,
                      styles.durationText,
                    ]}
                    numberOfLines={1}
                  >
                    {loading
                      ? "---"
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

      <TopSpace top={25} />
      <View style={styles.statsRow}>
        <MaterialCommunityIcons
          name={statsIcon}
          size={24}
          color={Colors.light.lightblue}
        />
        <Text style={styles.statsText} numberOfLines={1}>
          <Text style={styles.statsCount}>
            {loading ? "---" : totalPrayersThisWeek}
          </Text>
          {loading ? "" : " total prayers this week"}
        </Text>
      </View>

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
              {` ${t("homeScreen.weeklyProgress_prayersVsLastWeek")}`}
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
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 8,
    paddingVertical: 16,
    width: "100%",
    alignSelf: "stretch",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 1,
  },
  weekFractionText: {
    color: Colors.light.white,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    flexShrink: 0,
  },
  navBtn: {
    padding: 2,
  },
  weekRangeText: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    textAlign: "center",
  },
  daysRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 24,
  },
  dayColumn: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
  },
  dayItemWrapper: {
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderRadius: 8,
  },
  dayItemSelected: {
    backgroundColor: Colors.light.divider,
  },
  bestDayLabel: {
    color: Colors.light.green,
    fontSize: 9,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    textAlign: "center",
    marginTop: 4,
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
  ringInnerEmpty: {
    backgroundColor: Colors.light.dullWhiteOpacity,
  },
  ringInnerMenstruation: {
    backgroundColor: Colors.light.red,
  },
  ringOuterBlur: {
    opacity: 0.3,
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
    height: 14,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  durationText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    textAlign: "center",
  },
  durationTextBest: {
    color: Colors.light.green,
  },
  durationTextNormal: {
    color: Colors.light.grey,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexWrap: "nowrap",
  },
  statsText: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    flexShrink: 1,
    fontWeight: "500",
  },
  statsCount: {
    color: Colors.light.white,
    fontWeight: "700",
    fontSize: 22,
    fontFamily: fonts.primary.bold,
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
