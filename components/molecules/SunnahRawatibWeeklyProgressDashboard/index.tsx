import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { BinIcon } from "@/assets/icons";
import { SunnahRawatibDayRing, type SunnahDayData } from "../SunnahRawatibDayRing";
import { useDeletePrayerLog } from "@/src/api/mutations/useDeletePrayerLog";
import { useOptionalPrayerGoalFrameContext } from "@/src/screens/private/goalprogressloggingscreen/prayerGoalFrameContext";

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

function dayHasSunnahLog(day: SunnahRawatibDayProgress): boolean {
  if ((day.count ?? 0) > 0) return true;
  return Object.values(day.data.logged).some(
    (v) => typeof v === "number" && v > 0,
  );
}

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
  const prayerFrame = useOptionalPrayerGoalFrameContext();
  const { mutate: deletePrayerLog, isPending: isDeletingLog } =
    useDeletePrayerLog();
  const [selectForDeletion, setSelectForDeletion] = useState("");

  const availableWidth =
    screenWidth * WRAPPER_WIDTH_RATIO - CARD_HORIZONTAL_PADDING;
  const ringSize = Math.min(
    RING_SIZE_MAX,
    Math.floor((availableWidth / 7) * 0.62),
  );

  const [activeDayIndex, setActiveDayIndex] = useState(selectedDayIndex);

  useEffect(() => {
    setActiveDayIndex(selectedDayIndex);
  }, [selectedDayIndex]);

  useEffect(() => {
    setSelectForDeletion("");
  }, [weekDays]);

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
            <Ionicons
              name="chevron-back"
              size={14}
              color={Colors.light.dullWhite}
            />
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
          const isFuture = !!day.isFuture;
          const hasLog = dayHasSunnahLog(day);
          const isMarkedForDeletion =
            !!day.date && selectForDeletion === day.date;

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
              style={[
                styles.dayColumn,
                isMarkedForDeletion ? { zIndex: 2 } : null,
                isMarkedForDeletion && styles.dayColumnMarkedForDeletion,
              ]}
              onLongPress={() => {
                if (loading || isFuture || !day.date || !hasLog) return;
                setSelectForDeletion((prev) =>
                  prev === day.date ? "" : (day.date ?? ""),
                );
              }}
              onPress={() => {
                if (loading || isFuture) return;
                if (selectForDeletion) {
                  setSelectForDeletion("");
                  return;
                }
                setActiveDayIndex(index);
                onDayPress?.(index);
              }}
              activeOpacity={loading || isFuture ? 1 : 0.75}
              disabled={loading || isFuture}
            >
              <View
                style={[
                  styles.dayItemWrapper,
                  isSelected && !isMarkedForDeletion && styles.dayItemSelected,
                ]}
              >
                <SunnahRawatibDayRing
                  size={ringSize}
                  data={day.data}
                  isSelected={isSelected}
                />
                <Text style={styles.dayLabel} numberOfLines={1}>
                  {loading ? "---" : day.day}
                </Text>
                <Text style={styles.dayNumberLabel} numberOfLines={1}>
                  {loading ? "---" : dayTotal > 0 ? String(dayTotal) : ""}
                </Text>
              </View>
              {isMarkedForDeletion ? (
                <Pressable
                  style={styles.deleteButton}
                  disabled={isDeletingLog || !prayerFrame?.frame?.prayerType}
                  onPress={() => {
                    const prayerType = prayerFrame?.frame?.prayerType;
                    if (!prayerType || !day.date || isDeletingLog) return;
                    deletePrayerLog(
                      { prayerType, date: day.date },
                      {
                        onSuccess: () => {
                          setSelectForDeletion("");
                        },
                      },
                    );
                  }}
                >
                  <BinIcon />
                </Pressable>
              ) : null}
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
          <MaterialCommunityIcons
            name="target"
            size={14}
            color={Colors.light.seagreen}
          />
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
    zIndex: 150,
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
    overflow: "visible",
  },
  dayColumn: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
    overflow: "visible",
  },
  dayColumnMarkedForDeletion: {
    borderWidth: 1,
    borderColor: Colors.light.red,
    borderRadius: 6,
    backgroundColor: Colors.light.dullRed,
    zIndex: 99999,
  },
  deleteButton: {
    height: 20,
    width: 24,
    backgroundColor: Colors.light.red,
    borderRadius: 5,
    zIndex: 1000,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: -10,
  },
  dayItemWrapper: {
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderRadius: 8,
    minHeight: 80,
    width: "100%",
    overflow: "visible",
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
