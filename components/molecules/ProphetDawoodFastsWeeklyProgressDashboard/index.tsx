import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { FastingDashboardIcon } from "@/assets/icons/FastingDashboardIcon";
import { FlashIcon } from "@/assets/icons/FlashIcon";
import { ShootIcon } from "@/assets/icons/ShootIcon";
import { DashBoardCalenderIcon } from "@/assets/icons/DashBoardCalenderIcon";
import type { ProphetDawoodFastWeekSummary } from "@/src/screens/private/goalprogressloggingscreen/prophetDawoodFastsWeeklyData";
import { getProphetDawoodFastTodayIndexInWeek } from "@/src/screens/private/goalprogressloggingscreen/prophetDawoodFastsWeeklyData";
import { ProphetDawoodFastDayRing } from "./ProphetDawoodFastDayRing";
import {
  getDayLabelTextStyle,
  shouldShowTodayBackground,
  prophetDawoodFastDayLabelStyles,
} from "./prophetDawoodFastDayStyles";

export type ProphetDawoodFastsWeeklyProgressDashboardProps = {
  weekSummary: ProphetDawoodFastWeekSummary;
  selectedDayIndex?: number | null;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
};

const CARD_HORIZONTAL_PADDING = 16;
const WRAPPER_WIDTH_RATIO = 0.92;
const RING_SIZE_MAX = 34;

const DAY_TRANSLATION_KEYS: Record<string, string> = {
  Sun: "homeScreen.weeklyProgress_daySun",
  Mon: "homeScreen.weeklyProgress_dayMon",
  Tue: "homeScreen.weeklyProgress_dayTue",
  Wed: "homeScreen.weeklyProgress_dayWed",
  Thu: "homeScreen.weeklyProgress_dayThu",
  Fri: "homeScreen.weeklyProgress_dayFri",
  Sat: "homeScreen.weeklyProgress_daySat",
};

export function ProphetDawoodFastsWeeklyProgressDashboard({
  weekSummary,
  selectedDayIndex,
  onDayPress,
  onPrevWeek,
  onNextWeek,
}: ProphetDawoodFastsWeeklyProgressDashboardProps) {
  const { t, i18n } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const todayIndexInWeek = useMemo(
    () => getProphetDawoodFastTodayIndexInWeek(weekSummary.weekDays),
    [weekSummary.weekDays],
  );

  const resolvedSelectedIndex =
    selectedDayIndex !== undefined ? selectedDayIndex : todayIndexInWeek;

  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(
    resolvedSelectedIndex,
  );

  useEffect(() => {
    setActiveDayIndex(resolvedSelectedIndex);
  }, [weekSummary.weekIndex, resolvedSelectedIndex]);

  const availableWidth =
    screenWidth * WRAPPER_WIDTH_RATIO - CARD_HORIZONTAL_PADDING;
  const ringSize = Math.min(
    RING_SIZE_MAX,
    Math.floor((availableWidth / 7) * 0.62),
  );

  const handleDayPress = (index: number) => () => {
    setActiveDayIndex(index);
    onDayPress?.(index);
  };

  const currentDayIndex =
    selectedDayIndex !== undefined ? selectedDayIndex : activeDayIndex;

  const motivationalQuote = useMemo(() => {
    switch (weekSummary.motivationalQuoteKey) {
      case "completedToday":
        return t("progressLogging.dawoodMotivationCompletedToday");
      case "missed":
        return t("progressLogging.dawoodMotivationMissed");
      case "streakGrowing":
        return t("progressLogging.dawoodMotivationStreakGrowing");
      case "inProgress":
      default:
        return t("progressLogging.dawoodMotivationInProgress");
    }
  }, [t, weekSummary.motivationalQuoteKey]);

  const totalFastsSuffix =
    weekSummary.completedFastsThisWeek === 1
      ? t("progressLogging.dawoodWeeklyTotalFastsSuffix_one")
      : t("progressLogging.dawoodWeeklyTotalFastsSuffix_other");

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <DashBoardCalenderIcon
            size={20}
            color={Colors.light.subtext}
          />
          <Text style={styles.weekFractionText} numberOfLines={1}>
            {weekSummary.weekFraction} {t("homeScreen.weeklyProgress_weeks")}
          </Text>
        </View>

        <View style={styles.headerNav}>
          <TouchableOpacity
            onPress={onPrevWeek}
            activeOpacity={0.7}
            style={styles.navBtn}
          >
            <Ionicons
              name={i18n.language === "ar" ? "chevron-forward" : "chevron-back"}
              size={14}
              color={Colors.light.dullWhite}
            />
          </TouchableOpacity>
          <Text style={styles.weekRangeText} numberOfLines={1}>
            {weekSummary.weekRangeLabel}
          </Text>
          <TouchableOpacity
            onPress={onNextWeek}
            activeOpacity={0.7}
            style={styles.navBtn}
          >
            <Ionicons
              name={i18n.language === "ar" ? "chevron-back" : "chevron-forward"}
              size={14}
              color={Colors.light.dullWhite}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.daysRow}>
        {weekSummary.weekDays.map((day, index) => {
          const isSelected =
            currentDayIndex !== null && index === currentDayIndex;

          return (
            <TouchableOpacity
              key={`${day.day}-${day.date}`}
              style={styles.dayColumn}
              onPress={handleDayPress(index)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.dayItemWrapper,
                  shouldShowTodayBackground(day) &&
                  prophetDawoodFastDayLabelStyles.dayItemTodayBackground,
                ]}
              >
                <View style={styles.ringSlot}>
                  <ProphetDawoodFastDayRing size={ringSize} state={day.state} />
                  {day.showCycleRestartIcon ? (
                    <View style={styles.cycleRestartIcon}>
                      <Feather
                        name="refresh-ccw"
                        size={10}
                        color={Colors.light.ringDawood}
                      />
                    </View>
                  ) : null}
                </View>
                <View style={prophetDawoodFastDayLabelStyles.dayLabelWrapper}>
                  <Text
                    style={getDayLabelTextStyle(day, isSelected)}
                    numberOfLines={1}
                  >
                    {t(
                      (DAY_TRANSLATION_KEYS[day.day] ??
                        "homeScreen.weeklyProgress_daySun") as never,
                    )}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.statsRow}>
        <FastingDashboardIcon
          size={22}
          color={Colors.light.seagreen}
        />
        <Text style={styles.statsText} numberOfLines={1}>
          <Text style={styles.statsCount}>
            {weekSummary.completedFastsThisWeek}
          </Text>
          {totalFastsSuffix}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.streakBadge}>
          <FlashIcon size={13} color={Colors.light.green} />
          <Text style={styles.streakText}>
            {t("progressLogging.dawoodWeeklyStreak", {
              count: weekSummary.streakDays,
            })}
          </Text>
        </View>

        <View style={styles.quoteBlock}>
          <ShootIcon
            size={14}
            Color={Colors.light.subtext}
          />
          <Text style={styles.quoteText}>{motivationalQuote}</Text>
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
    paddingVertical: 20,
    gap: 16,
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
  },
  dayColumn: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
  },
  dayItemWrapper: {
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 1,
    minWidth: 0,
  },
  ringSlot: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  cycleRestartIcon: {
    position: "absolute",
    right: -12,
    bottom: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexWrap: "nowrap",
    marginTop: 6,
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
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  streakText: {
    color: Colors.light.green,
    fontSize: 13,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
  },
  quoteBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    minWidth: 120,
  },
  quoteText: {
    flex: 1,
    color: Colors.light.subtext,
    fontSize: 13,
    lineHeight: 16,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
});
