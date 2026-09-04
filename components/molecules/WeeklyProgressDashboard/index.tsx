import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Pressable,
} from "react-native";
import moment from "moment-hijri";
import { Colors } from "@/constants/theme";
import { PrayerStatus } from "@/components/molecules/PrayerProgressTrackerRing";
import { useTranslation } from "react-i18next";
import { BinIcon, PrayerMatIcon } from "@/assets/icons";
import { fonts } from "@/assets/fonts";
import { WeeklyProgressStatsFooterSection } from "@/components/molecules/PrayerWeeklyProgressFooter/WeeklyProgressStatsFooterSection";
import { PrayerWeeklyProgressHeader } from "@/components/molecules/SinglePrayerWeeklyProgressDashboard/PrayerWeeklyProgressHeader";
import { useDeletePrayerLog } from "@/src/api/mutations/useDeletePrayerLog";
import { useOptionalPrayerGoalFrameContext } from "@/src/screens/private/goalprogressloggingscreen/prayerGoalFrameContext";
import { TopSpace } from "@/components/atoms/TopSpace";
import { PrayerWeeklyDashboardBody } from "@/components/molecules/PrayerWeeklyDashboardBody";

// Layout spacing matches SinglePrayerWeeklyProgressDashboard.
// Arc rings need a larger size than the solid 24px single-prayer circles.
const TOTAL_HORIZONTAL_PADDING = 24;
const FIVE_DAILY_RING_SCALE = 0.75;

function dayHasLoggedPrayer(statuses: PrayerStatus[]): boolean {
  return statuses.some(
    (status) => status !== "none" && status !== "menstruation",
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DayProgress {
  /** Short day label: Sun, Mon … Sat */
  day: string;
  /** YYYY-MM-DD — used for delete log */
  date?: string;
  /** Five prayer statuses for the day */
  statuses: PrayerStatus[];
  /** True when all 5 prayers are in menstruation cycle */
  isMenstruating?: boolean;
  isToday?: boolean;
  isFuture?: boolean;
}

function isFutureDayProgress(day: DayProgress): boolean {
  if (day.isToday) return false;
  if (day.isFuture) return true;
  if (!day.date) return false;
  const date = moment(day.date, "YYYY-MM-DD");
  return date.isValid() && date.isAfter(moment(), "day");
}

export interface WeeklyProgressDashboardProps {
  /** Data for each day of the currently-visible week (7 items) */
  weekDays?: DayProgress[];
  /** e.g. "Nov 29 — Dec 5" */
  weekRangeLabel?: string;
  /** e.g. "1/4" */
  weekFraction?: string;
  /** Total on-time prayers this week */
  onTimePrayersCount?: number;
  /** Streak count in days */
  streakDays?: number;
  /**
   * On-time prayer delta vs the previous week.
   * `null` / omitted on week 1 (no comparison slot). Present from week 2 onward.
   */
  vsLastWeek?: number | null;
  /** Motivational quote shown at the bottom */
  motivationalQuote?: string;
  /** Index (0-6) of the currently highlighted/selected day */
  selectedDayIndex?: number;
  /** Called when user taps a day */
  onDayPress?: (index: number) => void;
  /** Called when user navigates to prev week */
  onPrevWeek?: () => void;
  /** Called when user navigates to next week */
  onNextWeek?: () => void;
  /**
   * Render prop: receives day data + size so the parent can inject
   * <PrayerProgressTrackerRing /> without coupling this component to it.
   */
  renderRing: (day: DayProgress, size: number) => React.ReactNode;
  /** Show "---" placeholders until the prayer-goal frame API responds. */
  loading?: boolean;
}

// ─── Dummy data (used when no props are supplied) ─────────────────────────────

const DUMMY_WEEK: DayProgress[] = [
  {
    day: "Sun",
    statuses: ["onTime", "onTime", "congregation", "missed", "none"],
  },
  {
    day: "Mon",
    statuses: ["onTime", "congregation", "onTime", "onTime", "none"],
  },
  {
    day: "Tue",
    statuses: ["missed", "onTime", "onTime", "congregation", "missed"],
  },
  { day: "Wed", statuses: ["onTime", "onTime", "onTime", "onTime", "onTime"] },
  {
    day: "Thu",
    statuses: ["congregation", "onTime", "missed", "onTime", "none"],
  },
  {
    day: "Fri",
    statuses: ["onTime", "congregation", "congregation", "onTime", "onTime"],
  },
  { day: "Sat", statuses: ["none", "none", "none", "none", "none"] },
];

const DAY_TRANSLATION_KEYS: Record<string, string> = {
  Sun: "homeScreen.weeklyProgress_daySun",
  Mon: "homeScreen.weeklyProgress_dayMon",
  Tue: "homeScreen.weeklyProgress_dayTue",
  Wed: "homeScreen.weeklyProgress_dayWed",
  Thu: "homeScreen.weeklyProgress_dayThu",
  Fri: "homeScreen.weeklyProgress_dayFri",
  Sat: "homeScreen.weeklyProgress_daySat",
};

export const WeeklyProgressDashboard: React.FC<
  WeeklyProgressDashboardProps
> = ({
  weekDays = DUMMY_WEEK,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  onTimePrayersCount = 30,
  streakDays = 5,
  vsLastWeek = null,
  motivationalQuote = "",
  selectedDayIndex,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  renderRing,
  loading = false,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const { t } = useTranslation();
  const prayerFrame = useOptionalPrayerGoalFrameContext();
  const { mutate: deletePrayerLog, isPending: isDeletingLog } =
    useDeletePrayerLog();
  const [selectForDeletion, setSelectForDeletion] = useState("");
  const displayWeekDays = weekDays;

  const availableWidth = screenWidth - TOTAL_HORIZONTAL_PADDING;
  const ringSize = Math.floor((availableWidth / 7) * FIVE_DAILY_RING_SCALE);

  const todayIndex = new Date().getDay();
  const [internalSelected, setInternalSelected] = useState(todayIndex);

  return (
    <View style={styles.card}>
      <PrayerWeeklyProgressHeader
        weekFraction={weekFraction}
        weekRangeLabel={weekRangeLabel}
        loading={loading}
        onPrevWeek={onPrevWeek}
        onNextWeek={onNextWeek}
      />

      <PrayerWeeklyDashboardBody loading={loading}>
        {!loading ? (
        <>
      <View style={styles.daysRow}>
        {displayWeekDays.map((day, idx) => {
          const isSelected = day.isToday === true;
          const isFuture = isFutureDayProgress(day);
          const hasLog = dayHasLoggedPrayer(day.statuses);
          const isMarkedForDeletion =
            !!day.date && selectForDeletion === day.date;
          const ringDay: DayProgress = { ...day, isFuture };

          return (
            <TouchableOpacity
              key={`${day.day}-${idx}`}
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
                setInternalSelected(idx);
                onDayPress?.(idx);
              }}
              activeOpacity={loading || isFuture ? 1 : 0.75}
              disabled={loading || isFuture}
            >
              <View
                style={[
                  styles.dayItemWrapper,
                  isSelected && !isMarkedForDeletion && styles.dayItemSelected,
                  isFuture && styles.dayItemFutureBlur,
                ]}
              >
                <View
                  style={[
                    styles.ringWrapper,
                    { width: ringSize, height: ringSize },
                  ]}
                >
                  {renderRing(ringDay, ringSize)}
                </View>
                <TopSpace top={8} />
                <Text
                  style={[
                    styles.dayLabel,
                    {
                      color: isSelected
                        ? Colors.light.white
                        : Colors.light.subtext,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {t(
                    (DAY_TRANSLATION_KEYS[day.day] ??
                      "homeScreen.weeklyProgress_daySun") as any,
                  )}
                </Text>
                <View style={styles.durationSlot} />
              </View>
              {isMarkedForDeletion ? (
                <Pressable
                  style={styles.deleteButton}
                  disabled={
                    isDeletingLog ||
                    (!prayerFrame?.openDeletePrayerLogOptions &&
                      !prayerFrame?.frame?.prayerType)
                  }
                  onPress={() => {
                    if (!day.date) return;
                    if (prayerFrame?.openDeletePrayerLogOptions) {
                      prayerFrame.openDeletePrayerLogOptions(day.date);
                      setSelectForDeletion("");
                      return;
                    }
                    const prayerType = prayerFrame?.frame?.prayerType;
                    if (!prayerType || isDeletingLog) return;
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

      <WeeklyProgressStatsFooterSection
        vsLastWeek={vsLastWeek}
        statsRow={
          <View style={styles.statsRow}>
            <PrayerMatIcon />
            <Text style={styles.statsText} numberOfLines={1}>
              <Text style={styles.statsCount}>{onTimePrayersCount}</Text>
              {` ${t("homeScreen.weeklyProgress_onTimePrayers")}`}
            </Text>
          </View>
        }
        footerProps={{
          loading: false,
          streakDays,
          motivationalQuote,
          comparisonVariant: "onTime",
          streakVariant: "default",
        }}
      />
        </>
        ) : null}
      </PrayerWeeklyDashboardBody>
    </View>
  );
};


const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 8,
    paddingVertical: 16,
    gap: 24,
    width: "100%",
    alignSelf: "stretch",
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
  dayColumnMarkedForDeletion: {
    borderWidth: 1,
    borderColor: Colors.light.red,
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
  dayItemWrapper: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 4,
    paddingTop: 3,
    paddingBottom: 18,
    borderRadius: 8,
    width: "100%",
    overflow: "visible",
  },
  dayItemSelected: {
    backgroundColor: Colors.light.dayProgressCardBg,
    borderRadius: 6,
  },
  dayItemFutureBlur: {
    opacity: 0.45,
  },
  ringWrapper: {
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
    height: 18,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    marginTop: 4,
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
});
