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
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { DashBoardCalenderIcon } from "@/assets/icons/DashBoardCalenderIcon";
import { ShootIcon } from "@/assets/icons/ShootIcon";
import { GoatIcon } from "@/assets/icons/GoatIcon";
import { HouseWithHeartIcon } from "@/assets/icons/HouseWithHeartIcon";
import { DebtAssistanceIcon } from "@/assets/icons/DebtAssistanceIcon";
import { FlowCardQardHassanIcon } from "@/assets/icons/FlowCardQardHassanIcon";
import { FlowCardFoodReliefIcon } from "@/assets/icons/FlowCardFoodReleifIcon";
import { DashBoardHandHeartIcon } from "@/assets/icons/DashBoardHandHeartIcon";
import { FlashIcon } from "@/assets/icons/FlashIcon";
import { LillahCategoryId, getLillahCategory } from "@/src/screens/private/goalprogressloggingscreen/lillahCategories";

export type LillahDayProgress = {
  day: string;
  category: LillahCategoryId | null;
  /** Dollar amount given on this day */
  amount: number;
  isBestDay?: boolean;
  isToday?: boolean;
  isFuture?: boolean;
  isBlurDay?: boolean;
};

export type LillahWeeklyProgressDashboardProps = {
  weekDays: LillahDayProgress[];
  weekRangeLabel?: string;
  weekFraction?: string;
  totalThisWeek?: number;
  streakDays?: number;
  motivationalQuote?: string;
  selectedDayIndex?: number;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
};

const CARD_HORIZONTAL_PADDING = 16;
const WRAPPER_WIDTH_RATIO = 0.92;
const RING_SIZE_MAX = 34;

// ─────────────────────────────────────────────────────────────────────────────
// Day Ring
// ─────────────────────────────────────────────────────────────────────────────
type DayRingProps = {
  size: number;
  day: LillahDayProgress;
  isSelected: boolean;
};

function LillahDayRing({ size, day, isSelected }: DayRingProps) {
  const hasLog = day.amount > 0 && day.category !== null;

  const innerSizeStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const renderInner = () => {
    if (day.isFuture) {
      return <View style={[innerSizeStyle, styles.ringInner, styles.ringInnerFuture]} />;
    }

    if (hasLog) {
      const catDef = getLillahCategory(day.category!);
      const iconColor = day.isBestDay ? Colors.light.yellow : Colors.light.white;
      const iconSize = size * 0.7;

      const renderCategoryIcon = () => {
        switch (day.category) {
          case "qurbani":
            return <GoatIcon size={iconSize} color={iconColor} />;
          case "household-essentials":
            return <HouseWithHeartIcon size={iconSize} color={iconColor} />;
          case "debt-assistance":
            return <DebtAssistanceIcon size={iconSize} color={iconColor} />;
          case "qard-hassan":
            return <FlowCardQardHassanIcon size={iconSize} color={iconColor} />;
          case "food-relief":
            return <FlowCardFoodReliefIcon size={iconSize} color={iconColor} />;
          default:
            return (
              <MaterialCommunityIcons
                name={catDef.icon as any}
                size={iconSize}
                color={iconColor}
              />
            );
        }
      };

      return (
        <View
          style={[
            innerSizeStyle,
            styles.ringInner,
            styles.ringInnerLogged,
            !day.isToday && !day.isBestDay && styles.ringInnerLoggedPast,
          ]}
        >
          {renderCategoryIcon()}
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

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export function LillahWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  totalThisWeek = 350,
  streakDays = 1,
  motivationalQuote = "Share your blessings with the needy today, seeking only Allah's pleasure.",
  selectedDayIndex = 6,
  onDayPress,
  onPrevWeek,
  onNextWeek,
}: LillahWeeklyProgressDashboardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const availableWidth = screenWidth * WRAPPER_WIDTH_RATIO - CARD_HORIZONTAL_PADDING;
  const ringSize = Math.min(RING_SIZE_MAX, Math.floor((availableWidth / 7) * 0.62));

  const [activeDayIndex, setActiveDayIndex] = useState(selectedDayIndex);

  const handleDayPress = (index: number) => () => {
    setActiveDayIndex(index);
    onDayPress?.(index);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <DashBoardCalenderIcon size={20} color={Colors.light.subtext} />
          <Text style={styles.weekFractionText} numberOfLines={1}>
            {weekFraction} WEEKS
          </Text>
        </View>
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={onPrevWeek} activeOpacity={0.7} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={14} color={Colors.light.dullWhite} />
          </TouchableOpacity>
          <Text style={styles.weekRangeText} numberOfLines={1}>
            {weekRangeLabel}
          </Text>
          <TouchableOpacity onPress={onNextWeek} activeOpacity={0.7} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={14} color={Colors.light.dullWhite} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Days Row */}
      <View style={styles.daysRow}>
        {weekDays.map((day, index) => {
          const isSelected = index === activeDayIndex;
          const hasLog = day.amount > 0 && day.category !== null;
          return (
            <TouchableOpacity
              key={`${day.day}-${index}`}
              style={styles.dayColumn}
              onPress={handleDayPress(index)}
              activeOpacity={0.75}
            >
              <View style={[styles.dayItemWrapper, isSelected && styles.dayItemSelected]}>
                <LillahDayRing size={ringSize} day={day} isSelected={isSelected} />
                <Text
                  style={[day.isBestDay ? styles.bestDayLabel : styles.dayLabel]}
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
                    {hasLog ? `$${day.amount}` : ""}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <DashBoardHandHeartIcon size={24} color={Colors.light.lightblue} />
        <Text style={styles.statsText} numberOfLines={1}>
          <Text style={styles.statsCount}>${totalThisWeek}</Text>
          {" spent in total this week"}
        </Text>
      </View>

      {/* Footer Row */}
      <View style={styles.footerRow}>
        <View style={styles.streakBadge}>
          <FlashIcon size={13} color={Colors.light.yellow} />
          <Text style={styles.streakText}>{streakDays}-day streak</Text>
        </View>
        <View style={styles.quoteBlock}>
          <ShootIcon size={14} Color={Colors.light.seagreen} />
          <Text style={styles.quoteText}>{motivationalQuote}</Text>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
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
  navBtn: { padding: 2 },
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
    width: "100%",
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
  ringOuterSelected: {},
  ringOuterBlur: { opacity: 0.3 },
  ringInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringInnerLogged: {
    backgroundColor: Colors.light.green,
  },
  ringInnerLoggedPast: {
    opacity: 0.85,
  },
  ringInnerFuture: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "transparent",
  },
  ringInnerEmpty: {
    backgroundColor: "rgba(255,255,255,0.15)",
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
  durationTextBest: { color: Colors.light.green },
  durationTextNormal: { color: Colors.light.grey },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
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
    gap: 2,
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
    flex: 1,
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
