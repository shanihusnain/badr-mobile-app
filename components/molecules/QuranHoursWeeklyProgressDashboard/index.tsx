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
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { WeeklyProgressStatsFooterSection } from "@/components/molecules/PrayerWeeklyProgressFooter/WeeklyProgressStatsFooterSection";
import type { QuranHoursDayProgress } from "@/src/screens/private/goalprogressloggingscreen/quranHoursWeeklyData";
import {
  formatDayDuration,
  formatWeeklyHoursTotal,
} from "@/src/screens/private/goalprogressloggingscreen/quranHoursWeeklyData";

export type QuranHoursWeeklyProgressDashboardProps = {
  weekDays: QuranHoursDayProgress[];
  weekRangeLabel?: string;
  weekFraction?: string;
  totalMinutesThisWeek?: number;
  streakDays?: number;
  vsLastWeek?: number | null;
  motivationalQuote?: string;
  /** Defaults to Saturday (index 6) to match design mock. */
  selectedDayIndex?: number;
  statsIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
};

const CARD_HORIZONTAL_PADDING = 16;
const WRAPPER_WIDTH_RATIO = 0.92;
const DURATION_SLOT_HEIGHT = 14;
const RING_SIZE_MAX = 34;

type DayRingProps = {
  size: number;
  hasLog: boolean;
  isBestDay: boolean;
  isSelected: boolean;
};

function QuranHoursDayRing({
  size,
  hasLog,
  isBestDay,
  isSelected,
}: DayRingProps) {
  return (
    <View
      style={[
        styles.ringOuter,
        {
          width: size + 6,
          height: size + 6,
          borderRadius: (size + 6) / 2,
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
          hasLog ? styles.ringInnerLogged : styles.ringInnerEmpty,
        ]}
      >
        {isBestDay && (
          <Ionicons name="star" size={18} color={Colors.light.yellow} />
        )}
      </View>
    </View>
  );
}

export function QuranHoursWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  totalMinutesThisWeek = 0,
  streakDays = 0,
  vsLastWeek = null,
  motivationalQuote = "",
  selectedDayIndex = 6,
  statsIcon = "headphones",
  onDayPress,
  onPrevWeek,
  onNextWeek,
}: QuranHoursWeeklyProgressDashboardProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  console.log(
    "chekcing props of quran hours weekly progress dashboard",
    weekDays,
    weekRangeLabel,
    weekFraction,
    totalMinutesThisWeek,
    streakDays,
    motivationalQuote,
    selectedDayIndex,
    statsIcon,
    onDayPress,
    onPrevWeek,
    onNextWeek,
  );
  const availableWidth =
    screenWidth * WRAPPER_WIDTH_RATIO - CARD_HORIZONTAL_PADDING;
  const ringSize = Math.min(
    RING_SIZE_MAX,
    Math.floor((availableWidth / 7) * 0.62),
  );

  const [activeDayIndex, setActiveDayIndex] = useState(selectedDayIndex);

  const { hours, minutes } = formatWeeklyHoursTotal(totalMinutesThisWeek);

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
          <Text style={styles.weekFractionText} numberOfLines={1}>
            {weekFraction} WEEKS
          </Text>
        </View>

        <View style={styles.headerNav}>
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
          <Text style={styles.weekRangeText} numberOfLines={1}>
            {weekRangeLabel}
          </Text>
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
        </View>
      </View>

      <View style={styles.daysRow}>
        {weekDays.map((day, index) => {
          const isSelected = index === activeDayIndex;
          const hasLog = day.minutesLogged > 0 || !!day.isLogged;
          const showDuration =
            day.minutesLogged > 0 && day.showDurationLabel !== false;
          const durationLabel = showDuration
            ? formatDayDuration(day.minutesLogged)
            : "";

          return (
            <TouchableOpacity
              key={`${day.day}-${index}`}
              style={[styles.dayColumn, isSelected && styles.dayColumnActive]}
              onPress={handleDayPress(index)}
              activeOpacity={0.75}
            >
              <QuranHoursDayRing
                size={ringSize}
                hasLog={hasLog}
                isBestDay={!!day.isBestDay}
                isSelected={isSelected}
              />

              <Text
                style={[
                  day.isBestDay ? styles.bestDayLabel : styles.dayLabel,
                  !day.isBestDay && isSelected && styles.dayLabelActive,
                ]}
                numberOfLines={1}
              >
                {day.isBestDay ? t("progressLogging.bestDay") : day.day}
              </Text>

              <View style={styles.durationSlot}>
                {durationLabel ? (
                  <Text
                    style={[
                      {
                        color: day.isBestDay
                          ? Colors.light.green
                          : Colors.light.grey,
                      },
                      styles.durationText,
                    ]}
                    numberOfLines={1}
                  >
                    {durationLabel}
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
          <View style={styles.statsRow}>
            <MaterialCommunityIcons
              name={statsIcon}
              size={20}
              color={Colors.light.lightblue}
            />
            <Text style={styles.statsText} numberOfLines={1}>
              <Text style={styles.statsCount}>
                {hours}h {minutes}m
              </Text>
              {" " + t("progressLogging.totalHoursThisWeek")}
            </Text>
          </View>
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
    // borderWidth: 2,
    borderColor: "transparent",
  },
  ringOuterSelected: {
    // borderColor: Colors.light.ringQuran,
  },
  ringInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringInnerLogged: {
    backgroundColor: Colors.light.green,
  },
  ringInnerEmpty: {
    backgroundColor: Colors.light.calendarBg,
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
  durationSlot: {
    height: DURATION_SLOT_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  durationText: {
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
});
