import React, { useCallback, useState } from "react";
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
import { BinIcon, QuranBlueIcon } from "@/assets/icons";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { WeeklyProgressStatsFooterSection } from "@/components/molecules/PrayerWeeklyProgressFooter/WeeklyProgressStatsFooterSection";
import { PrayerWeeklyProgressHeader } from "@/components/molecules/SinglePrayerWeeklyProgressDashboard/PrayerWeeklyProgressHeader";
import { SinglePrayerDayRing } from "@/components/molecules/SinglePrayerWeeklyProgressDashboard/SinglePrayerDayRing";
import { PrayerWeeklyDashboardBody } from "@/components/molecules/PrayerWeeklyDashboardBody";
import { TopSpace } from "@/components/atoms/TopSpace";
import { useDeleteQuranHoursLog } from "@/src/api/mutations/useDeleteQuranHoursLog";
import type { MemorisationDayProgress } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationWeeklyData";

export type QuranMemorisationWeeklyProgressDashboardProps = {
  weekDays: MemorisationDayProgress[];
  weekRangeLabel?: string;
  weekFraction?: string;
  surahName?: string;
  totalAyahsThisWeek?: number;
  memorizedAyahs?: number;
  totalAyahs?: number;
  remainingAyahs?: number;
  progressPercent?: number;
  completed?: boolean;
  streakDays?: number;
  vsLastWeek?: number | null;
  motivationalQuote?: string;
  selectedDayIndex?: number;
  onDayPress?: (index: number) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  currentWeek?: number;
  totalWeeks?: number;
  loading?: boolean;
  /** Backend type e.g. MEMORIZATION_SURAH — enables long-press delete when set. */
  quranGoalType?: string | null;
};

const CARD_HORIZONTAL_PADDING = 16;
const WRAPPER_WIDTH_RATIO = 0.92;
const COUNT_SLOT_HEIGHT = 18;
const RING_SIZE_MAX = 34;

export function QuranMemorisationWeeklyProgressDashboard({
  weekDays,
  weekRangeLabel = "---",
  weekFraction,
  totalAyahsThisWeek = 0,
  completed = false,
  streakDays = 0,
  vsLastWeek = null,
  motivationalQuote = "",
  selectedDayIndex = 6,
  onDayPress,
  onPrevWeek,
  onNextWeek,
  currentWeek = 1,
  totalWeeks = 4,
  loading = false,
  quranGoalType = null,
}: QuranMemorisationWeeklyProgressDashboardProps) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const { width: screenWidth } = useWindowDimensions();
  const availableWidth =
    screenWidth * WRAPPER_WIDTH_RATIO - CARD_HORIZONTAL_PADDING;
  const ringSize = Math.min(
    RING_SIZE_MAX,
    Math.floor((availableWidth / 7) * 0.62),
  );

  const { mutateAsync: deleteQuranLog, isPending: isDeletingLog } =
    useDeleteQuranHoursLog();
  const allowLogDeletion = !!quranGoalType;
  const [selectForDeletion, setSelectForDeletion] = useState("");

  const handleDeleteLog = useCallback(
    async (date: string) => {
      if (!quranGoalType) return;
      await deleteQuranLog({ quranGoalType, date });
    },
    [deleteQuranLog, quranGoalType],
  );

  const resolvedWeekFraction =
    weekFraction?.replace(/\s+/g, "") || `${currentWeek}/${totalWeeks}`;

  const handleDayPress = (index: number) => () => {
    if (loading) return;
    if (selectForDeletion) {
      setSelectForDeletion("");
      return;
    }
    const day = weekDays[index];
    if (day?.isFuture) return;
    onDayPress?.(index);
  };

  return (
    <View style={styles.card}>
      <PrayerWeeklyProgressHeader
        weekFraction={resolvedWeekFraction}
        weekRangeLabel={weekRangeLabel}
        loading={loading}
        onPrevWeek={onPrevWeek}
        onNextWeek={onNextWeek}
      />

      <PrayerWeeklyDashboardBody loading={loading}>
        {!loading ? (
          <>
            <View style={styles.daysRow}>
              {weekDays.map((day, index) => {
                // Same as prayer goals: today is the highlighted “selected” day.
                const isSelected = day.isToday === true;
                const hasLog = day.ayahsLogged > 0 || !!day.isLogged;
                const isFuture = !!day.isFuture;
                const showEmptyOutline =
                  !loading && completed && !hasLog && isFuture;
                const isInactiveOutline = isFuture || showEmptyOutline;
                const isMarkedForDeletion =
                  allowLogDeletion &&
                  !!day.date &&
                  selectForDeletion === day.date;
                const showColumnDeletion =
                  isMarkedForDeletion && !day.isBestDay;
                const showWrapperDeletion =
                  isMarkedForDeletion && !!day.isBestDay;
                const isBestDayVisible =
                  !!day.isBestDay &&
                  !isInactiveOutline &&
                  !loading &&
                  !isMarkedForDeletion;

                const isNeighborBestDayVisible = (
                  neighbor: MemorisationDayProgress | undefined,
                ) =>
                  !!neighbor?.isBestDay &&
                  !loading &&
                  !neighbor.isFuture &&
                  selectForDeletion !== neighbor.date;

                const bestDayOnLeft = isNeighborBestDayVisible(
                  weekDays[index - 1],
                );
                const bestDayOnRight = isNeighborBestDayVisible(
                  weekDays[index + 1],
                );
                const shrinkTodayBesideBestDay =
                  isSelected &&
                  !isMarkedForDeletion &&
                  (bestDayOnLeft || bestDayOnRight);

                const countLabel =
                  day.countLabel?.trim() ||
                  (day.ayahsLogged > 0 ? formatNumber(day.ayahsLogged) : "");

                return (
                  <TouchableOpacity
                    key={`${day.day}-${day.date}`}
                    style={[
                      styles.dayColumn,
                      (isBestDayVisible || isMarkedForDeletion) && {
                        zIndex: 2,
                      },
                      showColumnDeletion && styles.dayColumnMarkedForDeletion,
                    ]}
                    onLongPress={() => {
                      if (!allowLogDeletion || loading || isFuture || !day.date)
                        return;
                      if (day.canDelete === false) return;
                      if (day.ayahsLogged > 0 || !!day.isLogged) {
                        setSelectForDeletion((prev) =>
                          prev === day.date ? "" : day.date,
                        );
                      }
                    }}
                    onPress={handleDayPress(index)}
                    activeOpacity={loading || isFuture ? 1 : 0.75}
                    disabled={loading || isFuture}
                  >
                    <View
                      style={[
                        styles.dayItemWrapper,
                        isSelected &&
                          !isMarkedForDeletion &&
                          styles.dayItemSelected,
                        shrinkTodayBesideBestDay &&
                          styles.dayItemSelectedBesideBestDay,
                        shrinkTodayBesideBestDay && {
                          alignSelf: bestDayOnLeft ? "flex-end" : "flex-start",
                        },
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
                        isMenstruation={false}
                        showEmptyOutline={showEmptyOutline}
                      />
                      <TopSpace top={10} />
                      <Text
                        style={[
                          isBestDayVisible
                            ? styles.bestDayLabel
                            : styles.dayLabel,
                          {
                            color: showEmptyOutline
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
                        adjustsFontSizeToFit
                        minimumFontScale={isBestDayVisible ? 0.8 : 0.9}
                      >
                        {isBestDayVisible
                          ? t("progressLogging.bestDay")
                          : day.day}
                      </Text>

                      <View style={styles.countSlot}>
                        <Text
                          style={[
                            styles.countText,
                            {
                              color: isInactiveOutline
                                ? "transparent"
                                : isBestDayVisible
                                  ? Colors.light.green
                                  : isSelected
                                    ? Colors.light.white
                                    : Colors.light.grey,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {isInactiveOutline ? "" : countLabel}
                        </Text>
                      </View>
                    </View>
                    {isMarkedForDeletion ? (
                      <Pressable
                        style={styles.deleteButton}
                        disabled={isDeletingLog}
                        onPress={() => {
                          if (!day.date || isDeletingLog) return;
                          void (async () => {
                            try {
                              await handleDeleteLog(day.date);
                              setSelectForDeletion("");
                            } catch {
                              // Mutation onError already shows toast.
                            }
                          })();
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
                <>
                  <View style={styles.statsRow}>
                    <QuranBlueIcon size={23} />
                    <Text style={styles.statsText} numberOfLines={1}>
                      <Text style={styles.statsCount}>
                        {loading ? "---" : formatNumber(totalAyahsThisWeek)}
                      </Text>
                      {loading
                        ? ""
                        : " " + t("progressLogging.totalAyahsThisWeek")}
                    </Text>
                  </View>

                  {completed ? (
                    <View style={styles.progressRow}>
                      <Text style={styles.completedText}>
                        {t("progressLogging.surahStatusCompleted")}
                      </Text>
                    </View>
                  ) : null}
                </>
              }
              footerProps={{
                loading: false,
                streakDays,
                motivationalQuote,
                streakVariant: "default",
              }}
            />
          </>
        ) : null}
      </PrayerWeeklyDashboardBody>
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
  dayItemSelectedBesideBestDay: {
    width: "84%",
  },
  dayItemBestDay: {
    width: "108%",
    borderWidth: 1,
    borderColor: "transparent",
  },
  deletingBestDay: {
    borderWidth: 1,
    borderColor: Colors.light.red,
    borderRadius: 6,
    backgroundColor: Colors.light.dullRed,
    zIndex: 99999,
    width: "108%",
  },
  dayLabel: {
    color: Colors.light.subtext,
    fontSize: 11,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    marginTop: 3,
    textAlign: "center",
  },
  bestDayLabel: {
    color: Colors.light.green,
    fontSize: 10.5,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    textAlign: "center",
    marginTop: 4,
    letterSpacing: -0.3,
    width: "100%",
  },
  countSlot: {
    height: COUNT_SLOT_HEIGHT,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    marginTop: 4,
  },
  countText: {
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
  progressRow: {
    alignItems: "center",
    marginTop: 4,
  },
  completedText: {
    color: Colors.light.green,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
  },
});
