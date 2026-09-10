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
import {
  VolunteeringCategoryId,
  VOLUNTEERING_CATEGORIES,
} from "@/src/screens/private/goalprogressloggingscreen/volunteeringCategories";

export type VolunteeringDayProgress = {
  day: string;
  category: VolunteeringCategoryId | null;
  /** Minutes volunteered on this day */
  minutesLogged: number;
  isBestDay?: boolean;
  isToday?: boolean;
  isFuture?: boolean;
  isBlurDay?: boolean;
};

export type VolunteeringWeeklyProgressDashboardProps = {
  weekDays: VolunteeringDayProgress[];
  weekRangeLabel?: string;
  weekFraction?: string;
  totalMinutesThisWeek?: number;
  streakDays?: number;
  motivationalQuote?: string;
  selectedDayIndex?: number;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
};

const CARD_HORIZONTAL_PADDING = 8;
const WRAPPER_WIDTH_RATIO = 0.92;
const RING_SIZE_MAX = 34;

const formatTime = (totalMinutes: number) => {
  if (totalMinutes === 0) return "";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}:${m.toString().padStart(2, "0")}`;
  if (h > 0) return `${h}:00`;
  return `0:${m.toString().padStart(2, "0")}`;
};

const formatTotalTime = (totalMinutes: number) => {
  if (totalMinutes === 0) return "0h 0m";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Day Ring
// ─────────────────────────────────────────────────────────────────────────────
type DayRingProps = {
  size: number;
  day: VolunteeringDayProgress;
  isSelected: boolean;
};

function VolunteeringDayRing({ size, day, isSelected }: DayRingProps) {
  const hasLog = day.minutesLogged > 0 && day.category !== null;

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
      const catDef = VOLUNTEERING_CATEGORIES.find((c) => c.id === day.category)!;
      const iconColor = day.isBestDay ? Colors.light.yellow : Colors.light.white;
      return (
        <View
          style={[
            innerSizeStyle,
            styles.ringInner,
            styles.ringInnerLogged,
            !day.isToday && !day.isBestDay && styles.ringInnerLoggedPast,
          ]}
        >
          <MaterialCommunityIcons
            name={catDef.icon as any}
            size={size * 0.5}
            color={iconColor}
          />
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
export function VolunteeringWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  totalMinutesThisWeek = 150,
  streakDays = 0,
  motivationalQuote = "When you help others, you help yourself grow spiritually—stay inspired!",
  selectedDayIndex = 6,
  onDayPress,
  onPrevWeek,
  onNextWeek,
}: VolunteeringWeeklyProgressDashboardProps) {
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
          const hasLog = day.minutesLogged > 0 && day.category !== null;
          return (
            <TouchableOpacity
              key={`${day.day}-${index}`}
              style={styles.dayColumn}
              onPress={handleDayPress(index)}
              activeOpacity={0.75}
            >
              <View style={[styles.dayItemWrapper, isSelected && styles.dayItemSelected]}>
                <VolunteeringDayRing size={ringSize} day={day} isSelected={isSelected} />
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
                    {hasLog ? formatTime(day.minutesLogged) : ""}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <MaterialCommunityIcons name="hand-heart" size={24} color={Colors.light.lightblue} />
        <Text style={styles.statsText} numberOfLines={1}>
          <Text style={styles.statsCount}>{formatTotalTime(totalMinutesThisWeek)}</Text>
          {" total volunteered this week"}
        </Text>
      </View>

      {/* Footer Row */}
      <View style={styles.footerRow}>
        <View style={styles.streakBadge}>
          <Ionicons name="flash" size={13} color={Colors.light.yellow} />
          <Text style={styles.streakText}>{streakDays}-day streak</Text>
        </View>
        <View style={styles.quoteBlock}>
          <MaterialCommunityIcons name="target" size={14} color={Colors.light.seagreen} />
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
