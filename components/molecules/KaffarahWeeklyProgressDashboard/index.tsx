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

/**
 * Kaffarah category type:
 * - "clothes"  → feeding/clothing the poor (t-shirt icon)
 * - "meals"    → meals given (bowl icon)
 * - null       → no activity logged
 */
export type KaffarahCategory = "clothes" | "meals" | null;

export type KaffarahDayProgress = {
  day: string;
  category: KaffarahCategory;
  /** Number of meals/clothes given on this day */
  count: number;
  isBestDay?: boolean;
  /** True for today */
  isToday?: boolean;
  /** True for days in the future (no data yet) */
  isFuture?: boolean;
  /**
   * Blur day: all days following the day the user achieves 100% of their goal.
   * Rendered at 0.3 opacity.
   */
  isBlurDay?: boolean;
};

export type KaffarahWeeklyProgressDashboardProps = {
  weekDays: KaffarahDayProgress[];
  weekRangeLabel?: string;
  weekFraction?: string;
  /** Total meals/clothes count this week */
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
  day: KaffarahDayProgress;
  isSelected: boolean;
};

function KaffarahDayRing({ size, day, isSelected }: DayRingProps) {
  const hasLog = day.count > 0 && day.category !== null;

  const innerSizeStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const renderInner = () => {
    // Future day → empty outlined circle
    if (day.isFuture) {
      return <View style={[innerSizeStyle, styles.ringInner, styles.ringInnerFuture]} />;
    }

    // Logged day → green circle with icon
    if (hasLog) {
      const iconName =
        day.category === "clothes" ? "tshirt-crew" : "bowl-mix";
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
          <MaterialCommunityIcons name={iconName as any} size={size * 0.45} color={iconColor} />
        </View>
      );
    }

    // No activity day → filled grey circle
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
export function KaffarahWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  totalThisWeek = 5,
  streakDays = 1,
  motivationalQuote = "Kaffarah is a reminder of Allah's mercy—keep it up and stay inspired!",
  selectedDayIndex = 6,
  onDayPress,
  onPrevWeek,
  onNextWeek,
}: KaffarahWeeklyProgressDashboardProps) {
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
          const hasLog = day.count > 0 && day.category !== null;

          return (
            <TouchableOpacity
              key={`${day.day}-${index}`}
              style={styles.dayColumn}
              onPress={handleDayPress(index)}
              activeOpacity={0.75}
            >
              <View style={[styles.dayItemWrapper, isSelected && styles.dayItemSelected]}>
                <KaffarahDayRing size={ringSize} day={day} isSelected={isSelected} />

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
                    {hasLog ? `${day.count}` : ""}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <MaterialCommunityIcons
          name="hand-heart"
          size={24}
          color={Colors.light.lightblue}
        />
        <Text style={styles.statsText} numberOfLines={1}>
          <Text style={styles.statsCount}>{totalThisWeek}</Text>
          {" total meals/clothes this week"}
        </Text>
      </View>

      {/* Footer Row */}
      <View style={styles.footerRow}>
        <View style={styles.streakBadge}>
          <Ionicons name="flash" size={13} color={Colors.light.yellow} />
          <Text style={styles.streakText}>{streakDays}-day streak</Text>
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
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles (exact copy of Tawbah / Duha pattern)
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
    // slightly darker green for past days (not today)
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
