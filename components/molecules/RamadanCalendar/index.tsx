/**
 * RamadanCalendar — mark missed Ramadan fast dates.
 * Cycle window + other-goal overlays from GET fasting-goals/calendar-preview.
 */

import { Colors } from "@/constants/theme";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import moment from "moment-hijri";
import { fonts } from "@/assets/fonts";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import { TopSpace } from "@/components/atoms/TopSpace";
import { CalendarCountAndRamadanText } from "@/components/atoms/CalendarCountAndRamadanText";
import {
  getFastingLegendItems,
  type FastingCalendarWindow,
} from "@/src/utils/fastingCalendarPreview";

type RamadanCalendarProps = {
  /** Called with the final list of selected missed-fast dates when user taps Save. */
  onSave?: (missedDates: string[]) => void;
  onDatesChange?: (dates: string[]) => void;
  selectedDates?: string[];
  hideFooter?: boolean;
  hideLegend?: boolean;
  hideDateLabel?: boolean;
  /** Cycle window from GET fasting-goals/calendar-preview */
  calendarWindow?: FastingCalendarWindow | null;
};

export const RamadanCalendar = ({
  onSave,
  onDatesChange,
  selectedDates,
  hideFooter = false,
  hideLegend = false,
  hideDateLabel = false,
  calendarWindow,
}: RamadanCalendarProps) => {
  const [internalMissedDates, setInternalMissedDates] = useState<string[]>([]);
  const isControlled = selectedDates !== undefined;
  const missedDates = isControlled ? selectedDates : internalMissedDates;

  const startDate =
    calendarWindow?.startDate ?? moment().format("YYYY-MM-DD");
  const endDate =
    calendarWindow?.endDate ?? moment().add(27, "days").format("YYYY-MM-DD");

  const startMoment = moment(startDate, "YYYY-MM-DD");
  const endMoment = moment(endDate, "YYYY-MM-DD");
  const rangeLabel =
    calendarWindow?.rangeLabel ??
    `${startMoment.format("MMM D")} - ${endMoment.format("MMM D")}, ${startMoment.year()}`;

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

  let fallbackIslamicRangeLabel = "";
  if (
    startMoment.iMonth() === endMoment.iMonth() &&
    startHijriYear === endHijriYear
  ) {
    fallbackIslamicRangeLabel = `${startHijriMonth} ${startHijriYear}`;
  } else if (startHijriYear === endHijriYear) {
    fallbackIslamicRangeLabel = `${startHijriMonth} - ${endHijriMonth} ${startHijriYear}`;
  } else {
    fallbackIslamicRangeLabel = `${startHijriMonth} ${startHijriYear} - ${endHijriMonth} ${endHijriYear}`;
  }
  const islamicRangeLabel =
    calendarWindow?.islamicRangeLabel ?? fallbackIslamicRangeLabel;

  const currentDate =
    calendarWindow?.currentDate ??
    startMoment.clone().startOf("month").format("YYYY-MM-DD");

  const occupiedByOtherGoals = useMemo(() => {
    const set = new Set([
      ...(calendarWindow?.activeMonThuDates ?? []),
      ...(calendarWindow?.monThuPlannedDates ?? []),
      ...(calendarWindow?.activeWhiteDayDates ?? []),
      ...(calendarWindow?.whiteDaysPlannedDates ?? []),
      ...(calendarWindow?.activeDawoodDates ?? []),
      ...(calendarWindow?.dawoodPlannedDates ?? []),
    ]);
    return set;
  }, [calendarWindow]);

  const overlayMonThuDates = useMemo(() => {
    const set = new Set([
      ...(calendarWindow?.activeMonThuDates ?? []),
      ...(calendarWindow?.monThuPlannedDates ?? []),
    ]);
    return Array.from(set);
  }, [calendarWindow]);

  const overlayWhiteDayDates = useMemo(() => {
    const set = new Set([
      ...(calendarWindow?.activeWhiteDayDates ?? []),
      ...(calendarWindow?.whiteDaysPlannedDates ?? []),
    ]);
    return Array.from(set);
  }, [calendarWindow]);

  const overlayDawoodDates = useMemo(() => {
    const set = new Set([
      ...(calendarWindow?.activeDawoodDates ?? []),
      ...(calendarWindow?.dawoodPlannedDates ?? []),
    ]);
    return Array.from(set);
  }, [calendarWindow]);

  const legendItems = useMemo(
    () =>
      getFastingLegendItems(calendarWindow?.legendTypes ?? [], {
        forceInclude: ["MISSED_RAMADAN"],
      }),
    [calendarWindow?.legendTypes],
  );

  const toggleDate = (ds: string) => {
    // Block selecting dates already used by another fasting goal
    if (occupiedByOtherGoals.has(ds) && !missedDates.includes(ds)) {
      return;
    }

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

  return (
    <View style={styles.wrapper}>
      {!hideLegend && legendItems.length > 0 && (
        <View style={styles.topBar}>
          <View style={styles.legendRow}>
            {legendItems.map((item) => (
              <View key={item.type} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendRing,
                    {
                      borderColor:
                        item.type === "MONDAY_THURSDAY"
                          ? Colors.light.ringMonThu
                          : item.color,
                    },
                  ]}
                />
                <Text style={styles.legendText} numberOfLines={1}>
                  {item.type === "MISSED_RAMADAN"
                    ? "MISSED RAMADAN"
                    : item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {!hideDateLabel && (
        <View style={styles.dateLabel}>
          <Text style={styles.dateLabelText}>{rangeLabel}</Text>
          <Text style={styles.islamicDateText}>{islamicRangeLabel}</Text>
        </View>
      )}

      <CalendarGrid
        mode="ramadan"
        currentDate={currentDate}
        windowStartDate={startDate}
        windowEndDate={endDate}
        markedDates={missedDates}
        monThuDates={overlayMonThuDates}
        whiteDayDates={overlayWhiteDayDates}
        dawoodDates={overlayDawoodDates}
        dimInactiveDays
        onDayPress={toggleDate}
      />

      {!hideFooter && (
        <View style={styles.footer}>
          <Text style={styles.description}>
            Tap on the dates when you missed your Ramadan fast. These will be
            added to your fasting schedule. Dates already planned for other
            fasting goals are shown dimmed and cannot be selected.
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

const styles = StyleSheet.create({
  wrapper: { marginBottom: 0 },

  topBar: {
    backgroundColor: Colors.light.calendarBg,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    alignSelf: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendRing: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  legendText: {
    fontSize: 10,
    fontWeight: "400",
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    letterSpacing: 0.5,
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
    fontWeight: "500",
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
  },
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
