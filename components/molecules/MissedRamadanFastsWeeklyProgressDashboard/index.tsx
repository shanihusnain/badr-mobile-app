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
import { BinIcon } from "@/assets/icons";
import { FastingDashboardIcon } from "@/assets/icons/FastingDashboardIcon";
import { DashBoardCalenderIcon } from "@/assets/icons/DashBoardCalenderIcon";
import { FlashIcon } from "@/assets/icons/FlashIcon";
import { ShootIcon } from "@/assets/icons/ShootIcon";
import type { MissedRamadanFastWeekSummary } from "@/src/screens/private/goalprogressloggingscreen/missedRamadanFastsWeeklyData";
import { getMissedRamadanFastTodayIndexInWeek } from "@/src/screens/private/goalprogressloggingscreen/missedRamadanFastsWeeklyData";
import { MissedRamadanFastDayRing } from "./MissedRamadanFastDayRing";
import {
  getDayLabelTextStyle,
  missedRamadanDayLabelStyles,
  shouldShowTodayLabelBackground,
} from "./missedRamadanFastDayStyles";
import { useDeleteFastingLog } from "@/src/api/mutations/useDeleteFastingLog";

export type MissedRamadanFastsWeeklyProgressDashboardProps = {
  weekSummary: MissedRamadanFastWeekSummary;
  selectedDayIndex?: number | null;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  /** Frame / week fetch in progress */
  loading?: boolean;
  /** Called after a kept-day log is deleted so the parent can refresh. */
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

export function MissedRamadanFastsWeeklyProgressDashboard({
  weekSummary,
  selectedDayIndex,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  loading = false,
  onDeleted,
}: MissedRamadanFastsWeeklyProgressDashboardProps) {
  const { t, i18n } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const { mutate: deleteFastLog, isPending: isDeletingLog } =
    useDeleteFastingLog();
  const [selectForDeletion, setSelectForDeletion] = useState("");

  const todayIndexInWeek = useMemo(
    () => getMissedRamadanFastTodayIndexInWeek(weekSummary.weekDays),
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
        { fastingType: "MISSED_RAMADAN", date },
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

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <DashBoardCalenderIcon size={20} color={Colors.light.subtext} />
          <Text style={styles.weekFractionText} numberOfLines={1}>
            {loading ? "---" : weekSummary.weekFraction}{" "}
            {t("homeScreen.weeklyProgress_weeks")}
          </Text>
        </View>

        <View style={styles.headerNav}>
          <TouchableOpacity
            onPress={onPrevWeek}
            activeOpacity={0.7}
            style={styles.navBtn}
            disabled={loading || !onPrevWeek}
          >
            <Ionicons
              name={i18n.language === "ar" ? "chevron-forward" : "chevron-back"}
              size={14}
              color={Colors.light.dullWhite}
            />
          </TouchableOpacity>
          <Text style={styles.weekRangeText} numberOfLines={1}>
            {loading ? "---" : weekSummary.weekRangeLabel}
          </Text>
          <TouchableOpacity
            onPress={onNextWeek}
            activeOpacity={0.7}
            style={styles.navBtn}
            disabled={loading || !onNextWeek}
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
          // #16 / #17 — delete chrome from canDelete (completed kept days)
          const canDeleteDay = Boolean(day.canDelete) && !!day.date;
          // Today chip only when isToday (#2/#3/#6/#7/#10/#12/#17)
          const showTodayChip = shouldShowTodayLabelBackground(day);
          const isBlurred = day.state === "goalAchieved";

          return (
            <TouchableOpacity
              key={`${day.day}-${day.date}`}
              style={[
                styles.dayColumn,
                isMarkedForDeletion && styles.dayColumnMarkedForDeletion,
                isBlurred && styles.dayColumnBlurred,
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
                  // #16 / #17 — red border when marked for delete
                  isMarkedForDeletion && styles.dayItemDeleteBorder,
                  // #16 past delete: padding without today chip fill
                  isMarkedForDeletion &&
                    !showTodayChip &&
                    styles.dayItemDeletePadding,
                ]}
              >
                <MissedRamadanFastDayRing
                  size={ringSize}
                  state={day.state}
                  isMenstruating={day.isMenstruating}
                  isPlanned={Boolean(day.isPlanned)}
                />
                <View style={missedRamadanDayLabelStyles.dayLabelWrapper}>
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
        <FastingDashboardIcon size={22} color={Colors.light.seagreen} />
        <Text style={styles.statsText} numberOfLines={1}>
          <Text style={styles.statsCount}>
            {loading ? "---" : weekSummary.completedFastsThisWeek}
          </Text>{" "}
          {loading ? "" : t("progressLogging.missedRamadanWeeklyTotalFasts")}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.streakBadge}>
          <FlashIcon size={13} color={Colors.light.ringRamadan} />
          <Text style={styles.streakText}>
            {loading
              ? "---"
              : t("progressLogging.missedRamadanWeeklyStreak", {
                  count: weekSummary.streakDays,
                })}
          </Text>
        </View>

        {!loading && weekSummary.showPreviousWeekStat ? (
          <View style={styles.streakBadge}>
            <Ionicons name="caret-down" size={13} color={Colors.light.grey} />
            <Text style={styles.previousWeekText}>
              {t("progressLogging.missedRamadanPreviousWeekCount", {
                count: weekSummary.previousWeekCompletedCount,
              })}
            </Text>
          </View>
        ) : null}

        <View style={styles.quoteBlock}>
          <ShootIcon size={14} Color={Colors.light.seagreen} />
          <Text style={styles.quoteText}>
            {loading ? "---" : weekSummary.motivationalQuote}
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
    zIndex: 99999,
  },
  dayColumnBlurred: {
    opacity: 0.35,
  },
  dayItemWrapper: {
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 1,
    minWidth: 0,
  },
  /** Figma today / delete chip — wraps ring + day label (must contrast card bg) */
  dayItemTodayChip: {
    backgroundColor: Colors.light.dayProgressCardBg,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 2,
  },
  /** #16 / #17 — thin red border when marked for delete */
  dayItemDeleteBorder: {
    borderWidth: 1,
    borderColor: Colors.light.red,
    borderRadius: 6,
  },
  /** #16 — padding when delete border has no today chip */
  dayItemDeletePadding: {
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
    color: Colors.light.ringRamadan,
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
