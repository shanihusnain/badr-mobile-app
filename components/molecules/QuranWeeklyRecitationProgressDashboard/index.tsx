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
import type {
  QuranRecitationDayProgress,
  WeeklySurahDashboardItem,
} from "@/src/screens/private/goalprogressloggingscreen/quranRecitationWeeklyData";
import type { QuranCompletionDayProgress } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationCompletionWeeklyData";
import { getRecitationDayRingSize } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationWeeklyData";
import { QuranRecitationDayRing } from "./QuranRecitationDayRing";
import { QuranCompletionDayRing } from "./QuranCompletionDayRing";
import { WeeklySurahProgressList } from "@/src/screens/private/goalprogressloggingscreen/components/WeeklySurahProgressList";

export type QuranWeeklyRecitationProgressDashboardProps = {
  weekDays: QuranRecitationDayProgress[];
  weekRangeLabel?: string;
  weekFraction?: string;
  totalRecitationsThisWeek?: number;
  dailyTarget?: number;
  /** When set, stats row uses this as the period target (weekly goals). */
  weekRecitationTarget?: number;
  streakDays?: number;
  motivationalQuote?: string;
  visualizationMode?: "daily" | "weekly" | "completion" | "juz";
  weeklySurahItems?: WeeklySurahDashboardItem[];
  completionWeekDays?: QuranCompletionDayProgress[];
  completionTarget?: number;
  completionsLoggedThisWeek?: number;
  selectedDayIndex?: number;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
};

export function QuranWeeklyRecitationProgressDashboard({
  weekDays,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  totalRecitationsThisWeek = 0,
  dailyTarget = 1,
  weekRecitationTarget,
  streakDays = 0,
  motivationalQuote = "",
  visualizationMode = "daily",
  weeklySurahItems = [],
  completionWeekDays = [],
  completionTarget = 3,
  completionsLoggedThisWeek = 0,
  selectedDayIndex,
  onDayPress,
  onPrevWeek,
  onNextWeek,
}: QuranWeeklyRecitationProgressDashboardProps) {
  const { t, i18n } = useTranslation();
  console.log("quran recitation daily target", dailyTarget);
  const { width: screenWidth } = useWindowDimensions();
  console.log(
    "weekDays inside the quran weekly recitation progress dashboard",
    weekDays,
  );
  const isWeeklySurahMode =
    visualizationMode === "weekly" && weeklySurahItems.length > 0;
  const isCompletionMode =
    visualizationMode === "completion" && completionWeekDays.length > 0;
  const isJuzMode = visualizationMode === "juz" && completionWeekDays.length > 0;
  const isCompletionStyleMode = isCompletionMode || isJuzMode;
  console.log(
    "isWeeklySurahMode inside the quran weekly recitation progress dashboard",
    isWeeklySurahMode,
  );
  const [activeSurahId, setActiveSurahId] = useState(
    weeklySurahItems[0]?.surahId ?? "",
  );

  const activeWeeklySurah = useMemo(
    () =>
      weeklySurahItems.find((item) => item.surahId === activeSurahId) ??
      weeklySurahItems[0],
    [activeSurahId, weeklySurahItems],
  );

  useEffect(() => {
    if (!isWeeklySurahMode) return;
    if (!weeklySurahItems.some((item) => item.surahId === activeSurahId)) {
      setActiveSurahId(weeklySurahItems[0]?.surahId ?? "");
    }
  }, [activeSurahId, isWeeklySurahMode, weeklySurahItems]);

  const ringSize = getRecitationDayRingSize(screenWidth);

  const defaultSelectedIndex =
    selectedDayIndex ??
    Math.max(
      (isCompletionStyleMode ? completionWeekDays : weekDays).findIndex(
        (day) => day.dayType === "today",
      ),
      0,
    );

  const [activeDayIndex, setActiveDayIndex] = useState(defaultSelectedIndex);

  const handleDayPress = (index: number) => () => {
    setActiveDayIndex(index);
    onDayPress?.(index);
  };

  const periodRecitationTarget = isCompletionStyleMode
    ? completionTarget
    : isWeeklySurahMode
      ? (activeWeeklySurah?.weeklyTarget ?? weekRecitationTarget ?? dailyTarget)
      : (weekRecitationTarget ?? dailyTarget * 7);
  const displayTotalRecitations = isCompletionStyleMode
    ? completionsLoggedThisWeek
    : isWeeklySurahMode
      ? (activeWeeklySurah?.completedThisWeek ?? totalRecitationsThisWeek)
      : totalRecitationsThisWeek;
  const statsLabelKey = isJuzMode
    ? "progressLogging.juzLoggedThisWeek"
    : isCompletionMode
      ? "progressLogging.completionsThisWeek"
      : "progressLogging.totalRecitationsThisWeek";

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
            {weekFraction} {t("homeScreen.weeklyProgress_weeks")}
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
            {weekRangeLabel}
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

      {isWeeklySurahMode ? (
        <WeeklySurahProgressList
          surahItems={weeklySurahItems}
          activeSurahId={activeSurahId}
          onActiveSurahChange={setActiveSurahId}
        />
      ) : isCompletionStyleMode ? (
        <View style={styles.daysRow}>
          {completionWeekDays.map((day, index) => {
            const isSelected = index === activeDayIndex;

            return (
              <TouchableOpacity
                key={`${day.day}-${index}`}
                style={[styles.dayColumn, isSelected && styles.dayColumnActive]}
                onPress={handleDayPress(index)}
                activeOpacity={0.75}
              >
                <QuranCompletionDayRing
                  day={day}
                  size={ringSize}
                  isSelected={isSelected}
                />

                <Text
                  style={[
                    styles.dayLabel,
                    !day.isBestDay && isSelected && styles.dayLabelActive,
                    day.dayType === "future" && styles.dayLabelFuture,
                  ]}
                  numberOfLines={1}
                >
                  {day.hasActivity && day.completionNumber
                    ? isJuzMode
                      ? `J${day.completionNumber}`
                      : `C${day.completionNumber}`
                    : day.day}
                </Text>

                <Text
                  style={[
                    styles.dayLabel,
                    !day.isBestDay && isSelected && styles.dayLabelActive,
                    day.dayType === "future" && styles.dayLabelFuture,
                  ]}
                  numberOfLines={2}
                >
                  {day.hasActivity ? day.computedLabel : " "}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.daysRow}>
          {weekDays.map((day, index) => {
            const isSelected = index === activeDayIndex;
            console.log(
              "day inside the quran weekly recitation progress dashboard",
              day,
            );
            return (
              <TouchableOpacity
                key={`${day.day}-${index}`}
                style={[styles.dayColumn, isSelected && styles.dayColumnActive]}
                onPress={handleDayPress(index)}
                activeOpacity={0.75}
              >
                <QuranRecitationDayRing
                  day={day}
                  dailyTarget={dailyTarget}
                  size={ringSize}
                  isSelected={isSelected}
                />

                <Text
                  style={[
                    styles.dayLabel,
                    !day.isBestDay && isSelected && styles.dayLabelActive,
                    day.dayType === "future" && styles.dayLabelFuture,
                  ]}
                  numberOfLines={1}
                >
                  {day.day}
                </Text>

                <Text
                  style={[
                    styles.dayLabel,
                    !day.isBestDay && isSelected && styles.dayLabelActive,
                    day.dayType === "future" && styles.dayLabelFuture,
                  ]}
                  numberOfLines={1}
                >
                  {day.recitationsCompleted}/{dailyTarget}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.statsRow}>
        <MaterialCommunityIcons
          name="book-open-page-variant"
          size={20}
          color={Colors.light.lightblue}
        />
        <Text style={styles.statsText} numberOfLines={1}>
          <Text style={styles.statsCount}>
            {displayTotalRecitations}/{periodRecitationTarget}
          </Text>
          {" " + t(statsLabelKey)}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.streakBadge}>
          <Ionicons name="flash" size={13} color={Colors.light.green} />
          <Text style={styles.streakText}>
            {t("progressLogging.dayStreak", { count: streakDays })}
          </Text>
        </View>

        <View style={styles.quoteBlock}>
          <MaterialCommunityIcons
            name="format-quote-close"
            size={12}
            color={Colors.light.seagreen}
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
  dayLabelFuture: {
    opacity: 0.45,
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
  footerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
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
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
  },
  quoteBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    minWidth: 0,
  },
  quoteText: {
    flex: 1,
    color: Colors.light.white,
    fontSize: 13,
    lineHeight: 14,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
});
