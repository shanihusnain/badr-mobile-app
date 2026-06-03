/**
 * MonThuCalendar — reusable component showing Monday & Thursday fasts.
 * Also shows any missed Ramadan fast dates as an overlay.
 *
 * Layout:
 *   ○ MISSED RAMADAN FASTS   ● MONDAY & THURSDAY FASTS  ← legend row
 *   May 13 - Jun 9, 2026                                ← date label (no arrows)
 *   [ CalendarGrid mode="mon_thu" ]
 *   Description text
 *   N MONDAY & THURSDAY FASTS
 *   [ Save ]
 */

import { Colors } from "@/constants/theme";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import moment from "moment-hijri";
import { fonts } from "@/assets/fonts";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";

type MonThuCalendarProps = {
  /** Pre-existing missed Ramadan dates to overlay on the calendar. */
  missedRamadanDates?: string[];
  /** Called when user selection changes — returns array of selected date strings (YYYY-MM-DD). */
  onSave?: (selectedDates: string[]) => void;
};

export const MonThuCalendar = ({
  missedRamadanDates = [],
  onSave,
}: MonThuCalendarProps) => {
  const startMoment = moment();
  const endMoment = moment().add(27, "days");
  const rangeLabel = `${startMoment.format("MMM D")} - ${endMoment.format("MMM D")}, ${startMoment.year()}`;
  const currentDate = startMoment.clone().startOf("month").format("YYYY-MM-DD");

  // Calculate Islamic date range label
  const HIJRI_MONTHS_SHORT = [
    "Muh.",
    "Saf.",
    "Rab. I",
    "Rab. II",
    "Jum. I",
    "Jum. II",
    "Raj.",
    "Sha.",
    "Ram.",
    "Shaw.",
    "Dhul Q.",
    "Dhul H.",
  ];
  const startMonth = HIJRI_MONTHS_SHORT[startMoment.iMonth()];
  const endMonth = HIJRI_MONTHS_SHORT[endMoment.iMonth()];
  const startYear = startMoment.iYear();
  const endYear = endMoment.iYear();

  let islamicRangeLabel = "";
  if (startMoment.iMonth() === endMoment.iMonth() && startYear === endYear) {
    islamicRangeLabel = `${startMonth} ${startYear}`;
  } else if (startYear === endYear) {
    islamicRangeLabel = `${startMonth} - ${endMonth} ${startYear}`;
  } else {
    islamicRangeLabel = `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
  }

  // Count Mon/Thu in window
  const monThuCount = Array.from({ length: 28 }, (_, i) => {
    const dow = moment().add(i, "days").day(); // 0=Sun 1=Mon … 4=Thu
    return dow === 1 || dow === 4;
  }).filter(Boolean).length;

  // Call onSave callback with count
  // Manage selected Mon/Thu dates locally; parent can supply missedRamadanDates but selected
  // mon/thu days are chosen by tapping the calendar. Keep a set of selected date strings.
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    // report selected date array to parent whenever it changes
    // NOTE: intentionally omitting `onSave` from deps because parent often
    // provides an inline handler which would trigger a render loop. We only
    // want to call the most recent handler when `selectedDates` changes.
    onSave?.(Array.from(selectedDates));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDates]);

  return (
    <View style={styles.wrapper}>
      {/* ── Legend — calendarBg top bar ── */}
      <View style={styles.topBar}>
        <View style={styles.legendRow}>
          <View
            style={[
              styles.legendRing,
              { borderColor: Colors.light.ringRamadan },
            ]}
          />
          <Text
            style={[styles.legendText, { color: Colors.light.grey }]}
            numberOfLines={1}
          >
            MISSED RAMADAN FASTS
          </Text>
          <View
            style={[
              styles.legendRing,
              { borderColor: Colors.light.ringMonThu },
            ]}
          />
          <Text
            style={[styles.legendText, { color: Colors.light.grey }]}
            numberOfLines={1}
          >
            MONDAYS & THURSDAYS
          </Text>
        </View>
      </View>

      {/* ── Date range label ── */}
      <View style={styles.dateLabel}>
        <Text style={styles.dateLabelText}>{rangeLabel}</Text>
        <Text style={styles.islamicDateText}>{islamicRangeLabel}</Text>
      </View>

      {/* ── Calendar ── */}
      <CalendarGrid
        mode="mon_thu"
        currentDate={currentDate}
        markedDates={missedRamadanDates}
        onDayPress={(ds) => {
          // toggle only mon/thursday days
          const dow = new Date(ds).getDay();
          if (dow !== 1 && dow !== 4) return;
          setSelectedDates((prev) => {
            const next = new Set(Array.from(prev));
            if (next.has(ds)) next.delete(ds);
            else next.add(ds);
            return next;
          });
        }}
      />
    </View>
  );
};

export default MonThuCalendar;

const styles = StyleSheet.create({
  wrapper: { marginBottom: 0 },

  topBar: {
    backgroundColor: Colors.light.calendarBg,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendRing: {
    width: 10,
    height: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  legendText: {
    fontSize: 9,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    letterSpacing: 0.1,
  },

  dateLabel: {
    alignItems: "center",
    backgroundColor: Colors.light.calendarBg,
    paddingVertical: 10,
  },
  dateLabelText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
  },
  islamicDateText: {
    fontSize: 12,
    fontWeight: "400",
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    marginTop: 4,
  },
});
