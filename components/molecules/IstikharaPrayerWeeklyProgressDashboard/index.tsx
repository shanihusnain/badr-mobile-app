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

export type IstikharaPrayerDayProgress = {
  day: string;
  isLogged?: boolean;
  prayersLogged: number;
  isBestDay?: boolean;
  isMenstruation?: boolean;
  isFuture?: boolean;
  isBlurDay?: boolean;
};

export type IstikharaPrayerWeeklyProgressDashboardProps = {
  weekDays: IstikharaPrayerDayProgress[];
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
  day: IstikharaPrayerDayProgress;
  isSelected: boolean;
};

function IstikharaPrayerDayRing({
  size,
  day,
  isSelected,
}: DayRingProps) {
  const hasLog = day.prayersLogged > 0 || !!day.isLogged;

  const innerSizeStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const renderInner = () => {
    if (day.isMenstruation) {
      return <View style={[innerSizeStyle, styles.ringInner, styles.ringInnerMenstruation]} />;
    }
    if (hasLog) {
      return (
        <View style={[innerSizeStyle, styles.ringInner, styles.ringInnerLogged]}>
          {day.isBestDay && (
            <Ionicons name="star" size={16} color={Colors.light.yellow} />
          )}
        </View>
      );
    }
    return <View style={[innerSizeStyle, styles.ringInner, styles.ringInnerEmpty]} />;
  };

  return (
    <View
      style={[
        styles.ringOuter,
        { width: size + 10, height: size + 16, borderRadius: 8 },
        isSelected && styles.ringOuterSelected,
        day.isBlurDay && styles.ringOuterBlur,
      ]}
    >
      {renderInner()}
    </View>
  );
}

export function IstikharaPrayerWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Dec 6 — 12",
  weekFraction = "2/4",
  totalPrayersThisWeek = 1,
  streakDays = 1,
  motivationalQuote = "Remember, relying on Allah’s wisdom is the key to making decisions with confidence and peace.",
  selectedDayIndex = 6,
  statsIcon = "rug",
  onDayPress,
  onPrevWeek,
  onNextWeek,
}: IstikharaPrayerWeeklyProgressDashboardProps) {
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
                <IstikharaPrayerDayRing
                  size={ringSize}
                  day={day}
                  isSelected={isSelected}
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
          {totalPrayersThisWeek === 1 ? " total prayer this week" : " total prayers this week"}
        </Text>
      </View>

      <View style={styles.streakRow}>
        <View style={styles.streakBadge}>
          <Ionicons name="flash" size={13} color={Colors.light.yellow} />
          <Text style={styles.streakText}>
            {streakDays}-day streak
          </Text>
        </View>
        <View style={styles.dot} />
        <Text style={styles.comparisonText}>
          Same prayers as last week
        </Text>
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
  ringOuterBlur: {
    opacity: 0.3,
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
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: 16, // Indent a little to match design
    gap: 8,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakText: {
    color: Colors.light.white,
    fontSize: 13,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.grey,
  },
  comparisonText: {
    color: Colors.light.white,
    fontSize: 13,
    fontFamily: fonts.primary.regular,
  },
  quoteBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginLeft: 16,
    marginRight: 16,
  },
  quoteText: {
    flex: 1,
    color: Colors.light.white,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
});
