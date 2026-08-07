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
import type { ReactNode } from "react";
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
import Feather from "@expo/vector-icons/Feather";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";

const RING_SIZE = 32;
const COMPLETED_DOT_SIZE = 26;
/** Day-cell footprint — keep stable so Hijri labels don't shrink with the ring. */
const DAY_CELL_WIDTH = 30;
const DAY_CELL_HEIGHT = 48;

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
  | "cycle_start"
  | "ramadan"
  | "dawood"
  | "mon_thu"
  | "white_days"
  | "planned_all"
  | "planned_progress"
  | "missed_ramadan_achievement"
  | "monday_thursday_achievement"
  | "white_days_achievement"
  | "dawood_achievement";

export type CalendarGridProps = {
  mode: CalendarMode;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
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
  /** Monday & Thursday achievement: outlined markers for missed selected fasts. */
  missedFastDates?: string[];
  /** Planned Mon/Thu fast dates (planned_all / mon_thu modes). */
  monThuDates?: string[];
  /** Planned White Day fast dates (planned_all / white_days / mon_thu overlay). */
  whiteDayDates?: string[];
  /** Overlay Prophet Dawood fast dates (mon_thu / white_days selection calendars). */
  dawoodDates?: string[];
  /** Multi-select highlight (e.g. chosen Mon/Thu dates while editing). */
  selectedDates?: string[];
  /** Planned vs. progress markers (planned_progress mode). */
  plannedFastMarkers?: PlannedFastMarker[];
  /** Dawood mode: 1 = fast on days 1,3,5… | 2 = fast on days 2,4,6… */
  dawoodStartDay?: 1 | 2;
  /** White-days / mon_thu: dim inactive days when true (default true). */
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
  /** Prophet Dawood achievement: show cycle restart marker on this date. */
  cycleRestartDate?: string | null;
  bgColor?: string;
  /** Optional footer rendered inside the calendar card (e.g. cycle start summary). */
  footer?: ReactNode;
};

// ── Ring colour constants are defined in constants/theme.ts ──────────────────

const WEEKDAY_KEYS = [
  "homeScreen.calendar_weekday_mon",
  "homeScreen.calendar_weekday_tue",
  "homeScreen.calendar_weekday_wed",
  "homeScreen.calendar_weekday_thu",
  "homeScreen.calendar_weekday_fri",
  "homeScreen.calendar_weekday_sat",
  "homeScreen.calendar_weekday_sun",
] as const;

function buildCycleWeeks(
  windowStart: moment.Moment,
  windowEnd: moment.Moment,
): (string | null)[][] {
  const weeks: (string | null)[][] = [];
  // isoWeek starts on Monday so columns match WEEKDAY_KEYS.
  const cursor = windowStart.clone().startOf("isoWeek");
  const gridEnd = windowEnd.clone().endOf("isoWeek");

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
  // isoWeek starts on Monday so columns match WEEKDAY_KEYS.
  const cursor = monthStart.clone().startOf("isoWeek");
  const gridEnd = monthEnd.clone().endOf("isoWeek");
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
  borderBottomLeftRadius,
  borderBottomRightRadius,
  currentDate,
  windowStartDate,
  windowEndDate,
  markedDates = [],
  completedFastDates = [],
  incompletePlannedFastDates = [],
  missedFastDates = [],
  monThuDates = [],
  whiteDayDates = [],
  dawoodDates = [],
  plannedFastMarkers = [],
  dawoodStartDay = 1,
  dimInactiveDays = true,
  onDayPress,
  selectedDate,
  selectedDates = [],
  endDate,
  minDate,
  maxDate,
  cycleRestartDate = null,
  bgColor,
  footer,
}: CalendarGridProps) => {
  const { t } = useTypedTranslation();
  const markedSet = new Set(markedDates);
  const completedFastSet = new Set(completedFastDates);
  const incompletePlannedFastSet = new Set(incompletePlannedFastDates);
  const missedFastSet = new Set(missedFastDates);
  const monThuSet = new Set(monThuDates);
  const whiteDaySet = new Set(whiteDayDates);
  const dawoodSet = new Set(dawoodDates);
  const selectedDatesSet = new Set(selectedDates);
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
  const monthWeeks =
    mode === "dob" ||
    mode === "white_days_achievement" ||
    mode === "dawood_achievement" ||
    mode === "monday_thursday_achievement"
      ? buildMonthWeeks(currentDate)
      : null;
  const gridWeeks: (string | null)[][] | null =
    monthWeeks ?? cycleWeeks ?? null;

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
    const hijriDayLabel = Number.isFinite(hijriDay) ? String(hijriDay) : "";
    const isToday = ds === moment().format("YYYY-MM-DD");
    const isSelected = ds === selectedDate;
    const isEndDate = !!endDate && ds === endDate;
    const dayOfWeek = new Date(ds + "T12:00:00").getDay(); // 0=Sun 1=Mon … 4=Thu
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
      // ── Date of Birth ───────────────────────────────────────────────
      case "dob": {
        if (isDisabledDobDate) {
          cellOpacity = 0.35;
          textStyle = { color: Colors.light.grey };
        } else if (isSelected) {
          cellBg = { backgroundColor: Colors.light.calendarTodayBg };
          textStyle = { color: Colors.light.white };
        } else if (isEndDate) {
          circleStyle = {
            borderColor: Colors.light.white,
          };
          textStyle = { color: Colors.light.white };
        } else if (isInRange) {
          cellBg = { backgroundColor: "transparent" };
          textStyle = { color: Colors.light.white };
        } else if (isToday) {
          textStyle = { color: Colors.light.green };
        }
        break;
      }

      // ── Cycle Start (28-day) — Figma: only start day highlighted ─────
      case "cycle_start": {
        // Selection bg is applied on the compact inner marker, not the cell.
        break;
      }

      // ── Missed Ramadan Fasts ────────────────────────────────────────
      // Selected: ramadan ring. Other goals: dimmed ring, not selectable.
      case "ramadan": {
        const isUserSelected = markedSet.has(ds);
        const hasMonThu = monThuSet.has(ds);
        const hasWhiteDay = whiteDaySet.has(ds);
        const hasDawood = dawoodSet.has(ds);

        if (isUserSelected) {
          cellOpacity = 1;
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.ringRamadan,
          };
          textStyle = { color: Colors.light.ringRamadan };
        } else if (hasMonThu) {
          cellOpacity = dimInactiveDays ? 0.35 : 1;
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.ringMonThu,
          };
          textStyle = { color: Colors.light.ringMonThu };
        } else if (hasDawood) {
          cellOpacity = dimInactiveDays ? 0.35 : 1;
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.ringDawood,
          };
          textStyle = { color: Colors.light.ringDawood };
        } else if (hasWhiteDay) {
          cellOpacity = dimInactiveDays ? 0.35 : 1;
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.white,
          };
          textStyle = { color: Colors.light.white };
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
      // Unselected Mon/Thu: no ring (still tappable). Selected: white ring.
      // Other goals (missed Ramadan / white days / Dawood): dimmed ring in that goal color.
      case "mon_thu": {
        const isMonThu =
          monThuSet.size > 0
            ? monThuSet.has(ds)
            : dayOfWeek === 1 || dayOfWeek === 4;
        const isUserSelected = selectedDatesSet.has(ds);
        const hasMissedRamadan = markedSet.has(ds);
        const hasWhiteDay = whiteDaySet.has(ds);
        const hasDawood = dawoodSet.has(ds);

        if (isUserSelected && isMonThu) {
          cellOpacity = 1;
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.white,
          };
          textStyle = { color: Colors.light.white };
        } else if (hasMissedRamadan) {
          cellOpacity = dimInactiveDays ? 0.35 : 1;
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.ringRamadan,
          };
          textStyle = { color: Colors.light.ringRamadan };
        } else if (hasDawood) {
          cellOpacity = dimInactiveDays ? 0.35 : 1;
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.ringDawood,
          };
          textStyle = { color: Colors.light.ringDawood };
        } else if (hasWhiteDay) {
          cellOpacity = dimInactiveDays ? 0.35 : 1;
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.white,
          };
          textStyle = { color: Colors.light.white };
        } else if (isMonThu) {
          // Selectable but unselected — no ring, keep readable
          cellOpacity = 1;
          textStyle = { color: Colors.light.white };
        } else {
          cellOpacity = dimInactiveDays ? 0.3 : 1;
          textStyle = { color: Colors.light.grey };
        }
        break;
      }

      // ── White Days (Hijri 13, 14, 15) ──────────────────────────────
      // Unselected White Day: no ring (still tappable). Selected: white ring.
      // Other goals: dimmed ring in that goal color (not selectable).
      case "white_days": {
        const isWhiteDay =
          whiteDaySet.size > 0
            ? whiteDaySet.has(ds)
            : hijriDay === 13 || hijriDay === 14 || hijriDay === 15;
        const isUserSelected = selectedDatesSet.has(ds);
        const hasMissedRamadan = markedSet.has(ds);
        const hasMonThu = monThuSet.has(ds);
        const hasDawood = dawoodSet.has(ds);

        if (isUserSelected && isWhiteDay) {
          cellOpacity = 1;
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.white,
          };
          textStyle = { color: Colors.light.white };
        } else if (hasMissedRamadan) {
          cellOpacity = dimInactiveDays ? 0.35 : 1;
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.ringRamadan,
          };
          textStyle = { color: Colors.light.ringRamadan };
        } else if (hasDawood) {
          cellOpacity = dimInactiveDays ? 0.35 : 1;
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.ringDawood,
          };
          textStyle = { color: Colors.light.ringDawood };
        } else if (hasMonThu) {
          cellOpacity = dimInactiveDays ? 0.35 : 1;
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.ringMonThu,
          };
          textStyle = { color: Colors.light.ringMonThu };
        } else if (isWhiteDay) {
          cellOpacity = 1;
          textStyle = { color: Colors.light.white };
        } else {
          cellOpacity = dimInactiveDays ? 0.3 : 1;
          textStyle = { color: Colors.light.grey };
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
          textStyle = { color: Colors.light.white };
        } else if (missedFastSet.has(ds)) {
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.warning,
          };
          showMissedWarning = true;
          textStyle = { color: Colors.light.warning };
        } else if (incompletePlannedFastSet.has(ds)) {
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.subtext,
            backgroundColor: "transparent",
          };
          textStyle = { color: Colors.light.white };
        }
        break;
      }

      // ── Monday & Thursday past achievements ────────────────────────────
      case "monday_thursday_achievement": {
        const dayMoment = moment(ds, "YYYY-MM-DD");
        const isPlanned =
          completedFastSet.has(ds) ||
          missedFastSet.has(ds) ||
          incompletePlannedFastSet.has(ds);

        if (!dayMoment.isSame(displayedMonth, "month")) {
          cellOpacity = 0.25;
          textStyle = { color: Colors.light.grey };
          break;
        }

        if (!isPlanned) {
          break;
        }

        if (completedFastSet.has(ds)) {
          markerColor = Colors.light.green;
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.green,
          };
          showCompletedDot = true;
          textStyle = { color: Colors.light.blackBackground };
        } else if (missedFastSet.has(ds)) {
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.warning,
          };
          showMissedWarning = true;
          textStyle = { color: Colors.light.warning };
        } else if (incompletePlannedFastSet.has(ds)) {
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.green,
            backgroundColor: "transparent",
          };
          cellOpacity = 0.65;
          textStyle = { color: Colors.light.green };
        }
        break;
      }

      // ── White Days past achievements ─────────────────────────────────────
      case "white_days_achievement": {
        const dayMoment = moment(ds, "YYYY-MM-DD");
        const isWhiteDay =
          hijriDay === 13 || hijriDay === 14 || hijriDay === 15;

        if (!dayMoment.isSame(displayedMonth, "month")) {
          cellOpacity = 0.25;
          break;
        }

        if (!isWhiteDay) {
          cellOpacity = 0.3;
          break;
        }

        if (completedFastSet.has(ds)) {
          markerColor = Colors.light.white;
          circleStyle = {
            borderWidth: 1.5,
            borderColor: "#000000",
          };
          showCompletedDot = true;
          textStyle = { color: Colors.light.blackBackground };
        } else if (missedFastSet.has(ds)) {
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.white,
          };
          showMissedWarning = true;
          textStyle = { color: Colors.light.white };
        } else if (incompletePlannedFastSet.has(ds)) {
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.white,
          };
          textStyle = { color: Colors.light.white };
        }
        break;
      }

      case "dawood_achievement": {
        const dayMoment = moment(ds, "YYYY-MM-DD");
        const isTarget =
          completedFastSet.has(ds) ||
          missedFastSet.has(ds) ||
          incompletePlannedFastSet.has(ds);

        if (!dayMoment.isSame(displayedMonth, "month")) {
          cellOpacity = 0.25;
          textStyle = { color: Colors.light.grey };
          break;
        }

        if (!isTarget) {
          break;
        }

        if (completedFastSet.has(ds)) {
          markerColor = Colors.light.ringDawood;
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.ringDawood,
          };
          showCompletedDot = true;
          textStyle = { color: Colors.light.white };
        } else if (missedFastSet.has(ds)) {
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.warning,
          };
          showMissedWarning = true;
          textStyle = { color: Colors.light.warning };
        } else if (incompletePlannedFastSet.has(ds)) {
          circleStyle = {
            borderWidth: 1.2,
            borderColor: Colors.light.ringDawood,
            backgroundColor: "transparent",
          };
          cellOpacity = 0.65;
          textStyle = { color: Colors.light.ringDawood };
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

    const isAchievementMode =
      mode === "missed_ramadan_achievement" ||
      mode === "monday_thursday_achievement" ||
      mode === "white_days_achievement" ||
      mode === "dawood_achievement";

    if (selectedDate && isAchievementMode && ds !== selectedDate) {
      cellOpacity = Math.min(cellOpacity, 0.3);
    }

    if (selectedDate && isAchievementMode && ds === selectedDate) {
      cellBg = { backgroundColor: Colors.light.calendarTodayBg };
    }

    const isMonThuDay =
      monThuSet.size > 0
        ? monThuSet.has(ds)
        : dayOfWeek === 1 || dayOfWeek === 4;

    const isWhiteDayCell =
      whiteDaySet.size > 0
        ? whiteDaySet.has(ds)
        : (() => {
            const hijri = moment(ds, "YYYY-MM-DD").iDate();
            return hijri === 13 || hijri === 14 || hijri === 15;
          })();

    const hasOtherFastingGoalOverlay =
      monThuSet.has(ds) || whiteDaySet.has(ds) || dawoodSet.has(ds);
    const isRamadanTappable =
      mode === "ramadan" && (markedSet.has(ds) || !hasOtherFastingGoalOverlay);

    // White Days: only Hijri 13–15, and not occupied by another goal
    const hasOtherGoalOnWhiteDay =
      markedSet.has(ds) || monThuSet.has(ds) || dawoodSet.has(ds);
    const isWhiteDayTappable =
      mode === "white_days" &&
      isWhiteDayCell &&
      (selectedDatesSet.has(ds) || !hasOtherGoalOnWhiteDay);

    const isTappable =
      (mode === "dob" && !isDisabledDobDate) ||
      mode === "cycle_start" ||
      isRamadanTappable ||
      (mode === "mon_thu" && isMonThuDay) ||
      isWhiteDayTappable;
    const isAchievementTappable = isAchievementMode && Boolean(onDayPress);

    return (
      <TouchableOpacity
        onPress={() => onDayPress?.(ds)}
        activeOpacity={isTappable || isAchievementTappable ? 0.7 : 1}
        disabled={!isTappable && !isAchievementTappable}
        style={[
          styles.dayPressable,
          mode === "cycle_start" && styles.cycleStartDayPressable,
        ]}
      >
        <View
          style={[
            styles.dayCell,
            mode === "cycle_start" && styles.cycleStartDayCell,
            mode !== "cycle_start" ? cellBg : null,
            { opacity: cellOpacity },
          ]}
        >
          {mode === "cycle_start" ? (
            <View
              style={[
                styles.cycleStartMarker,
                isSelected && styles.cycleStartMarkerSelected,
              ]}
            >
              <Text style={[styles.cycleStartDayGregorian, textStyle]}>
                {dayNumber}
              </Text>
              <Text style={styles.cycleStartDayHijri}>{hijriDayLabel}</Text>
            </View>
          ) : (
            <>
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
                {showMissedWarning && mode === "dawood_achievement" ? (
                  <FontAwesome
                    name="warning"
                    size={10}
                    color={Colors.light.golden}
                    style={styles.dawoodMissedWarningOutside}
                  />
                ) : null}
                {showMissedWarning && mode !== "dawood_achievement" ? (
                  <FontAwesome
                    name="warning"
                    size={14}
                    color={Colors.light.golden}
                    style={styles.missedWarningIcon}
                  />
                ) : null}
                {mode === "dawood_achievement" &&
                cycleRestartDate &&
                ds === cycleRestartDate ? (
                  <Feather
                    name="refresh-ccw"
                    size={12}
                    color={Colors.light.ringDawood}
                    style={styles.cycleRestartIcon}
                  />
                ) : null}
              </View>
              {mode !== "white_days_achievement" ? (
                <Text style={styles.dayHijri}>{hijriDayLabel}</Text>
              ) : null}
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const isCycleStartMode = mode === "cycle_start";

  return (
    <View
      style={[
        styles.wrapper,
        {
          borderBottomLeftRadius: borderBottomLeftRadius
            ? borderBottomLeftRadius
            : mode === "dob"
              ? 0
              : 12,
          borderBottomRightRadius: borderBottomRightRadius
            ? borderBottomRightRadius
            : mode === "dob"
              ? 0
              : 12,
        },
      ]}
    >
      {gridWeeks ? (
        <View
          style={[
            isCycleStartMode ? styles.cycleStartGrid : styles.cycleGrid,
            {
              backgroundColor: bgColor ?? Colors.light.calendarBg,
            },
          ]}
        >
          <View style={styles.weekdayHeader}>
            {WEEKDAY_KEYS.map((key, index) => (
              <Text
                key={`${key}-${index}`}
                style={[
                  styles.weekdayLabel,
                  isCycleStartMode && styles.cycleStartWeekdayLabel,
                ]}
              >
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
                    <View
                      style={[
                        styles.paddingDayCell,
                        isCycleStartMode && styles.cycleStartPaddingDayCell,
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>
          ))}
          {footer ? (
            <View
              style={
                isCycleStartMode
                  ? styles.cycleStartFooter
                  : styles.calendarFooter
              }
            >
              {footer}
            </View>
          ) : null}
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
    paddingHorizontal: 10,
    paddingVertical: 24,
  },
  // ── Cycle Start mode (Figma: Cycle Start Date frame) ────────────────
  // Intentionally replaces base cycleGrid padding (do not stack with paddingVertical).
  cycleStartGrid: {
    backgroundColor: Colors.light.calendarBg,
    paddingTop: 12,
    paddingBottom: 0,
    paddingHorizontal: 16,
  },
  calendarFooter: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  cycleStartFooter: {
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 4,
  },
  weekdayHeader: {
    flexDirection: "row",
    marginBottom: 0,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    marginBottom: 7,
    fontWeight: "400",
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
    width: DAY_CELL_WIDTH,
    height: DAY_CELL_HEIGHT + 8,
  },
  dayPressable: {
    alignSelf: "center",
    width: DAY_CELL_WIDTH,
  },
  dayCell: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: DAY_CELL_WIDTH,
    height: DAY_CELL_HEIGHT + 4,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 10,
  },
  dayMarkerWrap: {
    width: DAY_CELL_WIDTH - 5,
    height: RING_SIZE - 16,
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
  dawoodMissedWarningOutside: {
    position: "absolute",
    bottom: -2,
    right: -8,
    zIndex: 3,
  },
  cycleRestartIcon: {
    position: "absolute",
    bottom: -4,
    right: -14,
    zIndex: 4,
  },
  dayGregorian: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
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
  cycleStartWeekdayLabel: {
    color: Colors.light.white,
    marginBottom: 8,
    fontSize: 12,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
  cycleStartDayPressable: {
    width: 36,
  },
  cycleStartDayCell: {
    width: 36,
    height: 48,
    paddingVertical: 0,
    borderRadius: 0,
    marginBottom: 7,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  cycleStartMarker: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 18,
  },
  cycleStartMarkerSelected: {
    backgroundColor: Colors.light.calendarTodayBg,
  },
  cycleStartDayGregorian: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    color: Colors.light.white,
    textAlign: "center",
  },
  cycleStartDayHijri: {
    fontSize: 10,
    marginTop: 4,
    lineHeight: 12,
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    textAlign: "center",
  },
  cycleStartPaddingDayCell: {
    width: 36,
    height: 48,
  },
});
