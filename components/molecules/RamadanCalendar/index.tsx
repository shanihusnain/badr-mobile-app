/**
 * RamadanCalendar — reusable component for marking missed Ramadan fast dates.
 *
 * Layout:
 *   ○ MISSED RAMADAN FASTS  ← legend row
 *   May 13 - Jun 9, 2026    ← date range label (no nav arrows)
 *   [ CalendarGrid ]
 *   Description text
 *   N missed Ramadan Fasts
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

// ── Types ─────────────────────────────────────────────────────────────────────

type RamadanCalendarProps = {
  /** Called with the final list of selected missed-fast dates when user taps Save. */
  onSave?: (missedDates: string[]) => void;
  onDatesChange?: (dates: string[]) => void;
  selectedDates?: string[];
  hideFooter?: boolean;
  hideLegend?: boolean;
  hideDateLabel?: boolean;
};

// ── Component ─────────────────────────────────────────────────────────────────

export const RamadanCalendar = ({
  onSave,
  onDatesChange,
  selectedDates,
  hideFooter = false,
  hideLegend = false,
  hideDateLabel = false,
}: RamadanCalendarProps) => {
  const [internalMissedDates, setInternalMissedDates] = useState<string[]>([]);
  const isControlled = selectedDates !== undefined;
  const missedDates = isControlled ? selectedDates : internalMissedDates;

  // 28-day window starting from today
  const startDate = moment().format("YYYY-MM-DD");
  const endDate = moment().add(27, "days").format("YYYY-MM-DD");

  // Date range label
  const startMoment = moment(startDate, "YYYY-MM-DD");
  const endMoment = moment(endDate, "YYYY-MM-DD");
  const rangeLabel = `${startMoment.format("MMM D")} - ${endMoment.format("MMM D")}, ${startMoment.year()}`;

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
  const startHijriMonth = HIJRI_MONTHS_SHORT[startMoment.iMonth()];
  const endHijriMonth = HIJRI_MONTHS_SHORT[endMoment.iMonth()];
  const startHijriYear = startMoment.iYear();
  const endHijriYear = endMoment.iYear();

  let islamicRangeLabel = "";
  if (startMoment.iMonth() === endMoment.iMonth() && startHijriYear === endHijriYear) {
    islamicRangeLabel = `${startHijriMonth} ${startHijriYear}`;
  } else if (startHijriYear === endHijriYear) {
    islamicRangeLabel = `${startHijriMonth} - ${endHijriMonth} ${startHijriYear}`;
  } else {
    islamicRangeLabel = `${startHijriMonth} ${startHijriYear} - ${endHijriMonth} ${endHijriYear}`;
  }

  // The calendar displays the month that contains the start of the window
  const currentDate = startMoment.startOf("month").format("YYYY-MM-DD");

  // Tap toggles a date in/out of missedDates
  const toggleDate = (ds: string) => {
    const nextDates = missedDates.includes(ds)
      ? missedDates.filter((d) => d !== ds)
      : [...missedDates, ds];

    if (!isControlled) {
      setInternalMissedDates(nextDates);
    }
    onDatesChange?.(nextDates);
  };

  const handleSave = () => {
    onSave?.(missedDates);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.wrapper}>
      {/* ── Legend — calendarBg top bar ── */}
      {!hideLegend && (
        <View style={styles.topBar}>
          <View style={styles.legendRow}>
            <View style={styles.legendRing} />
            <Text style={styles.legendText}>MISSED RAMADAN FASTS</Text>
          </View>
        </View>
      )}

      {/* ── Date range label ── */}
      {!hideDateLabel && (
        <View style={styles.dateLabel}>
          <Text style={styles.dateLabelText}>{rangeLabel}</Text>
          <Text style={styles.islamicDateText}>{islamicRangeLabel}</Text>
        </View>
      )}

      {/* ── Calendar ── */}
      <CalendarGrid
        mode="ramadan"
        currentDate={currentDate}
        markedDates={missedDates}
        onDayPress={toggleDate}
      />

      {/* ── Footer — calendarBg bottom bar ── */}
      {!hideFooter && (
        <View style={styles.footer}>
          <Text style={styles.description}>
            Tap on the dates when you missed your Ramadan fast. These will be
            added to your fasting schedule.
          </Text>
          <TopSpace top={16} />

          <CalendarCountAndRamadanText
            fastCount={missedDates.length}
            countColor={Colors.light.ringRamadan}
            title="Missed Ramadan Fasts"
          />
          <TouchableOpacity
            style={[
              styles.saveBtn,
              missedDates.length === 0 && styles.saveBtnDisabled,
            ]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={missedDates.length === 0}
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default RamadanCalendar;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: { marginBottom: 0 },

  // ── Top bar (legend) — calendarBg rounded top ────────
  topBar: {
    backgroundColor: Colors.light.calendarBg,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // ── Legend ──────────────────────────────────────────
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "center",
  },
  legendRing: {
    width: 10,
    height: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.ringRamadan,
  },
  legendText: {
    fontSize: 10,
    fontWeight: "400",
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    letterSpacing: 0.5,
  },

  // ── Date range label ─────────────────────────────────
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

  // ── Footer — calendarBg rounded bottom ───────────────
  footer: {
    backgroundColor: Colors.light.calendarBg,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },

  // ── Description ──────────────────────────────────────
  description: {
    fontSize: 13,
    color: Colors.light.grey,
    lineHeight: 20,
    fontFamily: fonts.primary.regular,
  },

  // ── Count ────────────────────────────────────────────
  count: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
  },
  // ── Save button ──────────────────────────────────────
  saveBtn: {
    marginTop: 20,
    backgroundColor: Colors.light.green,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
  },
});
