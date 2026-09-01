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
import {
  BinIcon,
  PrayerMatIcon,
  QiyamAfterIshaIcon,
  QiyamFemaleBothIshaAndTahajudIcon,
  QiyamFemaleUserIcon,
  QiyamMaleBothIshaAndTahajudIcon,
  QiyamMaleUserIcon,
} from "@/assets/icons";
import { TopSpace } from "@/components/atoms/TopSpace";
import { PrayerWeeklyProgressFooter } from "@/components/molecules/PrayerWeeklyProgressFooter";
import { PrayerWeeklyProgressHeader } from "@/components/molecules/SinglePrayerWeeklyProgressDashboard/PrayerWeeklyProgressHeader";
import {
  CARD_HORIZONTAL_PADDING,
  RING_SIZE_MAX,
  WRAPPER_WIDTH_RATIO,
} from "@/components/molecules/SinglePrayerWeeklyProgressDashboard/types";
import { useDeletePrayerLog } from "@/src/api/mutations/useDeletePrayerLog";
import { useOptionalPrayerGoalFrameContext } from "@/src/screens/private/goalprogressloggingscreen/prayerGoalFrameContext";

export type QiyamDayProgress = {
  day: string;
  isLogged?: boolean;
  prayersLogged: number;
  isBestDay?: boolean;
  isMenstruation?: boolean;
  isFuture?: boolean;
  isToday?: boolean;
  date?: string;
  isMissedStrict?: boolean;
  isMissedFlexible?: boolean;
  loggedTime?: "after-isha" | "before-fajr" | "both";
  gender?: "male" | "female";
  isWitrPending?: boolean;
};

export type QiyamWeeklyProgressDashboardProps = {
  weekDays: QiyamDayProgress[];
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
  isGoalCompleted?: boolean;
};

const LOADING_WEEK: QiyamDayProgress[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
].map((day) => ({
  day,
  prayersLogged: 0,
  isLogged: false,
}));

const BEST_DAY_SIZE_BOOST = 4;

function resolveHasLog(day: QiyamDayProgress): boolean {
  return day.prayersLogged > 0 || Boolean(day.isLogged) || Boolean(day.loggedTime);
}

type DayIconProps = {
  day: QiyamDayProgress;
  size: number;
  isBestDayVisible: boolean;
  isGoalCompleted: boolean;
};

function QiyamDayIcon({
  day,
  size,
  isBestDayVisible,
  isGoalCompleted,
}: DayIconProps) {
  const isBlurredFuture = Boolean(day.isFuture && isGoalCompleted);
  const circleSize = isBestDayVisible ? size + BEST_DAY_SIZE_BOOST : size;
  const iconSize = Math.max(11, Math.round(circleSize * 0.58));
  const hasLog = resolveHasLog(day);

  const innerSizeStyle = {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  };

  let ringStyle = styles.ringEmpty;

  if (day.isMenstruation) {
    ringStyle = styles.ringMenstruation;
  } else if (isBlurredFuture) {
    ringStyle = styles.ringBlurred;
  } else if (day.isFuture) {
    ringStyle = styles.ringFuture;
  } else if (day.isMissedStrict) {
    ringStyle = styles.ringMissedStrict;
  } else if (day.isMissedFlexible) {
    ringStyle = styles.ringMissedFlexible;
  } else if (hasLog || day.loggedTime) {
    ringStyle = day.isWitrPending ? styles.ringWitrPending : styles.ringLogged;
  }

  return (
    <View
      style={[
        styles.ringOuter,
        {
          width: size + BEST_DAY_SIZE_BOOST + 5,
          height: size + BEST_DAY_SIZE_BOOST + 5,
          borderRadius: 8,
        },
        isBlurredFuture && styles.blurredDayIconWrap,
      ]}
    >
      <View style={[innerSizeStyle, ringStyle]}>
        {hasLog &&
        !day.isMenstruation &&
        !day.isFuture &&
        !day.isMissedStrict &&
        !day.isMissedFlexible
          ? renderLoggedIcon(day, iconSize, isBestDayVisible)
          : null}
      </View>
    </View>
  );
}

/** Figma: both (non–best day) → white; today + normal log → white; past / best day → gold. */
function resolveQiyamLoggedIconColor(
  day: QiyamDayProgress,
  isBestDayVisible: boolean,
): string {
  const timing = day.loggedTime ?? "after-isha";
  const isAfterIshaOnly = timing === "after-isha";

  // Figma case 1: After Isha today, Witr pending.
  const isAfterIshaWitrPendingToday =
    Boolean(day.isWitrPending) && Boolean(day.isToday) && isAfterIshaOnly;

  // Figma case 2: After Isha on a past day (before today), Witr pending.
  const isAfterIshaWitrPendingPast =
    Boolean(day.isWitrPending) &&
    !day.isToday &&
    !day.isFuture &&
    isAfterIshaOnly;

  if (
    !isBestDayVisible &&
    (isAfterIshaWitrPendingToday || isAfterIshaWitrPendingPast)
  ) {
    return Colors.light.white;
  }

  // Figma: After Isha on a past day, Witr logged — white icon in green ring.
  const isAfterIshaPastWitrLogged =
    isAfterIshaOnly &&
    !day.isToday &&
    !day.isFuture &&
    !day.isWitrPending;

  if (!isBestDayVisible && isAfterIshaPastWitrLogged) {
    return Colors.light.white;
  }

  // Figma: female user, before Fajr (Tahajjud), past day — white icon in green ring.
  const isFemaleBeforeFajrPast =
    day.gender === "female" &&
    timing === "before-fajr" &&
    !day.isToday &&
    !day.isFuture;

  if (!isBestDayVisible && isFemaleBeforeFajrPast) {
    return Colors.light.white;
  }

  if (timing === "both") {
    return isBestDayVisible
      ? Colors.light.qiyamIconGold
      : Colors.light.white;
  }

  if (isBestDayVisible || !day.isToday) {
    return Colors.light.qiyamIconGold;
  }

  return Colors.light.white;
}

function renderLoggedIcon(
  day: QiyamDayProgress,
  iconSize: number,
  isBestDayVisible: boolean,
) {
  const isFemale = day.gender === "female";
  const timing = day.loggedTime ?? "after-isha";
  const iconColor = resolveQiyamLoggedIconColor(day, isBestDayVisible);

  if (timing === "both") {
    return isFemale ? (
      <QiyamFemaleBothIshaAndTahajudIcon size={iconSize} color={iconColor} />
    ) : (
      <QiyamMaleBothIshaAndTahajudIcon size={iconSize} color={iconColor} />
    );
  }

  if (timing === "before-fajr") {
    return isFemale ? (
      <QiyamFemaleUserIcon size={iconSize} color={iconColor} />
    ) : (
      <QiyamMaleUserIcon size={iconSize} color={iconColor} />
    );
  }

  return <QiyamAfterIshaIcon size={iconSize} color={iconColor} />;
}

function getDayLabelColor(options: {
  loading: boolean;
  isBlurredFuture: boolean;
  isFuture: boolean;
  isBestDayVisible: boolean;
  isToday: boolean;
  isMenstruation: boolean;
}): string {
  if (options.loading) return Colors.light.subtext;
  if (options.isBlurredFuture) return "rgba(255, 255, 255, 0.22)";
  if (options.isFuture) return "rgba(255, 255, 255, 0.45)";
  if (options.isBestDayVisible) return Colors.light.green;
  if (options.isToday) return Colors.light.white;
  if (options.isMenstruation) return Colors.light.subtext;
  return Colors.light.subtext;
}

function getCountLabelColor(options: {
  loading: boolean;
  hideCount: boolean;
  isBestDayVisible: boolean;
  isToday: boolean;
}): string {
  if (options.loading) return Colors.light.grey;
  if (options.hideCount) return "transparent";
  if (options.isBestDayVisible) return Colors.light.green;
  if (options.isToday) return Colors.light.white;
  return Colors.light.grey;
}

export function QiyamWeeklyProgressDashboard({
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
  isGoalCompleted = false,
}: QiyamWeeklyProgressDashboardProps) {
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
          const isToday = day?.isToday === true;
          const hasLog = resolveHasLog(day);
          const isFuture = !!day.isFuture;
          const isBlurredFuture = isGoalCompleted && isFuture;
          const isMenstruation = !!day.isMenstruation;
          const showEmptyOutline =
            !loading &&
            isGoalCompleted &&
            !hasLog &&
            !isMenstruation &&
            isFuture;
          const isInactiveOutline =
            isFuture ||
            !!day.isMissedStrict ||
            !!day.isMissedFlexible ||
            showEmptyOutline;
          const isBestDayVisible =
            !!day.isBestDay && !isInactiveOutline && !loading && !isMenstruation;
          const isMarkedForDeletion =
            !!day.date && selectForDeletion === day.date;
          const showColumnDeletion = isMarkedForDeletion && !isBestDayVisible;
          const showWrapperDeletion = isMarkedForDeletion && isBestDayVisible;
          const hideCount = isInactiveOutline || isMenstruation;
          const labelColor = getDayLabelColor({
            loading,
            isBlurredFuture,
            isFuture,
            isBestDayVisible,
            isToday,
            isMenstruation,
          });
          const countColor = getCountLabelColor({
            loading,
            hideCount,
            isBestDayVisible,
            isToday,
          });

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
                if (hasLog) {
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
                onDayPress?.(index);
              }}
              activeOpacity={loading || isFuture ? 1 : 0.75}
              disabled={loading || isFuture}
            >
              <View
                style={[
                  styles.dayItemWrapper,
                  isToday && !isMarkedForDeletion && styles.dayItemSelected,
                  isBestDayVisible && styles.dayItemBestDay,
                  showWrapperDeletion && styles.deletingBestDay,
                ]}
              >
                <QiyamDayIcon
                  day={day}
                  size={ringSize}
                  isBestDayVisible={isBestDayVisible}
                  isGoalCompleted={isGoalCompleted}
                />
                <TopSpace top={10} />
                <Text
                  style={[
                    isBestDayVisible ? styles.bestDayLabel : styles.dayLabel,
                    { color: labelColor },
                  ]}
                  numberOfLines={1}
                >
                  {loading ? "---" : isBestDayVisible ? "BEST DAY!" : day.day}
                </Text>

                <View style={styles.durationSlot}>
                  <Text
                    style={[styles.durationText, { color: countColor }]}
                    numberOfLines={1}
                  >
                    {loading
                      ? "---"
                      : hideCount
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
  ringOuter: {
    alignItems: "center",
    justifyContent: "center",
    borderColor: "transparent",
  },
  ringMenstruation: {
    backgroundColor: Colors.light.red,
  },
  ringFuture: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.32)",
  },
  ringBlurred: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  ringMissedStrict: {
    backgroundColor: Colors.light.yellow,
  },
  ringMissedFlexible: {
    backgroundColor: Colors.light.selectcategory,
  },
  ringLogged: {
    backgroundColor: Colors.light.green,
  },
  ringWitrPending: {
    backgroundColor: Colors.light.green,
    borderWidth: 2,
    borderColor: Colors.light.yellow,
  },
  ringEmpty: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  blurredDayIconWrap: {
    opacity: 0.28,
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
  statsAndFooterContainerWeekOne: {
    marginTop: 1,
    gap: 2,
  },
  statsAndFooterContainerLaterWeek: {
    gap: 8,
    marginTop: -28,
  },
});
