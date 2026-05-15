/**
 * CalendarGrid — shared calendar grid used by all calendar screens.
 *
 * Handles per-mode day-cell rendering:
 *   dob        — full month, tap to select a date
 *   ramadan    — 28-day window, orange ring on markedDates (missed fasts)
 *   dawood     — 28-day window, #439CB8 ring on every-other-day based on dawoodStartDay
 *   mon_thu    — 28-day window, #61C8A6 ring on Mon/Thu; orange ring on markedDates
 *   white_days — 28-day window, white ring on Hijri 13/14/15; all other days dimmed
 *
 * The parent screen owns the surrounding chrome (legend, nav row, buttons etc.)
 * and passes `currentDate` (the month to display as "YYYY-MM-DD").
 */

import { Colors } from "@/constants/theme";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import moment from "moment-hijri";
import { fonts } from "@/assets/fonts";

// ── Types ────────────────────────────────────────────────────────────────────

export type CalendarMode =
  | "dob"
  | "ramadan"
  | "dawood"
  | "mon_thu"
  | "white_days";

export type CalendarGridProps = {
  mode: CalendarMode;
  /**
   * Controls which month to display — "YYYY-MM-DD" (usually the 1st of the month).
   * For non-dob modes this is also used as the start of the 28-day window.
   */
  currentDate: string;
  /** Dates to highlight as missed Ramadan fasts (used in ramadan / mon_thu / white_days). */
  markedDates?: string[];
  /** Dawood mode: 1 = fast on days 1,3,5… | 2 = fast on days 2,4,6… */
  dawoodStartDay?: 1 | 2;
  /** Called when the user taps a day cell. */
  onDayPress?: (dateString: string) => void;
  /** DOB mode: the currently selected date string. */
  selectedDate?: string;
};

// ── Ring colour constants are defined in constants/theme.ts ──────────────────

// ── Component ─────────────────────────────────────────────────────────────────

export const CalendarGrid = ({
  mode,
  currentDate,
  markedDates = [],
  dawoodStartDay = 1,
  onDayPress,
  selectedDate,
}: CalendarGridProps) => {
  const markedSet = new Set(markedDates);

  // 28-day window bounds (only used for non-dob modes)
  const windowStart = mode !== "dob" ? moment(currentDate, "YYYY-MM-DD") : null;
  const windowEnd = windowStart ? windowStart.clone().add(27, "days") : null;

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
      <Calendar
        key={currentDate}
        current={currentDate}
        hideArrows
        renderHeader={() => null}
        markingType="custom"
        markedDates={{}}
        theme={{
          calendarBackground: Colors.light.calendarBg,
          dayTextColor: Colors.light.white,
          textDisabledColor: Colors.light.grey,
          monthTextColor: Colors.light.white,
          textSectionTitleColor: Colors.light.white,
          todayTextColor: Colors.light.green,
          selectedDayBackgroundColor: Colors.light.green,
          selectedDayTextColor: Colors.light.white,
        }}
        dayComponent={({ date }: { date?: DateData }) => {
          if (!date) return null;
          const ds = date.dateString;

          // ── Out-of-range: render a blank placeholder ──────────────────────
          if (windowStart && windowEnd) {
            const d = moment(ds, "YYYY-MM-DD");
            if (d.isBefore(windowStart) || d.isAfter(windowEnd)) {
              return <View style={styles.dayCell} />;
            }
          }

          // ── Shared values ─────────────────────────────────────────────────
          const hijriDay = moment(ds, "YYYY-MM-DD").iDate();
          const isToday = ds === moment().format("YYYY-MM-DD");
          const isSelected = ds === selectedDate;
          const dayOfWeek = new Date(ds).getDay(); // 0=Sun 1=Mon … 4=Thu

          // ── Per-mode styles ───────────────────────────────────────────────
          let cellBg: ViewStyle = {};
          let circleStyle: ViewStyle = {};
          let textStyle: TextStyle = {};
          let cellOpacity = 1;

          // Today gets a full-cell rectangular background in every mode
          //   if (isToday)
          //     cellBg = { backgroundColor: Colors.light.calendarTodayBg };

          switch (mode) {
            // ── Date of Birth ───────────────────────────────────────────────
            case "dob": {
              if (isSelected) {
                cellBg = { backgroundColor: Colors.light.calendarTodayBg };
                textStyle = { color: Colors.light.white };
              } else if (isToday) {
                // textStyle = { color: Colors.light.green };
              }
              break;
            }

            // ── Missed Ramadan Fasts ────────────────────────────────────────
            case "ramadan": {
              if (markedSet.has(ds)) {
                circleStyle = {
                  borderWidth: 1,
                  borderColor: Colors.light.ringRamadan,
                };
                textStyle = { color: Colors.light.ringRamadan };
              }
              break;
            }

            // ── Prophet Dawood's Fast ───────────────────────────────────────
            case "dawood": {
              const diffDays = moment(ds, "YYYY-MM-DD").diff(
                windowStart,
                "days",
              );
              const isFastDay =
                dawoodStartDay === 1 ? diffDays % 2 === 0 : diffDays % 2 === 1;
              if (isFastDay) {
                circleStyle = {
                  borderWidth: 1,
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
                  borderWidth: 1,

                  borderColor: Colors.light.ringRamadan,
                };
                textStyle = { color: Colors.light.ringRamadan };
              } else if (dayOfWeek === 1 || dayOfWeek === 4) {
                circleStyle = {
                  borderWidth: 1,

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
              cellOpacity = isWhiteDay ? 1 : 0.3;
              if (markedSet.has(ds)) {
                circleStyle = {
                  borderWidth: 1,

                  borderColor: Colors.light.ringRamadan,
                };
                textStyle = { color: Colors.light.ringRamadan };
              } else if (isWhiteDay) {
                circleStyle = {
                  borderWidth: 1,

                  borderColor: Colors.light.white,
                };
                textStyle = { color: Colors.light.white };
              }
              break;
            }
          }

          const isTappable = mode === "dob" || mode === "ramadan";

          return (
            <TouchableOpacity
              onPress={() => onDayPress?.(ds)}
              activeOpacity={isTappable ? 0.7 : 1}
              disabled={!isTappable}
            >
              <View style={[styles.dayCell, cellBg, { opacity: cellOpacity }]}>
                <View style={[styles.circle, circleStyle]}>
                  <Text style={[styles.dayGregorian, textStyle]}>
                    {date.day}
                  </Text>
                </View>
                <Text style={styles.dayHijri}>{hijriDay}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
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
  dayCell: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 48,
    paddingVertical: 2,
    borderRadius: 6,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  dayGregorian: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
  },
  dayHijri: {
    fontSize: 10,
    color: Colors.light.grey,
    marginTop: 2,
    fontWeight: "500",
    fontFamily: fonts.primary.semiBold,
  },
});
