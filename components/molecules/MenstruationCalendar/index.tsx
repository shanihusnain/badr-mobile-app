import { Colors } from "@/constants/theme";
import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import moment from "moment-hijri";
import { fonts } from "@/assets/fonts";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";

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

export type MenstruationCalendarProps = {
  /** Start of the active 28-day goal cycle (YYYY-MM-DD). */
  cycleStartDate: string;
  /** End of the active 28-day goal cycle (YYYY-MM-DD). */
  cycleEndDate: string;
  onDayPress?: (dateString: string) => void;
  selectedDate?: string;
  /** Period start (YYYY-MM-DD) — red dots from this day inclusive. */
  periodStartDate?: string;
  /** Period end (YYYY-MM-DD) — red dots through this day inclusive. */
  periodEndDate?: string;
  isMenstruating: boolean;
};

export const MenstruationCalendar = ({
  cycleStartDate,
  cycleEndDate,
  onDayPress,
  selectedDate,
  periodStartDate,
  periodEndDate,
  isMenstruating,
}: MenstruationCalendarProps) => {
  const today = moment().format("YYYY-MM-DD");
  const { t } = useTypedTranslation();

  const weeks = useMemo(() => {
    const start = moment(cycleStartDate, "YYYY-MM-DD").startOf("day");
    const end = moment(cycleEndDate, "YYYY-MM-DD").startOf("day");
    return buildCycleWeeks(start, end);
  }, [cycleStartDate, cycleEndDate]);

  const periodStart = periodStartDate || selectedDate || today;
  const periodEnd = periodEndDate || periodStart;
  // Highlight the period end (today when still menstruating; chosen end otherwise)
  const effectiveSelected = isMenstruating ? periodEnd : today;

  const isInPeriod = (dateString: string) => {
    if (!isMenstruating || !periodStart) return false;
    return dateString >= periodStart && dateString <= periodEnd;
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.weekdayHeader}>
        {WEEKDAY_KEYS.map((key, index) => (
          <Text
            key={`${key}-${index}`}
            style={[
              styles.weekdayLabel,
              !isMenstruating && styles.weekdayLabelDimmed,
            ]}
          >
            {t(key as any)}
          </Text>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={`week-${weekIndex}`} style={styles.weekRow}>
          {week.map((dateString, dayIndex) => {
            if (!dateString) {
              return (
                <View
                  key={`pad-${weekIndex}-${dayIndex}`}
                  style={styles.daySlot}
                >
                  <View style={styles.paddingDayCell} />
                </View>
              );
            }

            const gregorianDay = moment(dateString, "YYYY-MM-DD").date();
            const hijriDay = moment(dateString, "YYYY-MM-DD").iDate();
            const isSelected = dateString === effectiveSelected;
            const showPeriodDot = isInPeriod(dateString);

            return (
              <View
                key={dateString}
                style={styles.daySlot}
              >
                <TouchableOpacity
                  onPress={() => {
                    if (isMenstruating) onDayPress?.(dateString);
                  }}
                  activeOpacity={isMenstruating ? 0.7 : 1}
                  disabled={!isMenstruating}
                  style={styles.dayPressable}
                >
                  <View
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                    ]}
                  >
                    {showPeriodDot ? <View style={styles.redDot} /> : null}
                    <Text
                      style={[
                        styles.dayGregorian,
                        !isMenstruating && styles.dayGregorianDimmed,
                      ]}
                    >
                      {gregorianDay}
                    </Text>
                    <Text
                      style={[
                        styles.dayHijri,
                        !isMenstruating && styles.dayHijriDimmed,
                      ]}
                    >
                      {Number.isFinite(hijriDay) ? hijriDay : ""}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.light.calendarBg,
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  weekdayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
  weekdayLabelDimmed: {
    color: Colors.light.subtext,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  daySlot: {
    flex: 1,
    alignItems: "center",
  },
  dayPressable: {
    width: 36,
  },
  dayCell: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    minHeight: 58,
    paddingVertical: 4,
    borderRadius: 6,
    position: "relative",
  },
  dayCellSelected: {
    backgroundColor: Colors.light.calendarTodayBg,
  },
  paddingDayCell: {
    width: 36,
    height: 54,
  },
  redDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.red,
    position: "absolute",
    top: 3,
    right: 5,
  },
  dayGregorian: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    color: Colors.light.white,
    opacity: 1,
    textAlign: "center",
  },
  dayGregorianDimmed: {
    color: Colors.light.dullWhite,
    opacity: 0.9,
  },
  dayHijri: {
    fontSize: 10,
    lineHeight: 14,
    marginTop: 10,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    color: Colors.light.subtext,
    textAlign: "center",
  },
  dayHijriDimmed: {
    color: Colors.light.grey,
  },
});

export default MenstruationCalendar;
