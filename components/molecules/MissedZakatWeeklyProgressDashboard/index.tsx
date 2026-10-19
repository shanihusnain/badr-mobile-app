import React, { useCallback, useState } from "react";
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
import { DashBoardCalenderIcon } from "@/assets/icons/DashBoardCalenderIcon";
import { DashBoardHandHeartIcon } from "@/assets/icons/DashBoardHandHeartIcon";
import { BinIcon, FlashIcon, ShootIcon } from "@/assets/icons";
import { StarSparkleIcon } from "@/assets/icons/StarSparkleIcon";
import { PrayerWeeklyDashboardBody } from "@/components/molecules/PrayerWeeklyDashboardBody";
import { useDeleteSadaqahLog } from "@/src/api/mutations/useDeleteSadaqahLog";

export type MissedZakatDayProgress = {
  day: string;
  date?: string;
  isLogged?: boolean;
  amountLogged: number;
  isBestDay?: boolean;
  isFuture?: boolean;
  isBlurDay?: boolean;
  canDelete?: boolean;
};

export type MissedZakatWeeklyProgressDashboardProps = {
  weekDays: MissedZakatDayProgress[];
  weekRangeLabel?: string;
  weekFraction?: string;
  totalSpentThisWeek?: number;
  streakDays?: number;
  remainingAmount?: number;
  selectedDayIndex?: number;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  loading?: boolean;
  /** Bump parent refresh after a successful delete. */
  onDeleted?: () => void;
  allowLogDeletion?: boolean;
  sadaqahType?: string;
};

const CARD_HORIZONTAL_PADDING = 16;
const WRAPPER_WIDTH_RATIO = 0.92;
const RING_SIZE_MAX = 34;

type DayRingProps = {
  size: number;
  day: MissedZakatDayProgress;
  isSelected: boolean;
};

function MissedZakatDayRing({ size, day, isSelected }: DayRingProps) {
  const hasLog = day.amountLogged > 0 || !!day.isLogged;

  const innerSizeStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const renderInner = () => {
    if (day.isFuture) {
      return (
        <View style={[innerSizeStyle, styles.ringInner, styles.ringInnerEmpty]} />
      );
    }
    if (hasLog) {
      return (
        <View
          style={[innerSizeStyle, styles.ringInner, styles.ringInnerLogged]}
        >
          {day.isBestDay && (
            <View style={styles.starAdjust}>
              <StarSparkleIcon
                size={Math.round(size * 1.2)}
                color={Colors.light.yellow}
              />
            </View>
          )}
        </View>
      );
    }
    return (
      <View
        style={[innerSizeStyle, styles.ringInner, styles.ringInnerEmptyFilled]}
      />
    );
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

export function MissedZakatWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  totalSpentThisWeek = 30,
  streakDays = 0,
  remainingAmount = 70,
  selectedDayIndex = 3,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  loading = false,
  onDeleted,
  allowLogDeletion = true,
  sadaqahType = "MISSED_ZAKAT",
}: MissedZakatWeeklyProgressDashboardProps) {
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
          <DashBoardCalenderIcon size={19} color={Colors.light.subtext} />
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
            const hasLog = day.amountLogged > 0 || !!day.isLogged;
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
                  <MissedZakatDayRing
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
                    {day.isBestDay ? "BEST DAY!" : day.day}
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
                      {hasLog ? `$${day.amountLogged}` : ""}
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
            <Text style={styles.statsCount}>${totalSpentThisWeek}</Text>
            {" spent in total this week"}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.streakBadge}>
            <FlashIcon size={13} color={Colors.light.yellow} />
            <Text style={styles.streakText}>{streakDays}-day streak</Text>
          </View>

          <View style={styles.quoteBlock}>
            <ShootIcon size={14} Color={Colors.light.seagreen} />
            <Text style={styles.quoteText}>
              Zakat is the right of the poor and the command of Allah—
              <Text style={{ fontFamily: fonts.primary.bold }}>
                ${remainingAmount}
              </Text>{" "}
              remaining!
            </Text>
          </View>
        </View>
      </PrayerWeeklyDashboardBody>
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
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 12,
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
  ringInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringInnerLogged: {
    backgroundColor: Colors.light.green,
  },
  ringInnerEmpty: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "transparent",
  },
  ringInnerEmptyFilled: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  ringOuterBlur: {
    opacity: 0.3,
  },
  starAdjust: {
    transform: [{ translateY: 4 }],
    alignItems: "center",
    justifyContent: "center",
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
    gap: 1,
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
