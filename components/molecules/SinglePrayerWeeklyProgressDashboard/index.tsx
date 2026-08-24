import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { PrayerMatIcon } from "@/assets/icons";
import { PrayerWeeklyProgressFooter } from "@/components/molecules/PrayerWeeklyProgressFooter";
import { PrayerWeeklyProgressHeader } from "./PrayerWeeklyProgressHeader";
import { SinglePrayerDayRing } from "./SinglePrayerDayRing";
import {
  CARD_HORIZONTAL_PADDING,
  LOADING_WEEK,
  RING_SIZE_MAX,
  WRAPPER_WIDTH_RATIO,
  type SinglePrayerWeeklyProgressDashboardProps,
} from "./types";

export type {
  SinglePrayerDayProgress,
  SinglePrayerWeeklyProgressDashboardProps,
} from "./types";

export function SinglePrayerWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  totalPrayersThisWeek = 0,
  streakDays = 0,
  vsLastWeek = null,
  motivationalQuote = "",
  defaultMotivationalQuote = "",
  selectedDayIndex = 6,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  loading = false,
  isGoalCompleted = false,
}: SinglePrayerWeeklyProgressDashboardProps) {
  const { width: screenWidth } = useWindowDimensions();

  const displayWeekDays = loading ? LOADING_WEEK : weekDays;
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
      <PrayerWeeklyProgressHeader
        weekFraction={weekFraction}
        weekRangeLabel={weekRangeLabel}
        loading={loading}
        onPrevWeek={onPrevWeek}
        onNextWeek={onNextWeek}
      />

      <View style={styles.daysRow}>
        {displayWeekDays.map((day, index) => {
          const isSelected = day?.isToday === true;
          const hasLog = day.prayersLogged > 0 || !!day.isLogged;
          const isFuture = !!day.isFuture;
          const isMenstruation = !!day.isMenstruation;
          const showEmptyOutline =
            !loading && isGoalCompleted && !hasLog && !isMenstruation;
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
                <SinglePrayerDayRing
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

        <PrayerWeeklyProgressFooter
          loading={loading}
          streakDays={streakDays}
          vsLastWeek={vsLastWeek}
          motivationalQuote={motivationalQuote}
          defaultMotivationalQuote={defaultMotivationalQuote}
        />
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
});
