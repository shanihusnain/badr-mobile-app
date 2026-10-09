import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { BinIcon, DashBoardCalenderIcon } from "@/assets/icons";
import { FastingDashboardIcon } from "@/assets/icons/FastingDashboardIcon";
import { FlashIcon } from "@/assets/icons/FlashIcon";
import { ShootIcon } from "@/assets/icons/ShootIcon";
import type { MondayThursdayFastWeekSummary } from "@/src/screens/private/goalprogressloggingscreen/mondayThursdayFastsWeeklyData";
import { getMondayThursdayFastTodayIndexInWeek } from "@/src/screens/private/goalprogressloggingscreen/mondayThursdayFastsWeeklyData";
import { useDeleteFastingLog } from "@/src/api/mutations/useDeleteFastingLog";
import { MondayThursdayFastDayRing } from "./MondayThursdayFastDayRing";
import {
  getDayLabelTextStyle,
  mondayThursdayDayLabelStyles,
  shouldShowTodayLabelBackground,
} from "./mondayThursdayFastDayStyles";

export type MondayThursdayFastsWeeklyProgressDashboardProps = {
  weekSummary: MondayThursdayFastWeekSummary;
  selectedDayIndex?: number | null;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  loading?: boolean;
  onDeleted?: () => void;
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

export function MondayThursdayFastsWeeklyProgressDashboard({
  weekSummary,
  selectedDayIndex,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  loading = false,
  onDeleted,
}: MondayThursdayFastsWeeklyProgressDashboardProps) {
  const { t, i18n } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const { mutate: deleteFastLog, isPending: isDeletingLog } =
    useDeleteFastingLog();
  const [selectForDeletion, setSelectForDeletion] = useState("");

  const todayIndexInWeek = useMemo(
    () => getMondayThursdayFastTodayIndexInWeek(weekSummary.weekDays),
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

  useEffect(() => {
    setSelectForDeletion("");
  }, [weekSummary.weekIndex, weekSummary.weekRangeLabel]);

  const availableWidth =
    screenWidth * WRAPPER_WIDTH_RATIO - CARD_HORIZONTAL_PADDING;
  const ringSize = Math.min(
    RING_SIZE_MAX,
    Math.floor((availableWidth / 7) * 0.62),
  );

  const handleDeleteLog = useCallback(
    (date: string) => {
      deleteFastLog(
        { fastingType: "MONDAY_THURSDAY", date },
        {
          onSuccess: () => {
            setSelectForDeletion("");
            onDeleted?.();
          },
        },
      );
    },
    [deleteFastLog, onDeleted],
  );

  const currentDayIndex =
    selectedDayIndex !== undefined ? selectedDayIndex : activeDayIndex;

  const weekOverWeekMagnitude = Math.abs(weekSummary.weekOverWeekDelta);
  const weekOverWeekImproved = weekSummary.weekOverWeekDelta > 0;

  const motivationalQuote = useMemo(() => {
    switch (weekSummary.motivationalQuoteKey) {
      case "weekOneProgress":
        return t("progressLogging.mondayThursdayWeekOneMotivation", {
          week: weekSummary.motivationalQuoteParams?.week ?? 1,
          percent: weekSummary.motivationalQuoteParams?.percent ?? 0,
        });
      case "buildingMomentum":
        return t("progressLogging.mondayThursdayBuildingMomentum", {
          count: weekSummary.motivationalQuoteParams?.count ?? 0,
        });
      case "tabarakAllah":
        return t("progressLogging.mondayThursdayTabarakAllahMotivation");
      case "stayConsistent":
        return t("progressLogging.mondayThursdayStayConsistentMotivation", {
          percent: weekSummary.motivationalQuoteParams?.percent ?? 0,
        });
      case "planNext":
      default:
        return t("progressLogging.mondayThursdayPlanNextMotivation");
    }
  }, [
    t,
    weekSummary.motivationalQuoteKey,
    weekSummary.motivationalQuoteParams,
  ]);

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
          const isMarkedForDeletion =
            !!day.date && selectForDeletion === day.date;
          const canDeleteDay =
            day.canDelete !== false &&
            day.state === "completed" &&
            !!day.date;
          const showTodayChip = shouldShowTodayLabelBackground(day);

          return (
            <TouchableOpacity
              key={`${day.day}-${day.date}`}
              style={[
                styles.dayColumn,
                isMarkedForDeletion && styles.dayColumnMarkedForDeletion,
              ]}
              onPress={() => {
                if (loading) return;
                if (selectForDeletion) {
                  setSelectForDeletion("");
                  return;
                }
                setActiveDayIndex(index);
                onDayPress?.(index);
              }}
              onLongPress={() => {
                if (loading || !canDeleteDay) return;
                setSelectForDeletion((prev) =>
                  prev === day.date ? "" : day.date,
                );
              }}
              activeOpacity={loading ? 1 : 0.75}
              disabled={loading}
            >
              <View
                style={[
                  styles.dayItemWrapper,
                  showTodayChip && styles.dayItemTodayChip,
                ]}
              >
                <MondayThursdayFastDayRing
                  size={ringSize}
                  state={day.state}
                  isMenstruating={day.isMenstruating}
                  isPlanned={day.isSelected}
                />
                <View style={mondayThursdayDayLabelStyles.dayLabelWrapper}>
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
              {isMarkedForDeletion ? (
                <Pressable
                  style={styles.deleteButton}
                  disabled={isDeletingLog}
                  onPress={() => {
                    if (!day.date || isDeletingLog) return;
                    handleDeleteLog(day.date);
                  }}
                >
                  <BinIcon />
                </Pressable>
              ) : null}
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
          {t("progressLogging.mondayThursdayWeeklyTotalFasts")}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.streakBadge}>
          <FlashIcon size={13} color={Colors.light.seagreen} />
          <Text style={styles.streakText}>
            {t("progressLogging.mondayThursdayWeeklyStreak", {
              count: weekSummary.streakWeeks,
            })}
          </Text>
        </View>

        {weekSummary.showPreviousWeekStat && weekOverWeekMagnitude > 0 ? (
          <View style={styles.streakBadge}>
            <Ionicons
              name={weekOverWeekImproved ? "caret-up" : "caret-down"}
              size={13}
              color={
                weekOverWeekImproved
                  ? Colors.light.seagreen
                  : Colors.light.grey
              }
            />
            <Text style={styles.previousWeekText}>
              {t("progressLogging.mondayThursdayWeekOverWeekDelta", {
                count: weekOverWeekMagnitude,
              })}
            </Text>
          </View>
        ) : null}

        <View style={styles.quoteBlock}>
          <ShootIcon
            size={14}
            Color={Colors.light.seagreen}
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
    flexShrink: 2,
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
    paddingBottom: 10,
  },
  dayColumn: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 6,
    paddingBottom: 4,
  },
  dayColumnMarkedForDeletion: {
    borderColor: Colors.light.red,
    backgroundColor: Colors.light.dullRed,
    zIndex: 99999,
  },
  dayItemWrapper: {
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 1,
    minWidth: 0,
  },
  /** Figma today chip — wraps ring + day label (must contrast card bg) */
  dayItemTodayChip: {
    backgroundColor: Colors.light.dayProgressCardBg,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 2,
  },
  deleteButton: {
    height: 20,
    width: 24,
    backgroundColor: Colors.light.red,
    borderRadius: 5,
    zIndex: 1000,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: -10,
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
    color: Colors.light.seagreen,
    fontSize: 13,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
  },
  previousWeekText: {
    color: Colors.light.white,
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
