import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import {
  SinglePrayerWeeklyProgressDashboard,
  type SinglePrayerDayProgress,
} from "@/components/molecules/SinglePrayerWeeklyProgressDashboard";
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

function mapQuranDayToSinglePrayerDay(
  day: QuranHoursDayProgress,
  index: number,
  selectedDayIndex: number,
  hasExplicitToday: boolean,
): SinglePrayerDayProgress {
  const showDuration =
    day.minutesLogged > 0 && day.showDurationLabel !== false;

  return {
    day: day.day,
    prayersLogged: day.minutesLogged,
    isLogged: !!day.isLogged || day.minutesLogged > 0,
    isBestDay: day.isBestDay,
    isToday: hasExplicitToday ? !!day.isToday : index === selectedDayIndex,
    isFuture: day.isFuture,
    // Only Quran hours passes this — prayer dashboards omit it and keep counts.
    durationLabel: showDuration
      ? formatDayDuration(day.minutesLogged)
      : undefined,
  };
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
  const { hours, minutes } = formatWeeklyHoursTotal(totalMinutesThisWeek);

  const mappedWeekDays = useMemo(() => {
    const hasExplicitToday = weekDays.some((day) => day.isToday === true);
    return weekDays.map((day, index) =>
      mapQuranDayToSinglePrayerDay(
        day,
        index,
        selectedDayIndex,
        hasExplicitToday,
      ),
    );
  }, [weekDays, selectedDayIndex]);

  return (
    <SinglePrayerWeeklyProgressDashboard
      weekDays={mappedWeekDays}
      weekRangeLabel={weekRangeLabel}
      weekFraction={weekFraction}
      streakDays={streakDays}
      vsLastWeek={vsLastWeek}
      motivationalQuote={motivationalQuote}
      selectedDayIndex={selectedDayIndex}
      onDayPress={onDayPress}
      onPrevWeek={onPrevWeek}
      onNextWeek={onNextWeek}
      allowLogDeletion={false}
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
    />
  );
}

const styles = StyleSheet.create({
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
});
