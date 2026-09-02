import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { BinIcon, PrayerMatIcon } from "@/assets/icons";
import { TopSpace } from "@/components/atoms/TopSpace";
import { PrayerWeeklyProgressFooter } from "@/components/molecules/PrayerWeeklyProgressFooter";
import { PrayerWeeklyProgressHeader } from "@/components/molecules/SinglePrayerWeeklyProgressDashboard/PrayerWeeklyProgressHeader";
import {
  SunnahRawatibDayRing,
  type SunnahDayData,
} from "../SunnahRawatibDayRing";
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
  vsLastWeek?: number | null;
  motivationalQuote?: string;
  defaultMotivationalQuote?: string;
  selectedDayIndex?: number;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  loading?: boolean;
};

const CARD_HORIZONTAL_PADDING = 16;
const WRAPPER_WIDTH_RATIO = 0.92;
const RING_SIZE_MAX = 25;

const LOADING_WEEK: SunnahRawatibDayProgress[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
].map((day) => ({
  day,
  count: 0,
  data: { goal: [], logged: {} },
}));

function dayHasSunnahLog(day: SunnahRawatibDayProgress): boolean {
  if ((day.count ?? 0) > 0) return true;
  return Object.values(day.data.logged).some(
    (v) => typeof v === "number" && v > 0,
  );
}

function getDayTotal(day: SunnahRawatibDayProgress): number {
  if (typeof day.count === "number") return day.count;
  let total = 0;
  Object.values(day.data.logged).forEach((v) => {
    if (typeof v === "number") total += v;
  });
  return total;
}

export function SunnahRawatibWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  totalPrayersThisWeek = 0,
  streakDays = 0,
  vsLastWeek = null,
  motivationalQuote = "",
  defaultMotivationalQuote = "",
  onDayPress,
  onPrevWeek,
  onNextWeek,
  loading = false,
}: SunnahRawatibWeeklyProgressDashboardProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const prayerFrame = useOptionalPrayerGoalFrameContext();
  const { mutate: deletePrayerLog, isPending: isDeletingLog } =
    useDeletePrayerLog();
  const [selectForDeletion, setSelectForDeletion] = useState("");
  const displayWeekDays = loading ? LOADING_WEEK : weekDays;

  useEffect(() => {
    setSelectForDeletion("");
  }, [weekDays]);

  const availableWidth =
    screenWidth * WRAPPER_WIDTH_RATIO - CARD_HORIZONTAL_PADDING;
  const ringSize = Math.min(
    RING_SIZE_MAX,
    Math.floor((availableWidth / 7) * 0.62),
  );

  return (
    <View style={styles.card}>
      <PrayerWeeklyProgressHeader
        weekFraction={weekFraction}
        weekRangeLabel={weekRangeLabel}
        loading={loading}
        onPrevWeek={onPrevWeek}
        onNextWeek={onNextWeek}
      />

      <View style={styles.daysRow}>
        {displayWeekDays.map((day, index) => {
          const isSelected = day?.isToday === true;
          const isFuture = !!day.isFuture;
          const hasLog = !loading && dayHasSunnahLog(day);
          const isInactiveOutline = isFuture;
          const dayTotal = getDayTotal(day);
          const isMarkedForDeletion =
            !!day.date && selectForDeletion === day.date;

          return (
            <TouchableOpacity
              key={`${day.day}-${index}`}
              style={[
                styles.dayColumn,
                isMarkedForDeletion && { zIndex: 2 },
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
                <TopSpace top={4} />
                <Text
                  style={[
                    styles.dayLabel,
                    {
                      color: loading
                        ? Colors.light.subtext
                        : isFuture
                          ? "rgba(255, 255, 255, 0.45)"
                          : isSelected
                            ? Colors.light.white
                            : Colors.light.subtext,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {loading ? "---" : day.day}
                </Text>

                <View style={styles.durationSlot}>
                  <Text
                    style={[
                      styles.durationText,
                      {
                        color: loading
                          ? Colors.light.grey
                          : isInactiveOutline
                            ? "transparent"
                            : isSelected
                              ? Colors.light.white
                              : Colors.light.grey,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {loading
                      ? "---"
                      : isInactiveOutline
                        ? ""
                        : dayTotal > 0
                          ? String(dayTotal)
                          : ""}
                  </Text>
                </View>
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

      <View
        style={[
          styles.statsAndFooterContainer,
          vsLastWeek == null
            ? styles.statsAndFooterContainerWeekOne
            : styles.statsAndFooterContainerLaterWeek,
        ]}
      >
        <View style={styles.statsRow}>
          <PrayerMatIcon />
          <Text style={styles.statsText} numberOfLines={2}>
            <Text style={styles.statsCount}>
              {loading ? "---" : totalPrayersThisWeek}
            </Text>
            {loading
              ? ""
              : totalPrayersThisWeek === 1
                ? t("homeScreen.weeklyProgress_sunnahTotalThisWeek_one")
                : t("homeScreen.weeklyProgress_sunnahTotalThisWeek")}
          </Text>
        </View>

        <PrayerWeeklyProgressFooter
          loading={loading}
          streakDays={streakDays}
          vsLastWeek={vsLastWeek}
          motivationalQuote={motivationalQuote}
          defaultMotivationalQuote={defaultMotivationalQuote}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 8,
    paddingVertical: 16,
    gap: 24,
    zIndex: 150,
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
  dayLabel: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    marginTop: 0,
    textAlign: "center",
  },
  durationSlot: {
    height: 18,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    marginTop: 4,
  },
  durationText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexWrap: "nowrap",
    paddingLeft: 7,
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
    fontWeight: "600",
    fontSize: 20,
    fontFamily: fonts.primary.bold,
    letterSpacing: 0.1,
  },
  statsAndFooterContainer: {
    gap: 3,
  },
  statsAndFooterContainerWeekOne: {
    marginTop: 1,
    gap: 2,
  },
  statsAndFooterContainerLaterWeek: {
    gap: 8,
    marginTop: -28,
  },
});
