/**
 * DawoodCalendar — reusable component for Prophet Dawood's fasting schedule.
 *
 * Layout:
 *   ( ) Start from 1st day   ( ) Start from 2nd day  ← radio row
 *   May 13 - Jun 9, 2026                              ← date label (no arrows)
 *   [ CalendarGrid mode="dawood" ]
 *   Description text
 *   N DAWOOD FASTS
 *   [ Save ]
 */

import { Colors } from "@/constants/theme";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import moment from "moment-hijri";
import { fonts } from "@/assets/fonts";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import { TopSpace } from "@/components/atoms/TopSpace";
import { CalendarCountAndRamadanText } from "@/components/atoms/CalendarCountAndRamadanText";

type DawoodCalendarProps = {
  onSave?: (startDay: 1 | 2) => void;
};

export const DawoodCalendar = ({ onSave }: DawoodCalendarProps) => {
  const [dawoodStartDay, setDawoodStartDay] = useState<1 | 2>(1);

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

  // Count fast days in the 28-day window
  const fastCount = Array.from({ length: 28 }, (_, i) => i).filter((i) =>
    dawoodStartDay === 1 ? i % 2 === 0 : i % 2 === 1,
  ).length;

  return (
    <View style={styles.wrapper}>
      {/* ── Radio buttons — inside calendarBg header ── */}
      <View style={styles.topBar}>
        <View style={styles.radioRow}>
          {([1, 2] as const).map((day) => (
            <TouchableOpacity
              key={day}
              style={styles.radioItem}
              onPress={() => setDawoodStartDay(day)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.radioOuter,
                  //   dawoodStartDay === day && styles.radioOuterActive,
                ]}
              >
                {dawoodStartDay === day && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>
                {day === 1 ? "Start from 1st day" : "Start from 2nd day"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Date range label ── */}
      <View style={styles.dateLabel}>
        <Text style={styles.dateLabelText}>{rangeLabel}</Text>
        <Text style={styles.islamicDateText}>{islamicRangeLabel}</Text>
      </View>

      {/* ── Calendar ── */}
      <CalendarGrid
        mode="dawood"
        currentDate={currentDate}
        dawoodStartDay={dawoodStartDay}
      />

      {/* ── Footer (same calendarBg — feels like calendar body extension) ── */}
      <View style={styles.footer}>
        <Text style={styles.description}>
          Prophet Dawood (AS) used to fast every other day. Choose whether your
          cycle starts on the first or second day of the window.
        </Text>
        {/* <Text style={styles.count}>{fastCount} DAWOOD FASTS</Text> */}
        <TopSpace top={16} />
        <CalendarCountAndRamadanText
          fastCount={fastCount}
          countColor={Colors.light.ringDawood}
          title="Prophet Dawood Fasts"
        />
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => onSave?.(dawoodStartDay)}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DawoodCalendar;

const styles = StyleSheet.create({
  wrapper: { marginBottom: 8 },

  // top bar (radio buttons) — same calendarBg, rounded top
  topBar: {
    backgroundColor: Colors.light.calendarBg,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  radioRow: {
    flexDirection: "row",
    gap: 20,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.grey,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: { borderColor: Colors.light.green },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.green,
  },
  radioLabel: {
    fontSize: 12,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
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

  description: {
    fontSize: 13,
    color: Colors.light.grey,
    marginTop: 16,
    lineHeight: 20,
    fontFamily: fonts.primary.regular,
  },
  count: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
  },
  // footer — calendarBg, rounded bottom, holds description + count + save
  footer: {
    backgroundColor: Colors.light.calendarBg,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  saveBtn: {
    marginTop: 24,
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
