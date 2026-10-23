import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { FlowCardFoodReliefIcon } from "@/assets/icons/FlowCardFoodReleifIcon";
import { FlowCardShirtIcon } from "@/assets/icons/FlowCardShirtIcon";
import {
  BinIcon,
  DashBoardCalenderIcon,
  DashBoardHandHeartIcon,
  FlashIcon,
  ShootIcon,
} from "@/assets/icons";
import { PrayerWeeklyDashboardBody } from "@/components/molecules/PrayerWeeklyDashboardBody";
import { useDeleteSadaqahLog } from "@/src/api/mutations/useDeleteSadaqahLog";

/**
 * Kaffarah category type:
 * - "clothes"  → feeding/clothing the poor (t-shirt icon)
 * - "meals"    → meals given (bowl icon)
 * - null       → no activity logged
 */
export type KaffarahCategory = "clothes" | "meals" | null;

export type KaffarahDayProgress = {
  day: string;
  /** YYYY-MM-DD — required for delete API. */
  date?: string;
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
  canDelete?: boolean;
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
  /** Frame / week-fetch loading — match Missed Zakat placeholders. */
  loading?: boolean;
  /** Bump parent refresh after a successful delete. */
  onDeleted?: () => void;
  allowLogDeletion?: boolean;
  sadaqahType?: string;
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
          {day.category === "clothes" ? (
            <FlowCardShirtIcon size={size * 0.75} color={iconColor} />
          ) : (
            <FlowCardFoodReliefIcon size={size * 0.70} color={iconColor} />
          )}
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
  loading = false,
  onDeleted,
  allowLogDeletion = true,
  sadaqahType = "KAFFARAH",
}: KaffarahWeeklyProgressDashboardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const { mutate: deleteSadaqahLog, isPending: isDeletingLog } =
    useDeleteSadaqahLog();

  const availableWidth =
    screenWidth * WRAPPER_WIDTH_RATIO - CARD_HORIZONTAL_PADDING;
  const ringSize = Math.min(
    RING_SIZE_MAX,
    Math.floor((availableWidth / 7) * 0.62),
  );

  const [activeDayIndex, setActiveDayIndex] = useState(selectedDayIndex);
  const [selectForDeletion, setSelectForDeletion] = useState("");

  useEffect(() => {
    setActiveDayIndex(selectedDayIndex);
    setSelectForDeletion("");
  }, [selectedDayIndex, weekRangeLabel, weekFraction]);

  const handleDeleteLog = useCallback(
    (logDate: string) => {
      deleteSadaqahLog(
        { sadaqahType, logDate },
        {
          onSuccess: () => {
            setSelectForDeletion("");
            onDeleted?.();
          },
        },
      );
    },
    [deleteSadaqahLog, onDeleted, sadaqahType],
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <DashBoardCalenderIcon size={20} color={Colors.light.subtext} />
          <Text style={styles.weekFractionText} numberOfLines={1}>
            {loading ? "---" : `${weekFraction} WEEKS`}
          </Text>
        </View>

        <View style={styles.headerNav}>
          <TouchableOpacity
            onPress={onPrevWeek}
            activeOpacity={onPrevWeek && !loading ? 0.7 : 1}
            style={styles.navBtn}
            disabled={loading || !onPrevWeek}
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
            activeOpacity={onNextWeek && !loading ? 0.7 : 1}
            style={styles.navBtn}
            disabled={loading || !onNextWeek}
          >
            <Ionicons
              name="chevron-forward"
              size={14}
              color={Colors.light.dullWhite}
            />
          </TouchableOpacity>
        </View>
      </View>

      <PrayerWeeklyDashboardBody loading={loading}>
        <View style={styles.daysRow}>
          {weekDays.map((day, index) => {
            const isSelected = index === activeDayIndex;
            const hasLog = day.count > 0 && day.category !== null;
            const isMarkedForDeletion =
              !!day.date && selectForDeletion === day.date;

            return (
              <TouchableOpacity
                key={`${day.day}-${day.date ?? index}`}
                style={[
                  styles.dayColumn,
                  isMarkedForDeletion && styles.dayColumnMarkedForDeletion,
                ]}
                onLongPress={() => {
                  if (!allowLogDeletion || loading || day.isFuture || !day.date)
                    return;
                  if (day.canDelete === false) return;
                  if (!hasLog) return;
                  setSelectForDeletion((prev) =>
                    prev === day.date ? "" : (day.date ?? ""),
                  );
                }}
                onPress={() => {
                  if (loading || day.isFuture) return;
                  if (selectForDeletion) {
                    setSelectForDeletion("");
                    return;
                  }
                  setActiveDayIndex(index);
                  onDayPress?.(index);
                }}
                activeOpacity={loading || day.isFuture ? 1 : 0.75}
                disabled={loading || day.isFuture}
              >
                <View
                  style={[
                    styles.dayItemWrapper,
                    isSelected &&
                      !isMarkedForDeletion &&
                      styles.dayItemSelected,
                    isMarkedForDeletion && styles.deletingDay,
                  ]}
                >
                  <KaffarahDayRing
                    size={ringSize}
                    day={day}
                    isSelected={isSelected && !isMarkedForDeletion}
                  />

                  <Text
                    style={[
                      day.isBestDay ? styles.bestDayLabel : styles.dayLabel,
                    ]}
                    numberOfLines={1}
                  >
                    {loading ? "---" : day.isBestDay ? "BEST DAY!" : day.day}
                  </Text>

                  <View style={styles.durationSlot}>
                    <Text
                      style={[
                        day.isBestDay
                          ? styles.durationTextBest
                          : styles.durationTextNormal,
                        styles.durationText,
                      ]}
                      numberOfLines={1}
                    >
                      {loading ? "" : hasLog ? `${day.count}` : ""}
                    </Text>
                  </View>

                  {isMarkedForDeletion ? (
                    <Pressable
                      style={styles.deleteButton}
                      disabled={isDeletingLog}
                      onPress={() => {
                        if (!day.date || isDeletingLog) return;
                        handleDeleteLog(day.date);
                      }}
                    >
                      <BinIcon />
                    </Pressable>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.statsRow}>
          <DashBoardHandHeartIcon size={24} color={Colors.light.lightblue} />
          <Text style={styles.statsText} numberOfLines={1}>
            {loading ? (
              "---"
            ) : (
              <>
                <Text style={styles.statsCount}>{totalThisWeek}</Text>
                {" total meals/clothes this week"}
              </>
            )}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.streakBadge}>
            <FlashIcon size={13} color={Colors.light.yellow} />
            <Text style={styles.streakText}>
              {loading ? "---" : `${streakDays}-day streak`}
            </Text>
          </View>

          <View style={styles.quoteBlock}>
            <ShootIcon size={14} Color={Colors.light.seagreen} />
            <Text style={styles.quoteText}>
              {loading ? "---" : motivationalQuote}
            </Text>
          </View>
        </View>
      </PrayerWeeklyDashboardBody>
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
    width: "100%",
  },
  dayColumn: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
  },
  dayColumnMarkedForDeletion: {
    zIndex: 99999,
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
  deletingDay: {
    borderColor: Colors.light.red,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: Colors.light.dullRed,
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
    gap: 1,
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
