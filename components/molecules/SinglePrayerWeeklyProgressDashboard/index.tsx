import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { BinIcon, PrayerMatIcon } from "@/assets/icons";
import { PrayerWeeklyProgressFooter } from "@/components/molecules/PrayerWeeklyProgressFooter";
import { useDeletePrayerLog } from "@/src/api/mutations/useDeletePrayerLog";
import { useOptionalPrayerGoalFrameContext } from "@/src/screens/private/goalprogressloggingscreen/prayerGoalFrameContext";
import { PrayerWeeklyProgressHeader } from "./PrayerWeeklyProgressHeader";
import { SinglePrayerDayRing } from "./SinglePrayerDayRing";
import {
  CARD_HORIZONTAL_PADDING,
  LOADING_WEEK,
  RING_SIZE_MAX,
  WRAPPER_WIDTH_RATIO,
  type SinglePrayerWeeklyProgressDashboardProps,
} from "./types";
import { TopSpace } from "@/components/atoms/TopSpace";

export type {
  SinglePrayerDayProgress,
  SinglePrayerWeeklyProgressDashboardProps,
} from "./types";

export function SinglePrayerWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "Nov 29 — Dec 5",
  weekFraction = "1/4",
  totalPrayersThisWeek = 0,
  streakDays = 0,
  vsLastWeek = null,
  motivationalQuote = "",
  defaultMotivationalQuote = "",
  selectedDayIndex = 6,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  loading = false,
  isGoalCompleted = false,
}: SinglePrayerWeeklyProgressDashboardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const prayerFrame = useOptionalPrayerGoalFrameContext();
  const { mutate: deletePrayerLog, isPending: isDeletingLog } =
    useDeletePrayerLog();
  const [selectForDeletion, setSelectForDeletion] = useState("");
  const displayWeekDays = loading ? LOADING_WEEK : weekDays;
  const [activeDayIndex, setActiveDayIndex] = useState(selectedDayIndex);

  useEffect(() => {
    setActiveDayIndex(selectedDayIndex);
  }, [selectedDayIndex]);

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
          const hasLog = day.prayersLogged > 0 || !!day.isLogged;
          const isFuture = !!day.isFuture;
          const isMenstruation = !!day.isMenstruation;
          // Past empty days stay filled grey; only remaining (future) days
          // become dim outlines once the goal is already completed.
          const showEmptyOutline =
            !loading &&
            isGoalCompleted &&
            !hasLog &&
            !isMenstruation &&
            isFuture;
          const isInactiveOutline = isFuture || showEmptyOutline;
          const isMarkedForDeletion =
            !!day.date && selectForDeletion === day.date;
          const isBestDayVisible =
            !!day.isBestDay && !isInactiveOutline && !loading;
          // Overflowing "BEST DAY!" cells need deletion chrome on the
          // inner wrapper; all other days keep it on the column.
          const showColumnDeletion = isMarkedForDeletion && !isBestDayVisible;
          const showWrapperDeletion = isMarkedForDeletion && isBestDayVisible;

          return (
            <TouchableOpacity
              key={`${day.day}-${index}`}
              style={[
                styles.dayColumn,
                (isBestDayVisible || isMarkedForDeletion) && { zIndex: 2 },
                showColumnDeletion && styles.dayColumnMarkedForDeletion,
              ]}
              onLongPress={() => {
                if (loading || isFuture || !day.date) return;

                if (day.prayersLogged > 0) {
                  setSelectForDeletion((prev) =>
                    prev === day.date ? "" : (day.date ?? ""),
                  );
                }
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
                  isBestDayVisible && styles.dayItemBestDay,
                  showWrapperDeletion && styles.deletingBestDay,
                ]}
              >
                <SinglePrayerDayRing
                  size={ringSize}
                  hasLog={hasLog}
                  isBestDay={!!day.isBestDay}
                  isSelected={isSelected}
                  isFuture={isFuture}
                  isMenstruation={isMenstruation}
                  showEmptyOutline={showEmptyOutline}
                />
                <TopSpace top={10} />
                <Text
                  style={[
                    isBestDayVisible ? styles.bestDayLabel : styles.dayLabel,
                    {
                      color: loading
                        ? Colors.light.subtext
                        : showEmptyOutline
                          ? "rgba(255, 255, 255, 0.12)"
                          : isFuture
                            ? "rgba(255, 255, 255, 0.45)"
                            : isBestDayVisible
                              ? Colors.light.green
                              : isSelected
                                ? Colors.light.white
                                : Colors.light.subtext,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {loading ? "---" : isBestDayVisible ? "BEST DAY!" : day.day}
                </Text>

                <View style={styles.durationSlot}>
                  <Text
                    style={[
                      {
                        color: loading
                          ? Colors.light.grey
                          : isInactiveOutline
                            ? "transparent"
                            : isBestDayVisible
                              ? Colors.light.green
                              : isSelected
                                ? Colors.light.white
                                : Colors.light.grey,
                      },
                      styles.durationText,
                    ]}
                    numberOfLines={1}
                  >
                    {loading
                      ? "---"
                      : isInactiveOutline
                        ? ""
                        : day.prayersLogged > 0
                          ? day.prayersLogged.toString()
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
          <Text style={styles.statsText} numberOfLines={1}>
            <Text style={styles.statsCount}>
              {loading ? "---" : totalPrayersThisWeek}
            </Text>
            {loading
              ? ""
              : totalPrayersThisWeek === 1
                ? " prayer this week"
                : " prayers this week"}
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
  dayItemBestDay: {
    width: "120%",
  },
  deletingBestDay: {
    borderWidth: 1,
    borderColor: Colors.light.red,
    borderRadius: 6,
    backgroundColor: Colors.light.dullRed,
    zIndex: 99999,
    width: "125%",
  },
  bestDayLabel: {
    color: Colors.light.green,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    textAlign: "center",
    marginTop: 4,
    width: 64,
    marginHorizontal: -14,
  },
  dayLabel: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    marginTop: 3,
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
  // Week 1: pull stats + footer up slightly to tighten card height.
  statsAndFooterContainerWeekOne: {
    marginTop: 1,
    gap: 2,
  },
  // Weeks 2–4: extra row gaps; marginTop offsets so card height matches week 1.
  statsAndFooterContainerLaterWeek: {
    gap: 8,
    marginTop: -28,
  },
});
