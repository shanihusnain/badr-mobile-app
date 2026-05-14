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
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import moment from "moment-hijri";
import { fonts } from "@/assets/fonts";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import { TopSpace } from "@/components/atoms/TopSpace";
import { CalendarCountAndRamadanText } from "@/components/atoms/CalendarCountAndRamadanText";

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

  // Count Mon/Thu in window
  const monThuCount = Array.from({ length: 28 }, (_, i) => {
    const dow = moment().add(i, "days").day(); // 0=Sun 1=Mon … 4=Thu
    return dow === 1 || dow === 4;
  }).filter(Boolean).length;

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
          <Text style={[styles.legendText, { color: Colors.light.grey }]}>
            MISSED RAMADAN FASTS
          </Text>
          <View
            style={[
              styles.legendRing,
              { borderColor: Colors.light.ringMonThu, marginLeft: 12 },
            ]}
          />
          <Text style={[styles.legendText, { color: Colors.light.grey }]}>
            MONDAYS & THURSDAYS
          </Text>
        </View>
      </View>

      {/* ── Date range label ── */}
      <View style={styles.dateLabel}>
        <Text style={styles.dateLabelText}>{rangeLabel}</Text>
      </View>

      {/* ── Calendar ── */}
      <CalendarGrid
        mode="mon_thu"
        currentDate={currentDate}
        markedDates={missedRamadanDates}
      />

      {/* ── Footer — calendarBg bottom bar ── */}
      <View style={styles.footer}>
        <Text style={styles.description}>
          Monday and Thursday fasts are highlighted. Any missed Ramadan fasts
          are shown with an orange ring.
        </Text>
        <TopSpace top={16} />
        <CalendarCountAndRamadanText
          fastCount={monThuCount}
          countColor={Colors.light.ringMonThu}
          title="Monday & Thursday Fasts"
        />
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => onSave?.(monThuCount)}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MonThuCalendar;

const styles = StyleSheet.create({
  wrapper: { marginBottom: 8 },

  topBar: {
    backgroundColor: Colors.light.calendarBg,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  legendRing: {
    width: 10,
    height: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  legendText: {
    fontSize: 10,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    letterSpacing: 0.4,
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

  footer: {
    backgroundColor: Colors.light.calendarBg,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  description: {
    fontSize: 13,
    color: Colors.light.grey,
    lineHeight: 20,
    fontFamily: fonts.primary.regular,
  },
  count: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.white,
    marginTop: 12,
    fontFamily: fonts.primary.bold,
  },
  saveBtn: {
    marginTop: 20,
    backgroundColor: Colors.light.green,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
  },
});
