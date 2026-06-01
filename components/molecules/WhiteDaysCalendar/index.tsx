/**
 * WhiteDaysCalendar — reusable component showing the White Days fasts
 * (Hijri 13, 14, 15 of each month). All other days are dimmed.
 * Also overlays missed Ramadan fasts and Mon/Thu fasts.
 *
 * Layout:
 *   ○ MISSED RAMADAN  ● MON & THU  ○ WHITE DAYS  ← legend row
 *   May 13 - Jun 9, 2026                         ← date label (no arrows)
 *   [ CalendarGrid mode="white_days" ]
 *   Description text
 *   N White Days Fasts
 *   [ Save ]
 */

import { Colors } from "@/constants/theme";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import moment from "moment-hijri";
import { fonts } from "@/assets/fonts";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import { TopSpace } from "@/components/atoms/TopSpace";
import { CalendarCountAndRamadanText } from "@/components/atoms/CalendarCountAndRamadanText";

type WhiteDaysCalendarProps = {
  missedRamadanDates?: string[];
  onSave?: (count: number) => void;
  hideFooter?: boolean;
};

export const WhiteDaysCalendar = ({
  missedRamadanDates = [],
  onSave,
  hideFooter = false,
}: WhiteDaysCalendarProps) => {
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

  // Count white days (Hijri 13/14/15) in the 28-day window
  const whiteDayCount = Array.from({ length: 28 }, (_, i) => {
    const hijri = moment().add(i, "days").iDate();
    return hijri === 13 || hijri === 14 || hijri === 15;
  }).filter(Boolean).length;

  return (
    <View style={styles.wrapper}>
      {/* ── Legend — calendarBg top bar ── */}
      <View style={styles.topBar}>
        <View style={styles.legendContainer}>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendRing,
                  { borderColor: Colors.light.ringRamadan },
                ]}
              />
              <Text style={styles.legendText} numberOfLines={1}>MISSED RAMADAN</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendRing,
                  { borderColor: Colors.light.ringMonThu },
                ]}
              />
              <Text style={styles.legendText} numberOfLines={1}>MONDAYS & THURSDAYS</Text>
            </View>
          </View>
          <View style={[styles.legendRow, { marginTop: 6 }]}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendRing, { borderColor: Colors.light.white }]}
              />
              <Text style={styles.legendText} numberOfLines={1}>WHITE DAYS</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Date range label ── */}
      <View style={styles.dateLabel}>
        <Text style={styles.dateLabelText}>{rangeLabel}</Text>
        <Text style={styles.islamicDateText}>{islamicRangeLabel}</Text>
      </View>

      {/* ── Calendar ── */}
      <CalendarGrid
        mode="white_days"
        currentDate={currentDate}
        markedDates={missedRamadanDates}
      />

      {!hideFooter && (
        <View style={styles.footer}>
          <Text style={styles.description}>
            The White Days are the 13th, 14th and 15th of each Islamic month. All
            other days are dimmed. Missed Ramadan and Mon/Thu fasts are shown with
            their respective colours.
          </Text>
          <TopSpace top={16} />
          <CalendarCountAndRamadanText
            fastCount={whiteDayCount}
            countColor={Colors.light.white}
            title="White Days Fasts"
          />
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => onSave?.(whiteDayCount)}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default WhiteDaysCalendar;

const styles = StyleSheet.create({
  wrapper: { marginBottom: 0 },

  topBar: {
    backgroundColor: Colors.light.calendarBg,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  legendContainer: {
    width: "100%",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  legendItem: {
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
    color: Colors.light.grey,
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
