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

export type TahiyatAlMasjidDayProgress = {
  day: string;
  isLogged?: boolean;
  prayersLogged: number;
  isBestDay?: boolean;
  isMenstruation?: boolean;
};

export type TahiyatAlMasjidWeeklyProgressDashboardProps = {
  weekDays: TahiyatAlMasjidDayProgress[];
  weekRangeLabel?: string;
  weekFraction?: string;
  totalPrayersThisWeek?: number;
  streakDays?: number;
  motivationalQuote?: string;
  selectedDayIndex?: number;
  statsIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
};

const CARD_HORIZONTAL_PADDING = 16;
const WRAPPER_WIDTH_RATIO = 0.92;
const RING_SIZE_MAX = 34;

type DayRingProps = {
  size: number;
  hasLog: boolean;
  isBestDay: boolean;
  isSelected: boolean;
  isMenstruation: boolean;
};

function TahiyatAlMasjidDayRing({
  size,
  hasLog,
  isBestDay,
  isSelected,
  isMenstruation,
}: DayRingProps) {
  const ringOuterSizeStyle = {
    width: size + 10,
    height: size + 16,
    borderRadius: 8,
  };
  const ringInnerSizeStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };
  const ringInnerColorStyle = isMenstruation
    ? styles.ringInnerMenstruation
    : hasLog
    ? styles.ringInnerLogged
    : styles.ringInnerEmpty;

  return (
    <View
      style={[
        styles.ringOuter,
        ringOuterSizeStyle,
        isSelected && styles.ringOuterSelected,
      ]}
    >
      <View
        style={[
          styles.ringInner,
          ringInnerSizeStyle,
          ringInnerColorStyle,
        ]}
      >
        {isBestDay && !isMenstruation && (
          <Ionicons name="star" size={18} color={Colors.light.yellow} />
        )}
      </View>
    </View>
  );
}

export function TahiyatAlMasjidWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Dec 20 — 26",
  weekFraction = "4/4",
  totalPrayersThisWeek = 14,
  streakDays = 2,
  motivationalQuote = "Alhamdulillah! You achieved 58% of your goal! Masha'Allah, may Allah bless and reward you.",
  selectedDayIndex = 6,
  statsIcon = "rug",
  onDayPress,
  onPrevWeek,
  onNextWeek,
}: TahiyatAlMasjidWeeklyProgressDashboardProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const availableWidth =
    screenWidth * WRAPPER_WIDTH_RATIO - CARD_HORIZONTAL_PADDING;
  const ringSize = Math.min(
    RING_SIZE_MAX,
    Math.floor((availableWidth / 7) * 0.62)
  );

  const [activeDayIndex, setActiveDayIndex] = useState(selectedDayIndex);

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
          const hasLog = day.prayersLogged > 0 || !!day.isLogged;

          return (
            <TouchableOpacity
              key={`${day.day}-${index}`}
              style={styles.dayColumn}
              onPress={handleDayPress(index)}
              activeOpacity={0.75}
            >
              <View style={[styles.dayItemWrapper, isSelected && styles.dayItemSelected]}>
                <TahiyatAlMasjidDayRing
                  size={ringSize}
                  hasLog={hasLog}
                  isBestDay={!!day.isBestDay}
                  isSelected={isSelected}
                  isMenstruation={!!day.isMenstruation}
                />

                <Text
                  style={[
                    day.isBestDay ? styles.bestDayLabel : styles.dayLabel,
                  ]}
                  numberOfLines={1}
                >
                  {day.isBestDay ? "BEST DAY!" : day.day}
                </Text>

                <View style={styles.durationSlot}>
                  <Text
                    style={[
                      day.isBestDay ? styles.durationTextBest : styles.durationTextNormal,
                      styles.durationText,
                    ]}
                    numberOfLines={1}
                  >
                    {day.isBestDay ? day.prayersLogged.toString() : (day.prayersLogged > 0 ? day.prayersLogged.toString() : "")}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.statsRow}>
        <MaterialCommunityIcons
          name={statsIcon}
          size={24}
          color={Colors.light.lightblue}
        />
        <Text style={styles.statsText} numberOfLines={1}>
          <Text style={styles.statsCount}>
            {totalPrayersThisWeek}
          </Text>
          {" total prayers this week"}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.streakBadge}>
          <Ionicons name="flash" size={13} color={Colors.light.yellow} />
          <Text style={styles.streakText}>
            {streakDays}-day streak
          </Text>
        </View>

        <View style={styles.streakBadge}>
          <Ionicons name="caret-up" size={13} color={Colors.light.green} />
          <Text style={styles.streakText}>
            5 prayers vs. last week
          </Text>
        </View>
      </View>
      
      <View style={styles.quoteBlock}>
        <MaterialCommunityIcons
          name="target"
          size={14}
          color={Colors.light.seagreen}
        />
        <Text style={styles.quoteText}>{motivationalQuote}</Text>
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
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderRadius: 8,
  },
  dayItemSelected: {
    backgroundColor: Colors.light.divider,
  },
  bestDayLabel: {
    color: Colors.light.green,
    fontSize: 9,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    textAlign: "center",
    marginTop: 4,
  },
  ringOuter: {
    alignItems: "center",
    justifyContent: "center",
    borderColor: "transparent",
  },
  ringOuterSelected: {
    // No outer border needed based on the design, it uses background instead
  },
  ringInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringInnerLogged: {
    backgroundColor: Colors.light.green,
  },
  ringInnerEmpty: {
    backgroundColor: Colors.light.dullWhiteOpacity,
  },
  ringInnerMenstruation: {
    backgroundColor: Colors.light.red,
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
  durationTextBest: {
    color: Colors.light.green,
  },
  durationTextNormal: {
    color: Colors.light.grey,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexWrap: "nowrap",
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
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
  },
  quoteBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
  },
  quoteText: {
    flex: 1,
    color: Colors.light.white,
    fontSize: 13,
    lineHeight: 16,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
});
