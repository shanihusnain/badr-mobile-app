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
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { WeeklyProgressStatsFooterSection } from "@/components/molecules/PrayerWeeklyProgressFooter/WeeklyProgressStatsFooterSection";
import type { MemorisationDayProgress } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationWeeklyData";

export type QuranMemorisationWeeklyProgressDashboardProps = {
  weekDays: MemorisationDayProgress[];
  weekRangeLabel?: string;
  surahName?: string;
  totalAyahsThisWeek?: number;
  memorizedAyahs?: number;
  totalAyahs?: number;
  remainingAyahs?: number;
  progressPercent?: number;
  completed?: boolean;
  streakDays?: number;
  vsLastWeek?: number | null;
  motivationalQuote?: string;
  selectedDayIndex?: number;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  currentWeek?: number;
};

const CARD_HORIZONTAL_PADDING = 16;
const WRAPPER_WIDTH_RATIO = 0.92;
const COUNT_SLOT_HEIGHT = 14;
const RING_SIZE_MAX = 34;

type DayRingProps = {
  size: number;
  hasLog: boolean;
  isBestDay: boolean;
  isSelected: boolean;
  isToday?: boolean;
};

function MemorisationDayRing({
  size,
  hasLog,
  isBestDay,
  isSelected,
  isToday = false,
}: DayRingProps) {
  const outerSize = size + 6;
  const innerBackgroundColor =
    isToday && !hasLog
      ? Colors.light.blackBackground
      : hasLog
        ? Colors.light.green
        : Colors.light.calendarBg;

  return (
    <View
      style={[
        styles.ringOuter,
        {
          width: outerSize,
          height: outerSize,
          borderRadius: outerSize,
          borderWidth: isToday || isSelected ? 1 : 0,
          borderColor: Colors.light.dullWhite,
          overflow: "hidden",
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
            backgroundColor: innerBackgroundColor,
            overflow: "hidden",
          },
        ]}
      >
        {isBestDay && (
          <Ionicons name="star" size={18} color={Colors.light.yellow} />
        )}
      </View>
    </View>
  );
}

export function QuranMemorisationWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Nov 1 — Nov 7",
  surahName = "All Surahs",
  totalAyahsThisWeek = 0,
  memorizedAyahs = 0,
  totalAyahs = 0,
  remainingAyahs = 0,
  progressPercent = 0,
  completed = false,
  streakDays = 0,
  vsLastWeek = null,
  motivationalQuote = "",
  selectedDayIndex = 6,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  currentWeek = 1,
}: QuranMemorisationWeeklyProgressDashboardProps) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const { width: screenWidth } = useWindowDimensions();
  const availableWidth =
    screenWidth * WRAPPER_WIDTH_RATIO - CARD_HORIZONTAL_PADDING;
  const ringSize = Math.min(
    RING_SIZE_MAX,
    Math.floor((availableWidth / 7) * 0.62),
  );

  const todayIndex = useMemo(
    () => weekDays.findIndex((day) => day.isToday),
    [weekDays],
  );

  const [activeDayIndex, setActiveDayIndex] = useState(() =>
    todayIndex >= 0 ? todayIndex : selectedDayIndex,
  );

  useEffect(() => {
    if (todayIndex >= 0) {
      setActiveDayIndex(todayIndex);
      return;
    }
    setActiveDayIndex(0);
  }, [todayIndex, weekDays]);

  const handleDayPress = (index: number) => () => {
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
          <Text style={styles.weekLabelText} numberOfLines={1}>
            {currentWeek}/4 Weeks
          </Text>
        </View>

        <View style={styles.headerNav}>
          {onPrevWeek ? (
            <TouchableOpacity
              onPress={onPrevWeek}
              activeOpacity={0.7}
              style={styles.navBtn}
            >
              <Ionicons
                name="chevron-back"
                size={14}
                color={Colors.light.dullWhite}
              />
            </TouchableOpacity>
          ) : null}
          <Text style={styles.weekRangeText} numberOfLines={1}>
            {weekRangeLabel}
          </Text>
          {onNextWeek ? (
            <TouchableOpacity
              onPress={onNextWeek}
              activeOpacity={0.7}
              style={styles.navBtn}
            >
              <Ionicons
                name="chevron-forward"
                size={14}
                color={Colors.light.dullWhite}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.daysRow}>
        {weekDays.map((day, index) => {
          const isSelected = index === activeDayIndex;
          const countLabel =
            day.ayahsLogged > 0 ? formatNumber(day.ayahsLogged) : "";

          return (
            <TouchableOpacity
              key={`${day.day}-${day.date}`}
              style={[styles.dayColumn, isSelected && styles.dayColumnActive]}
              onPress={handleDayPress(index)}
              activeOpacity={0.75}
            >
              <MemorisationDayRing
                size={ringSize}
                hasLog={day.isLogged}
                isBestDay={!!day.isBestDay}
                isSelected={isSelected}
                isToday={day.isToday}
              />

              <Text
                style={[
                  day.isBestDay
                    ? styles.bestDayLabel
                    : day.isToday
                      ? styles.dayLabelToday
                      : styles.dayLabel,
                  !day.isBestDay &&
                    !day.isToday &&
                    isSelected &&
                    styles.dayLabelActive,
                ]}
                numberOfLines={1}
              >
                {day.isBestDay ? t("progressLogging.bestDay") : day.day}
              </Text>

              <View style={styles.countSlot}>
                {countLabel ? (
                  <Text
                    style={[
                      {
                        color: day.isBestDay
                          ? Colors.light.green
                          : Colors.light.grey,
                      },
                      styles.countText,
                    ]}
                    numberOfLines={1}
                  >
                    {countLabel}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <WeeklyProgressStatsFooterSection
        vsLastWeek={vsLastWeek}
        statsRow={
          <>
            <View style={styles.statsRow}>
              <MaterialCommunityIcons
                name="brain"
                size={20}
                color={Colors.light.lightblue}
              />
              <Text style={styles.statsText} numberOfLines={1}>
                <Text style={styles.statsCount}>
                  {formatNumber(totalAyahsThisWeek)}
                </Text>
                {" " + t("progressLogging.totalAyahsThisWeek")}
              </Text>
            </View>

            {completed ? (
              <View style={styles.progressRow}>
                <Text style={styles.completedText}>
                  {t("progressLogging.surahStatusCompleted")}
                </Text>
              </View>
            ) : null}
          </>
        }
        footerProps={{
          streakDays,
          motivationalQuote,
          streakVariant: "green",
        }}
      />
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
  weekLabelText: {
    color: Colors.light.white,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    textTransform: "uppercase",
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
    fontSize: 12,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    maxWidth: 110,
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
    paddingVertical: 4,
    borderRadius: 10,
  },
  dayColumnActive: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  bestDayLabel: {
    color: Colors.light.green,
    fontSize: 7,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    letterSpacing: 0.15,
    textAlign: "center",
    marginTop: 4,
  },
  ringOuter: {
    alignItems: "center",
    justifyContent: "center",
    borderColor: "transparent",
  },
  ringOuterSelected: {
    transform: [{ scale: 1.04 }],
  },
  ringInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  dayLabel: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    marginTop: 4,
    textAlign: "center",
  },
  dayLabelActive: {
    color: Colors.light.white,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
  },
  dayLabelToday: {
    color: Colors.light.white,
    fontSize: 10,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    marginTop: 4,
    textAlign: "center",
  },
  countSlot: {
    height: COUNT_SLOT_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  countText: {
    fontSize: 9,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    lineHeight: 11,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexWrap: "nowrap",
  },
  statsText: {
    color: Colors.light.dullWhite,
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    flexShrink: 1,
    fontWeight: "500",
  },
  statsCount: {
    color: Colors.light.white,
    fontWeight: "700",
    fontSize: 28,
    fontFamily: fonts.primary.bold,
  },
  progressRow: {
    gap: 4,
    paddingHorizontal: 8,
  },
  progressContext: {
    color: Colors.light.white,
    fontSize: 13,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    textAlign: "center",
  },
  progressDetail: {
    color: Colors.light.grey,
    fontSize: 12,
    fontFamily: fonts.primary.regular,
    lineHeight: 17,
    textAlign: "center",
  },
  completedText: {
    color: Colors.light.green,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    textAlign: "center",
  },
});
