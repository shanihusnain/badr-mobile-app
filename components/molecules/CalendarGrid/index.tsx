/**
 * CalendarGrid — shared calendar grid used by all calendar screens.
 *
 * Handles per-mode day-cell rendering:
 *   dob        — full month, tap to select a date
 *   ramadan    — 28-day window, orange ring on markedDates (missed fasts)
 *   dawood     — 28-day window, #439CB8 ring on every-other-day based on dawoodStartDay
 *   mon_thu    — 28-day window, #61C8A6 ring on Mon/Thu; orange ring on markedDates
 *   white_days    — 28-day window, white ring on Hijri 13/14/15; other days optionally dimmed
 *   planned_all      — 28-day window, all planned fast types at full opacity (dashboard)
 *   planned_progress — 28-day window, completed/missed/planned states per fast day
 *
 * The parent screen owns the surrounding chrome (legend, nav row, buttons etc.)
 * and passes `currentDate` (the month to display as "YYYY-MM-DD").
 */

import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import moment from "moment-hijri";
import { fonts } from "@/assets/fonts";
import { FontAwesome } from "@expo/vector-icons";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";

const RING_SIZE = 36;
const COMPLETED_DOT_SIZE = 30;

const ringStyle: ViewStyle = {
  width: RING_SIZE,
  height: RING_SIZE,
  minWidth: RING_SIZE,
  minHeight: RING_SIZE,
  maxWidth: RING_SIZE,
  maxHeight: RING_SIZE,
  borderRadius: RING_SIZE / 2,
  aspectRatio: 1,
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  flexGrow: 0,
  overflow: "hidden",
};

export type PlannedFastMarker = {
  date: string;
  color: string;
  state: "completed" | "missed" | "planned";
};

// ── Types ────────────────────────────────────────────────────────────────────

export type CalendarMode =
  | "dob"
  | "ramadan"
  | "dawood"
  | "mon_thu"
  | "white_days"
  | "planned_all"
  | "planned_progress"
  | "missed_ramadan_achievement";

export type CalendarGridProps = {
  mode: CalendarMode;
  /**
   * Controls which month to display — "YYYY-MM-DD" (usually the 1st of the month).
   * For non-dob modes this is also used as the start of the 28-day window.
   */
  currentDate: string;
  /** Optional cycle start for the 28-day window (defaults to currentDate). */
  windowStartDate?: string;
  /** Optional cycle end for the 28-day window (defaults to start + 27 days). */
  windowEndDate?: string;
  /** Dates to highlight as missed Ramadan fasts (used in ramadan / mon_thu / white_days). */
  markedDates?: string[];
  /** Missed Ramadan achievement: solid markers for completed fasts. */
  completedFastDates?: string[];
  /** Missed Ramadan achievement: outlined markers for incomplete planned fasts. */
  incompletePlannedFastDates?: string[];
  /** Planned Mon/Thu fast dates (planned_all mode). */
  monThuDates?: string[];
  /** Planned White Day fast dates (planned_all mode). */
  whiteDayDates?: string[];
  /** Planned vs. progress markers (planned_progress mode). */
  plannedFastMarkers?: PlannedFastMarker[];
  /** Dawood mode: 1 = fast on days 1,3,5… | 2 = fast on days 2,4,6… */
  dawoodStartDay?: 1 | 2;
  /** White-days mode: dim non-white days when true (default true). */
  dimInactiveDays?: boolean;
  /** Called when the user taps a day cell. */
  onDayPress?: (dateString: string) => void;
  /** DOB / cycle mode: the currently selected (start) date string. */
  selectedDate?: string;
  /** Cycle mode: the end date of the 28-day range (highlighted with a green ring). */
  endDate?: string;
  /** DOB mode: earliest selectable date (YYYY-MM-DD). */
  minDate?: string;
  /** DOB mode: latest selectable date (YYYY-MM-DD). */
  maxDate?: string;
  bgColor?: string;
};

// ── Ring colour constants are defined in constants/theme.ts ──────────────────

const WEEKDAY_KEYS = [
  "homeScreen.calendar_weekday_sun",
  "homeScreen.calendar_weekday_mon",
  "homeScreen.calendar_weekday_tue",
  "homeScreen.calendar_weekday_wed",
  "homeScreen.calendar_weekday_thu",
  "homeScreen.calendar_weekday_fri",
  "homeScreen.calendar_weekday_sat",
] as const;

function buildCycleWeeks(
  windowStart: moment.Moment,
  windowEnd: moment.Moment,
): (string | null)[][] {
  const weeks: (string | null)[][] = [];
  const cursor = windowStart.clone().startOf("week");
  const gridEnd = windowEnd.clone().endOf("week");

  while (cursor.isSameOrBefore(gridEnd, "day")) {
    const week: (string | null)[] = [];
    for (let i = 0; i < 7; i++) {
      const ds = cursor.format("YYYY-MM-DD");
      if (
        cursor.isBefore(windowStart, "day") ||
        cursor.isAfter(windowEnd, "day")
      ) {
        week.push(null);
      } else {
        week.push(ds);
      }
      cursor.add(1, "day");
    }
    weeks.push(week);
  }

  return weeks;
}

function buildMonthWeeks(monthDate: string): string[][] {
  const monthStart = moment(monthDate, "YYYY-MM-DD").startOf("month");
  const monthEnd = monthStart.clone().endOf("month");
  const cursor = monthStart.clone().startOf("week");
  const gridEnd = monthEnd.clone().endOf("week");
  const weeks: string[][] = [];

  while (cursor.isSameOrBefore(gridEnd, "day")) {
    const week: string[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(cursor.format("YYYY-MM-DD"));
      cursor.add(1, "day");
    }
    weeks.push(week);
  }

  return weeks;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const CalendarGrid = ({
  mode,
  currentDate,
  windowStartDate,
  windowEndDate,
  markedDates = [],
  completedFastDates = [],
  incompletePlannedFastDates = [],
  monThuDates = [],
  whiteDayDates = [],
  plannedFastMarkers = [],
  dawoodStartDay = 1,
  dimInactiveDays = true,
  onDayPress,
  selectedDate,
  endDate,
  minDate,
  maxDate,
  bgColor,
}: CalendarGridProps) => {
  const { t } = useTypedTranslation();
  const markedSet = new Set(markedDates);
  const completedFastSet = new Set(completedFastDates);
  const incompletePlannedFastSet = new Set(incompletePlannedFastDates);
  const monThuSet = new Set(monThuDates);
  const whiteDaySet = new Set(whiteDayDates);
  const plannedFastMarkerMap = new Map(
    plannedFastMarkers.map((marker) => [marker.date, marker]),
  );

  // 28-day window bounds (only used for non-dob modes)
  const windowStart =
    mode !== "dob"
      ? moment(windowStartDate ?? currentDate, "YYYY-MM-DD")
      : null;
  const windowEnd = windowStart
    ? moment(
        windowEndDate ??
          windowStart.clone().add(27, "days").format("YYYY-MM-DD"),
        "YYYY-MM-DD",
      )
    : null;

  const cycleWeeks =
    windowStart && windowEnd ? buildCycleWeeks(windowStart, windowEnd) : null;
  const monthWeeks = mode === "dob" ? buildMonthWeeks(currentDate) : null;
  const gridWeeks: (string | null)[][] | null = cycleWeeks ?? monthWeeks ?? null;

  const displayedMonth = moment(currentDate, "YYYY-MM-DD");

  const isDobDateDisabled = (ds: string) => {
    if (mode !== "dob") return false;
    const day = moment(ds, "YYYY-MM-DD");
    if (!day.isSame(displayedMonth, "month")) return true;
    if (minDate && day.isBefore(minDate, "day")) return true;
    if (maxDate && day.isAfter(maxDate, "day")) return true;
    return false;
  };

  const isInSelectedRange = (ds: string) => {
    if (!selectedDate || !endDate) return false;
    const day = moment(ds, "YYYY-MM-DD");
    return day.isAfter(selectedDate, "day") && day.isBefore(endDate, "day");
  };

  const renderDayCell = (ds: string, dayNumber: number) => {
    // ── Shared values ─────────────────────────────────────────────────
    const hijriDay = moment(ds, "YYYY-MM-DD").iDate();
    const isToday = ds === moment().format("YYYY-MM-DD");
    const isSelected = ds === selectedDate;
    const isEndDate = !!endDate && ds === endDate;
    const dayOfWeek = new Date(ds).getDay(); // 0=Sun 1=Mon … 4=Thu
    const isDisabledDobDate = isDobDateDisabled(ds);
    const isInRange = isInSelectedRange(ds);

    // ── Per-mode styles ───────────────────────────────────────────────
    let cellBg: ViewStyle = {};
    let circleStyle: ViewStyle = {};
    let textStyle: TextStyle = {};
    let cellOpacity = 1;
    let showCompletedDot = false;
    let showMissedWarning = false;
    let markerColor: string | undefined;

    // Today gets a full-cell rectangular background in every mode
    //   if (isToday)
    //     cellBg = { backgroundColor: Colors.light.calendarTodayBg };

    switch (mode) {
      // ── Date of Birth / Cycle Start ─────────────────────────────────
      case "dob": {
        if (isDisabledDobDate) {
          cellOpacity = 0.35;
          textStyle = { color: Colors.light.grey };
        } else if (isSelected) {
          cellBg = { backgroundColor: Colors.light.calendarTodayBg };
          textStyle = { color: Colors.light.white };
        } else if (isEndDate) {
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.green,
          };
          textStyle = { color: Colors.light.green };
        } else if (isInRange) {
          cellBg = { backgroundColor: Colors.light.lightgreen };
          textStyle = { color: Colors.light.white };
        } else if (isToday) {
          textStyle = { color: Colors.light.green };
        }
        break;
      }

      // ── Missed Ramadan Fasts ────────────────────────────────────────
      case "ramadan": {
        if (markedSet.has(ds)) {
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.ringRamadan,
          };
          textStyle = { color: Colors.light.ringRamadan };
        }
        break;
      }

      // ── Prophet Dawood's Fast ───────────────────────────────────────
      case "dawood": {
        const diffDays = moment(ds, "YYYY-MM-DD").diff(windowStart, "days");
        const isFastDay =
          dawoodStartDay === 1 ? diffDays % 2 === 0 : diffDays % 2 === 1;
        if (isFastDay) {
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.ringDawood,
          };
          textStyle = { color: Colors.light.ringDawood };
        }
        break;
      }

      // ── Monday & Thursday Fasts ─────────────────────────────────────
      case "mon_thu": {
        if (markedSet.has(ds)) {
          circleStyle = {
            borderWidth: 1.2,

            borderColor: Colors.light.ringRamadan,
          };
          textStyle = { color: Colors.light.ringRamadan };
        } else if (dayOfWeek === 1 || dayOfWeek === 4) {
          circleStyle = {
            borderWidth: 1.2,

            borderColor: Colors.light.ringMonThu,
          };
          textStyle = { color: Colors.light.ringMonThu };
        }
        break;
      }

      // ── White Days (Hijri 13, 14, 15) ──────────────────────────────
      case "white_days": {
        const isWhiteDay =
          hijriDay === 13 || hijriDay === 14 || hijriDay === 15;
        const isPlannedDay = markedSet.has(ds) || isWhiteDay;
        cellOpacity = dimInactiveDays && !isPlannedDay ? 0.3 : 1;
        if (markedSet.has(ds)) {
          circleStyle = {
            borderWidth: 1.2,

            borderColor: Colors.light.ringRamadan,
          };
          textStyle = { color: Colors.light.ringRamadan };
        } else if (isWhiteDay) {
          circleStyle = {
            borderWidth: 1.2,

            borderColor: Colors.light.white,
          };
          textStyle = { color: Colors.light.white };
        }
        break;
      }

      // ── Dashboard: all planned fast types, no dimming ───────────────
      case "planned_all": {
        if (markedSet.has(ds)) {
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.ringRamadan,
          };
          textStyle = { color: Colors.light.ringRamadan };
        } else if (monThuSet.has(ds)) {
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.ringMonThu,
          };
          textStyle = { color: Colors.light.ringMonThu };
        } else if (whiteDaySet.has(ds)) {
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.white,
          };
          textStyle = { color: Colors.light.white };
        }
        break;
      }

      // ── Missed Ramadan past achievements ───────────────────────────────
      case "missed_ramadan_achievement": {
        if (completedFastSet.has(ds)) {
          markerColor = Colors.light.ringRamadan;
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.ringRamadan,
          };
          showCompletedDot = true;
          textStyle = { color: Colors.light.blackBackground };
        } else if (incompletePlannedFastSet.has(ds)) {
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.ringRamadan,
          };
          textStyle = { color: Colors.light.ringRamadan };
        }
        break;
      }

      // ── Dashboard: planned vs. progress fast states ────────────────
      case "planned_progress": {
        const marker = plannedFastMarkerMap.get(ds);
        if (marker) {
          markerColor = marker.color;
          circleStyle = {
            borderWidth: 1.2,
            borderColor: marker.color,
          };
          showCompletedDot = marker.state === "completed";
          showMissedWarning = marker.state === "missed";
          textStyle = {
            color: showCompletedDot
              ? Colors.light.blackBackground
              : marker.color,
          };
        }
        break;
      }
    }

    const isTappable =
      (mode === "dob" || mode === "ramadan" || mode === "mon_thu") &&
      !isDisabledDobDate;

    return (
      <TouchableOpacity
        onPress={() => onDayPress?.(ds)}
        activeOpacity={isTappable ? 0.7 : 1}
        disabled={!isTappable}
        style={styles.dayPressable}
      >
        <View style={[styles.dayCell, cellBg, { opacity: cellOpacity }]}>
          <View style={styles.dayMarkerWrap}>
            <View style={[styles.circle, ringStyle, circleStyle]}>
              {showCompletedDot && markerColor ? (
                <View
                  style={[
                    styles.completedDot,
                    { backgroundColor: markerColor },
                  ]}
                />
              ) : null}
              <Text
                style={[
                  styles.dayGregorian,
                  textStyle,
                  showCompletedDot && styles.dayGregorianAboveDot,
                ]}
              >
                {dayNumber}
              </Text>
            </View>
            {showMissedWarning ? (
              <FontAwesome
                name="warning"
                size={14}
                color={Colors.light.golden}
                style={styles.missedWarningIcon}
              />
            ) : null}
          </View>
          <Text style={styles.dayHijri}>{hijriDay}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          borderBottomLeftRadius: mode === "dob" ? 0 : 12,
          borderBottomRightRadius: mode === "dob" ? 0 : 12,
        },
      ]}
    >
      {gridWeeks ? (
        <View
          style={[
            styles.cycleGrid,
            {
              backgroundColor: bgColor ?? Colors.light.calendarBg,
            },
          ]}
        >
          <View style={styles.weekdayHeader}>
            {WEEKDAY_KEYS.map((key, index) => (
              <Text key={`${key}-${index}`} style={styles.weekdayLabel}>
                {t(key as any)}
              </Text>
            ))}
          </View>
          {gridWeeks.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.weekRow}>
              {week.map((dateString, dayIndex) => (
                <View
                  key={`week-${weekIndex}-day-${dayIndex}`}
                  style={styles.daySlot}
                >
                  {dateString ? (
                    renderDayCell(
                      dateString,
                      moment(dateString, "YYYY-MM-DD").date(),
                    )
                  ) : (
                    <View style={styles.paddingDayCell} />
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
  },
  cycleGrid: {
    backgroundColor: Colors.light.calendarBg,
    paddingBottom: 4,
  },
  weekdayHeader: {
    flexDirection: "row",
    marginBottom: 0,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 13,
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    marginBottom: 7,
  },
  weekRow: {
    flexDirection: "row",
    marginTop: 0,
    marginBottom: 0,
  },
  daySlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  paddingDayCell: {
    width: RING_SIZE,
    height: 50,
  },
  dayPressable: {
    alignSelf: "center",
    width: RING_SIZE,
  },
  dayCell: {
    alignItems: "center",
    justifyContent: "center",
    width: RING_SIZE,
    height: 50,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 10,
  },
  dayMarkerWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    flexGrow: 0,
  },
  circle: {
    borderWidth: 0,
  },
  completedDot: {
    position: "absolute",
    width: COMPLETED_DOT_SIZE,
    height: COMPLETED_DOT_SIZE,
    minWidth: COMPLETED_DOT_SIZE,
    minHeight: COMPLETED_DOT_SIZE,
    borderRadius: COMPLETED_DOT_SIZE / 2,
  },
  missedWarningIcon: {
    position: "absolute",
    bottom: -5,
    right: -12,
    zIndex: 3,
  },
  dayGregorian: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    lineHeight: 16,
  },
  dayGregorianAboveDot: {
    zIndex: 2,
    elevation: 2,
  },
  dayHijri: {
    fontSize: 10,
    color: Colors.light.grey,
    marginTop: 2,
    fontWeight: "500",
    fontFamily: fonts.primary.semiBold,
  },
});
