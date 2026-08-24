import React from "react";
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
import {
  BestdayStarIcon,
  DashBoardCalenderIcon,
  PrayerMatIcon,
} from "@/assets/icons";
import { PrayerWeeklyProgressFooter } from "@/components/molecules/PrayerWeeklyProgressFooter";

export type TahiyatAlMasjidDayProgress = {
  day: string;
  isLogged?: boolean;
  prayersLogged: number;
  isBestDay?: boolean;
  isFuture?: boolean;
  isToday?: boolean;
};

export type TahiyatAlMasjidWeeklyProgressDashboardProps = {
  weekDays: TahiyatAlMasjidDayProgress[];
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
  /** When true, remaining unlogged cycle days render as empty outlined circles. */
  isGoalCompleted?: boolean;
};

const CARD_HORIZONTAL_PADDING = 16;
const WRAPPER_WIDTH_RATIO = 0.92;
const RING_SIZE_MAX = 24;

type DayRingProps = {
  size: number;
  hasLog: boolean;
  isBestDay: boolean;
  isSelected: boolean;
  isFuture: boolean;
  showEmptyOutline: boolean;
};

function TahiyatAlMasjidDayRing({
  size,
  hasLog,
  isBestDay,
  isSelected,
  isFuture,
  showEmptyOutline,
}: DayRingProps) {
  return (
    <View
      style={[
        styles.ringOuter,
        {
          width: size + 5,
          height: size + 5,
          borderRadius: 8,
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
          isFuture || showEmptyOutline
            ? isSelected
              ? styles.ringInnerSelectedEmpty
              : styles.ringInnerFuture
            : hasLog
              ? [
                  styles.ringInnerLogged,
                  isSelected && styles.ringInnerLoggedToday,
                ]
              : isSelected
                ? styles.ringInnerSelectedEmpty
                : styles.ringInnerEmpty,
        ]}
      >
        {isBestDay && !isFuture && !showEmptyOutline && <BestdayStarIcon />}
      </View>
    </View>
  );
}

export function TahiyatAlMasjidWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  totalPrayersThisWeek = 0,
  streakDays = 0,
  vsLastWeek = null,
  motivationalQuote = "",
  selectedDayIndex = 6,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  isGoalCompleted = false,
}: TahiyatAlMasjidWeeklyProgressDashboardProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const availableWidth =
    screenWidth * WRAPPER_WIDTH_RATIO - CARD_HORIZONTAL_PADDING;
  const ringSize = Math.min(
    RING_SIZE_MAX,
    Math.floor((availableWidth / 7) * 0.62),
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <DashBoardCalenderIcon size={24} color={Colors.light.graylightshade} />
          <Text style={styles.weekFractionText} numberOfLines={1}>
            {weekFraction} WEEKS
          </Text>
        </View>

        <View style={styles.headerNav}>
          <TouchableOpacity
            onPress={onPrevWeek}
            disabled={!onPrevWeek}
            activeOpacity={onPrevWeek ? 0.7 : 1}
            style={styles.navBtn}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={
                onPrevWeek ? Colors.light.dullWhite : Colors.light.dullWhite + "4D"
              }
            />
          </TouchableOpacity>
          <Text style={styles.weekRangeText} numberOfLines={1}>
            {weekRangeLabel}
          </Text>
          <TouchableOpacity
            onPress={onNextWeek}
            disabled={!onNextWeek}
            activeOpacity={onNextWeek ? 0.7 : 1}
            style={styles.navBtn}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={
                onNextWeek ? Colors.light.dullWhite : Colors.light.dullWhite + "4D"
              }
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.daysRow}>
        {weekDays.map((day, index) => {
          const isToday = !!day.isToday;
          const isSelected = isToday;
          const hasLog = day.prayersLogged > 0 || !!day.isLogged;
          const isFuture = !!day.isFuture;
          const showEmptyOutline = isGoalCompleted && !hasLog;
          const isInactiveOutline = isFuture || showEmptyOutline;

          return (
            <TouchableOpacity
              key={`${day.day}-${index}`}
              style={[
                styles.dayColumn,
                day.isBestDay && !isInactiveOutline && { zIndex: 2 },
              ]}
              onPress={() => {
                if (isFuture) return;
                onDayPress?.(index);
              }}
              activeOpacity={isFuture ? 1 : 0.75}
              disabled={isFuture}
            >
              <View
                style={[
                  styles.dayItemWrapper,
                  isSelected && styles.dayItemSelected,
                ]}
              >
                <TahiyatAlMasjidDayRing
                  size={ringSize}
                  hasLog={hasLog}
                  isBestDay={!!day.isBestDay}
                  isSelected={isSelected}
                  isFuture={isFuture}
                  showEmptyOutline={showEmptyOutline}
                />

                <Text
                  style={[
                    day.isBestDay && !isInactiveOutline
                      ? styles.bestDayLabel
                      : styles.dayLabel,
                    {
                      color: isInactiveOutline
                        ? "rgba(255, 255, 255, 0.1)"
                        : isSelected && day.isBestDay
                          ? Colors.light.green
                          : day.isBestDay
                            ? Colors.light.green
                            : isSelected
                              ? Colors.light.white
                              : Colors.light.subtext,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {day.isBestDay && !isInactiveOutline ? "BEST DAY!" : day.day}
                </Text>

                <View style={styles.durationSlot}>
                  <Text
                    style={[
                      {
                        color: isInactiveOutline
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
                    {isInactiveOutline
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
            <Text style={styles.statsCount}>{totalPrayersThisWeek}</Text>
            {" prayers this week"}
          </Text>
        </View>

        <PrayerWeeklyProgressFooter
          loading={loading}
          streakDays={streakDays}
          vsLastWeek={vsLastWeek}
          motivationalQuote={motivationalQuote}
          defaultMotivationalQuote="Masha'Allah, may Allah always fill your heart with His love and light!"
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 15,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginLeft: -6,
  },
  weekFractionText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    lineHeight: 19,
    marginLeft: 10,
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  navBtn: {
    padding: 2,
  },
  weekRangeText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    textAlign: "center",
    lineHeight: 20,
    letterSpacing: 0.1,
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
    paddingHorizontal: 2,
    paddingVertical: 10,
    borderRadius: 6,
    width: "100%",
    overflow: "visible",
  },
  dayItemSelected: {
    backgroundColor: Colors.light.dayProgressCardBg,
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
  ringInnerLoggedToday: {
    borderWidth: 1.5,
    borderColor: Colors.light.bordercolortodayselectedring,
  },
  ringInnerEmpty: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  ringInnerSelectedEmpty: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.28)",
  },
  ringInnerFuture: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
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
  streakCount: {
    color: Colors.light.white,
    fontSize: 13,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
  },
});
