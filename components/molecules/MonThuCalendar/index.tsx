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
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import moment from "moment-hijri";
import { fonts } from "@/assets/fonts";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";

type MonThuCalendarProps = {
  /** Pre-existing missed Ramadan dates to overlay on the calendar. */
  missedRamadanDates?: string[];
  onSave?: (count: number) => void;
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
  useEffect(() => {
    onSave?.(monThuCount);
  }, [monThuCount, onSave]);

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
          <Text style={[styles.legendText, { color: Colors.light.grey }]} numberOfLines={1}>
            MISSED RAMADAN FASTS
          </Text>
          <View
            style={[
              styles.legendRing,
              { borderColor: Colors.light.ringMonThu },
            ]}
          />
          <Text style={[styles.legendText, { color: Colors.light.grey }]} numberOfLines={1}>
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
