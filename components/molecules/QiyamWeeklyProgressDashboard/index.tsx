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
  QiyamBestDayIcon,
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
const PAST_DAY_SIZE_REDUCTION = 3;
const PAST_DAY_ICON_OPACITY = 0.45;

type DayIconProps = {
  day: QiyamDayProgress;
  size: number;
  isBestDayVisible: boolean;
  isSelected: boolean;
  isDeleting: boolean;
};

function QiyamDayIcon({
  day,
  size,
  isBestDayVisible,
  isSelected,
  isDeleting,
}: DayIconProps) {
  const isPastDay = !day.isToday && !day.isFuture;
  const circleSize =
    (isBestDayVisible ? size + BEST_DAY_SIZE_BOOST : size) -
    (isPastDay ? PAST_DAY_SIZE_REDUCTION : 0);
  const iconSize = Math.max(10, Math.round(circleSize * 0.52));

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
  } else if (day.isFuture) {
    ringStyle = styles.ringFuture;
  } else if (day.isMissedStrict) {
    ringStyle = styles.ringMissedStrict;
  } else if (day.isMissedFlexible) {
    ringStyle = styles.ringMissedFlexible;
  } else if (day.isLogged || day.loggedTime) {
    ringStyle = day.isWitrPending
      ? styles.ringWitrPending
      : isSelected
        ? styles.ringLoggedSelected
        : styles.ringLogged;
  } else if (isSelected) {
    ringStyle = styles.ringSelectedEmpty;
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
        isPastDay && styles.pastDayIconWrap,
      ]}
    >
      <View style={[innerSizeStyle, ringStyle]}>
        {(day.isLogged || day.loggedTime) &&
        !day.isMenstruation &&
        !day.isFuture &&
        !day.isMissedStrict &&
        !day.isMissedFlexible
          ? renderLoggedIcon(day, iconSize, isDeleting)
          : null}
      </View>
    </View>
  );
}

function renderLoggedIcon(
  day: QiyamDayProgress,
  iconSize: number,
  isDeleting: boolean,
) {
  if (isDeleting) {
    return <QiyamAfterIshaIcon size={iconSize} />;
  }

  const isFemale = day.gender === "female";
  const timing = day.loggedTime;

  if (timing === "both") {
    return isFemale ? (
      <QiyamFemaleBothIshaAndTahajudIcon size={iconSize} />
    ) : (
      <QiyamMaleBothIshaAndTahajudIcon size={iconSize} />
    );
  }

  if (timing === "before-fajr") {
    return isFemale ? (
      <QiyamFemaleUserIcon size={iconSize} />
    ) : (
      <QiyamMaleUserIcon size={iconSize} />
    );
  }

  if (day.isBestDay) {
    return <QiyamBestDayIcon size={iconSize} />;
  }

  return <QiyamAfterIshaIcon size={iconSize} />;
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
          const isSelected = day?.isToday === true;
          const hasLog = day.prayersLogged > 0 || !!day.isLogged;
          const isFuture = !!day.isFuture;
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
                  isSelected && !isMarkedForDeletion && styles.dayItemSelected,
                  isBestDayVisible && styles.dayItemBestDay,
                  showWrapperDeletion && styles.deletingBestDay,
                ]}
              >
                <QiyamDayIcon
                  day={day}
                  size={ringSize}
                  isBestDayVisible={isBestDayVisible}
                  isSelected={isSelected}
                  isDeleting={isMarkedForDeletion}
                />
                <TopSpace top={10} />
                <Text
                  style={[
                    isBestDayVisible ? styles.bestDayLabel : styles.dayLabel,
                    {
                      color: loading
                        ? Colors.light.subtext
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
                          : isInactiveOutline || isMenstruation
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
                      : isInactiveOutline || isMenstruation
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
  ringMissedStrict: {
    backgroundColor: Colors.light.yellow,
  },
  ringMissedFlexible: {
    backgroundColor: Colors.light.selectcategory,
  },
  ringLogged: {
    backgroundColor: Colors.light.green,
  },
  ringLoggedSelected: {
    backgroundColor: Colors.light.green,
    borderWidth: 1.5,
    borderColor: Colors.light.bordercolortodayselectedring,
  },
  ringWitrPending: {
    backgroundColor: Colors.light.green,
    borderWidth: 2,
    borderColor: Colors.light.yellow,
  },
  ringEmpty: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  ringSelectedEmpty: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.28)",
  },
  pastDayIconWrap: {
    opacity: PAST_DAY_ICON_OPACITY,
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
