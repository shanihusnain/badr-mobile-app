import React, { useEffect, useState } from "react";
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
import { SunnahRawatibDayRing, type SunnahDayData } from "../SunnahRawatibDayRing";

export type SunnahRawatibDayProgress = {
  day: string;
  data: SunnahDayData;
  /** YYYY-MM-DD from frame */
  date?: string;
  isToday?: boolean;
  isFuture?: boolean;
  /** Day total from frame when per-slot logs are absent */
  count?: number;
};

export type SunnahRawatibWeeklyProgressDashboardProps = {
  weekDays: SunnahRawatibDayProgress[];
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
  loading?: boolean;
};

const CARD_HORIZONTAL_PADDING = 16;
const WRAPPER_WIDTH_RATIO = 0.92;
const RING_SIZE_MAX = 34;

export function SunnahRawatibWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  totalPrayersThisWeek = 55,
  streakDays = 2,
  motivationalQuote = "May Allah accept your prayer, elevate your rank, and fill your day with endless blessings!",
  selectedDayIndex = 6,
  statsIcon = "rug",
  onDayPress,
  onPrevWeek,
  onNextWeek,
  loading = false,
}: SunnahRawatibWeeklyProgressDashboardProps) {
  const { width: screenWidth } = useWindowDimensions();

  const availableWidth = screenWidth * WRAPPER_WIDTH_RATIO - CARD_HORIZONTAL_PADDING;
  const ringSize = Math.min(RING_SIZE_MAX, Math.floor((availableWidth / 7) * 0.62));

  const [activeDayIndex, setActiveDayIndex] = useState(selectedDayIndex);

  useEffect(() => {
    setActiveDayIndex(selectedDayIndex);
  }, [selectedDayIndex]);

  const handleDayPress = (index: number, isFuture: boolean) => () => {
    if (loading || isFuture) return;
    setActiveDayIndex(index);
    onDayPress?.(index);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="calendar-month-outline" size={16} color={Colors.light.seagreen} />
          <Text style={styles.weekFractionText} numberOfLines={1}>
            {loading ? "---" : `${weekFraction} WEEKS`}
          </Text>
        </View>

        <View style={styles.headerNav}>
          <TouchableOpacity
            onPress={onPrevWeek}
            activeOpacity={0.7}
            style={styles.navBtn}
            disabled={!onPrevWeek || loading}
          >
            <Ionicons name="chevron-back" size={14} color={Colors.light.dullWhite} />
          </TouchableOpacity>
          <Text style={styles.weekRangeText} numberOfLines={1}>
            {loading ? "---" : weekRangeLabel}
          </Text>
          <TouchableOpacity
            onPress={onNextWeek}
            activeOpacity={0.7}
            style={styles.navBtn}
            disabled={!onNextWeek || loading}
          >
            <Ionicons name="chevron-forward" size={14} color={Colors.light.dullWhite} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.daysRow}>
        {weekDays.map((day, index) => {
          const isSelected = index === activeDayIndex;
          const isFuture = !!day.isFuture;

          let dayTotal = 0;
          if (typeof day.count === "number") {
            dayTotal = day.count;
          } else {
            Object.values(day.data.logged).forEach((v) => {
              if (typeof v === "number") dayTotal += v;
            });
          }

          return (
            <TouchableOpacity
              key={`${day.day}-${index}`}
              style={styles.dayColumn}
              onPress={handleDayPress(index, isFuture)}
              activeOpacity={loading || isFuture ? 1 : 0.75}
              disabled={loading || isFuture}
            >
              <View style={[styles.dayItemWrapper, isSelected && styles.dayItemSelected]}>
                <SunnahRawatibDayRing size={ringSize} data={day.data} isSelected={isSelected} />
                <Text style={styles.dayLabel} numberOfLines={1}>
                  {loading ? "---" : day.day}
                </Text>
                <Text style={styles.dayNumberLabel} numberOfLines={1}>
                  {loading ? "---" : dayTotal > 0 ? String(dayTotal) : ""}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.statsRow}>
        <MaterialCommunityIcons name={statsIcon} size={24} color={Colors.light.lightblue} />
        <Text style={styles.statsText} numberOfLines={1}>
          <Text style={styles.statsCount}>
            {loading ? "---" : totalPrayersThisWeek}
          </Text>
          {loading ? "" : " total Sunnah prayers this week"}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.streakBadge}>
          <Ionicons name="flash" size={13} color={Colors.light.yellow} />
          <Text style={styles.streakText}>
            {loading ? "---" : `${streakDays}-day streak`}
          </Text>
        </View>

        <View style={styles.quoteBlock}>
          <MaterialCommunityIcons name="target" size={14} color={Colors.light.seagreen} />
          <Text style={styles.quoteText}>
            {loading ? "---" : motivationalQuote}
          </Text>
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
    paddingHorizontal: 8,
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
    minHeight: 80,
  },
  dayItemSelected: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dayLabel: {
    color: Colors.light.subtext,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    marginTop: 4,
    textAlign: "center",
  },
  dayNumberLabel: {
    color: Colors.light.subtext,
    fontSize: 10,
    fontFamily: fonts.primary.regular,
    marginTop: 2,
    textAlign: "center",
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
    justifyContent: "flex-start",
    paddingHorizontal: 16,
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
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
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
