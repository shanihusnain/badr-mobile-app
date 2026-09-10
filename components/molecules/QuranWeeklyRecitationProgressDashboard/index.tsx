import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { QuranRecitationBySurahFlowCardImage } from "@/assets/icons";
import { WeeklyProgressStatsFooterSection } from "@/components/molecules/PrayerWeeklyProgressFooter/WeeklyProgressStatsFooterSection";
import { PrayerWeeklyProgressHeader } from "@/components/molecules/SinglePrayerWeeklyProgressDashboard/PrayerWeeklyProgressHeader";
import {
  CARD_HORIZONTAL_PADDING,
  RING_SIZE_MAX,
  WRAPPER_WIDTH_RATIO,
} from "@/components/molecules/SinglePrayerWeeklyProgressDashboard/types";
import { TopSpace } from "@/components/atoms/TopSpace";
import type {
  QuranRecitationDayProgress,
  WeeklySurahDashboardItem,
} from "@/src/screens/private/goalprogressloggingscreen/quranRecitationWeeklyData";
import type { QuranCompletionDayProgress } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationCompletionWeeklyData";
import { QuranRecitationDayRing } from "./QuranRecitationDayRing";
import { QuranCompletionDayRing } from "./QuranCompletionDayRing";
import { QuranRecitationWeeklyDayCircle } from "./QuranRecitationWeeklyDayCircle";

export type QuranWeeklyRecitationProgressDashboardProps = {
  weekDays: QuranRecitationDayProgress[];
  weekRangeLabel?: string;
  weekFraction?: string;
  totalRecitationsThisWeek?: number;
  dailyTarget?: number;
  /** When set, stats row uses this as the period target (weekly goals). */
  weekRecitationTarget?: number;
  streakDays?: number;
  vsLastWeek?: number | null;
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
  selectedSurahId?: string;
  surahContextLabel?: string;
  lockSurahSelection?: boolean;
};

export function QuranWeeklyRecitationProgressDashboard({
  weekDays,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  totalRecitationsThisWeek = 0,
  dailyTarget = 1,
  weekRecitationTarget,
  streakDays = 0,
  vsLastWeek = null,
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
  selectedSurahId,
  surahContextLabel: _surahContextLabel,
}: QuranWeeklyRecitationProgressDashboardProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const isWeeklySurahMode =
    visualizationMode === "weekly" && weeklySurahItems.length > 0;
  const isCompletionMode =
    visualizationMode === "completion" && completionWeekDays.length > 0;
  const isJuzMode =
    visualizationMode === "juz" && completionWeekDays.length > 0;
  const isCompletionStyleMode = isCompletionMode || isJuzMode;
  const [activeSurahId, setActiveSurahId] = useState(
    selectedSurahId ?? weeklySurahItems[0]?.surahId ?? "",
  );

  const activeWeeklySurah = useMemo(
    () =>
      weeklySurahItems.find((item) => item.surahId === activeSurahId) ??
      weeklySurahItems[0],
    [activeSurahId, weeklySurahItems],
  );

  useEffect(() => {
    if (!isWeeklySurahMode) return;
    if (selectedSurahId) {
      setActiveSurahId(selectedSurahId);
      return;
    }
    if (!weeklySurahItems.some((item) => item.surahId === activeSurahId)) {
      setActiveSurahId(weeklySurahItems[0]?.surahId ?? "");
    }
  }, [activeSurahId, isWeeklySurahMode, selectedSurahId, weeklySurahItems]);

  // Same ring sizing as SinglePrayerWeeklyProgressDashboard
  const availableWidth =
    screenWidth * WRAPPER_WIDTH_RATIO - CARD_HORIZONTAL_PADDING;
  const ringSize = Math.min(
    RING_SIZE_MAX,
    Math.floor((availableWidth / 7) * 0.62),
  );

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
      <PrayerWeeklyProgressHeader
        weekFraction={weekFraction}
        weekRangeLabel={weekRangeLabel}
        onPrevWeek={onPrevWeek}
        onNextWeek={onNextWeek}
      />

      {isWeeklySurahMode ? (
        <View style={styles.daysRow}>
          {activeWeeklySurah?.weekDays.map((day, index) => (
            <View
              key={`${activeWeeklySurah.surahId}-${day.day}-${index}`}
              style={styles.dayColumn}
            >
              <View style={styles.dayItemWrapper}>
                <QuranRecitationWeeklyDayCircle
                  status={day.status}
                  size={ringSize}
                />
                <TopSpace top={10} />
                <Text style={styles.dayLabel} numberOfLines={1}>
                  {day.day}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : isCompletionStyleMode ? (
        <View style={styles.daysRow}>
          {completionWeekDays.map((day, index) => {
            const isSelected = index === activeDayIndex;
            const isFuture = day.dayType === "future";

            return (
              <TouchableOpacity
                key={`${day.day}-${index}`}
                style={styles.dayColumn}
                onPress={handleDayPress(index)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.dayItemWrapper,
                    isSelected && styles.dayItemSelected,
                  ]}
                >
                  <QuranCompletionDayRing
                    day={day}
                    size={ringSize}
                    isSelected={isSelected}
                  />
                  <TopSpace top={10} />
                  <Text
                    style={[
                      styles.dayLabel,
                      {
                        color: isFuture
                          ? "rgba(255, 255, 255, 0.45)"
                          : isSelected
                            ? Colors.light.white
                            : Colors.light.subtext,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {day.hasActivity && day.completionNumber
                      ? isJuzMode
                        ? `J${day.completionNumber}`
                        : `C${day.completionNumber}`
                      : day.day}
                  </Text>
                  <View style={styles.durationSlot}>
                    <Text
                      style={[
                        styles.durationText,
                        {
                          color: isFuture
                            ? "transparent"
                            : isSelected
                              ? Colors.light.white
                              : Colors.light.grey,
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {day.hasActivity ? day.computedLabel : ""}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.daysRow}>
          {weekDays.map((day, index) => {
            const isSelected = index === activeDayIndex;
            const isFuture = day.dayType === "future";

            return (
              <TouchableOpacity
                key={`${day.day}-${index}`}
                style={styles.dayColumn}
                onPress={handleDayPress(index)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.dayItemWrapper,
                    isSelected && styles.dayItemSelected,
                  ]}
                >
                  <QuranRecitationDayRing
                    day={day}
                    dailyTarget={dailyTarget}
                    size={ringSize}
                    isSelected={isSelected}
                  />
                  <TopSpace top={10} />
                  <Text
                    style={[
                      styles.dayLabel,
                      {
                        color: isFuture
                          ? "rgba(255, 255, 255, 0.45)"
                          : isSelected
                            ? Colors.light.white
                            : Colors.light.subtext,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {day.day}
                  </Text>
                  <View style={styles.durationSlot}>
                    <Text
                      style={[
                        styles.durationText,
                        {
                          color: isFuture
                            ? "transparent"
                            : isSelected
                              ? Colors.light.white
                              : Colors.light.grey,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {`${day.recitationsCompleted}/${dailyTarget}`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <WeeklyProgressStatsFooterSection
        vsLastWeek={vsLastWeek}
        statsRow={
          <View style={styles.statsRow}>
            <QuranRecitationBySurahFlowCardImage
              size={28}
              color={Colors.light.lightblue}
            />
            <Text
              style={styles.statsText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              <Text style={styles.statsCountBold}>
                {displayTotalRecitations}
              </Text>
              <Text style={styles.statsCountRegular}>
                /{periodRecitationTarget}
              </Text>
              {` ${t(statsLabelKey)}`}
            </Text>
          </View>
        }
        footerProps={{
          streakDays,
          motivationalQuote,
          streakVariant: "default",
          comparisonVariant: "recitations",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Matches SinglePrayerWeeklyProgressDashboard
  card: {
    borderRadius: 14,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 8,
    paddingVertical: 16,
    gap: 24,
    zIndex: 150,
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
    paddingTop: 3,
    paddingBottom: 18,
    borderRadius: 8,
    width: "100%",
    overflow: "visible",
  },
  dayItemSelected: {
    backgroundColor: Colors.light.dayProgressCardBg,
    borderRadius: 6,
  },
  dayLabel: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    marginTop: 3,
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
    paddingLeft: 7,
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
    fontWeight: "600",
    fontSize: 20,
    fontFamily: fonts.primary.bold,
    letterSpacing: 0.1,
  },
  statsCountBold: {
    color: Colors.light.white,
    fontWeight: "700",
    fontSize: 20,
    fontFamily: fonts.primary.bold,
    letterSpacing: 0.1,
  },
  statsCountRegular: {
    color: Colors.light.white,
    fontWeight: "400",
    fontSize: 20,
    fontFamily: fonts.primary.regular,
    letterSpacing: 0.1,
  },
});
