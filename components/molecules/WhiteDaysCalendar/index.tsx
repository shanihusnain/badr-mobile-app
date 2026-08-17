/**
 * WhiteDaysCalendar — selectable White Days (Hijri 13, 14, 15).
 * User can pick 1–3; dates occupied by other goals are dimmed and blocked.
 */

import { Colors } from "@/constants/theme";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import moment from "moment-hijri";
import { fonts } from "@/assets/fonts";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import { TopSpace } from "@/components/atoms/TopSpace";
import { CalendarCountAndRamadanText } from "@/components/atoms/CalendarCountAndRamadanText";
import {
  getFastingLegendItems,
  getFastingCollisionDates,
  type FastingCalendarWindow,
} from "@/src/utils/fastingCalendarPreview";

type WhiteDaysCalendarProps = {
  missedRamadanDates?: string[];
  onSave?: (selectedDates: string[]) => void;
  onDatesChange?: (selectedDates: string[]) => void;
  initialSelectedDates?: string[];
  hideFooter?: boolean;
  hideLegend?: boolean;
  hideDateLabel?: boolean;
  dimInactiveDays?: boolean;
  readOnly?: boolean;
  calendarWindow?: FastingCalendarWindow | null;
};

export const WhiteDaysCalendar = ({
  missedRamadanDates = [],
  onSave,
  onDatesChange,
  initialSelectedDates,
  hideFooter = false,
  hideLegend = false,
  hideDateLabel = false,
  dimInactiveDays = true,
  readOnly = false,
  calendarWindow,
}: WhiteDaysCalendarProps) => {
  const startMoment = calendarWindow
    ? moment(calendarWindow.startDate, "YYYY-MM-DD")
    : moment();
  const endMoment = calendarWindow
    ? moment(calendarWindow.endDate, "YYYY-MM-DD")
    : moment().add(27, "days");
  const rangeLabel =
    calendarWindow?.rangeLabel ??
    `${startMoment.format("MMM D")} - ${endMoment.format("MMM D")}, ${startMoment.year()}`;
  const currentDate =
    calendarWindow?.currentDate ??
    startMoment.clone().startOf("month").format("YYYY-MM-DD");

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

  let fallbackIslamicRangeLabel = "";
  if (startMoment.iMonth() === endMoment.iMonth() && startYear === endYear) {
    fallbackIslamicRangeLabel = `${startMonth} ${startYear}`;
  } else if (startYear === endYear) {
    fallbackIslamicRangeLabel = `${startMonth} - ${endMonth} ${startYear}`;
  } else {
    fallbackIslamicRangeLabel = `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
  }
  const islamicRangeLabel =
    calendarWindow?.islamicRangeLabel ?? fallbackIslamicRangeLabel;

  const potentialWhiteDayDates = useMemo(() => {
    if (calendarWindow?.whiteDayDates.length) {
      return calendarWindow.whiteDayDates;
    }
    const start =
      calendarWindow?.startDate ?? moment().format("YYYY-MM-DD");
    return Array.from({ length: 28 }, (_, i) => {
      const day = moment(start, "YYYY-MM-DD").add(i, "days");
      const hijri = day.iDate();
      if (hijri === 13 || hijri === 14 || hijri === 15) {
        return day.format("YYYY-MM-DD");
      }
      return null;
    }).filter(Boolean) as string[];
  }, [calendarWindow?.whiteDayDates, calendarWindow?.startDate]);

  const whiteDaySet = useMemo(
    () => new Set(potentialWhiteDayDates),
    [potentialWhiteDayDates],
  );

  const overlayMissedDates =
    missedRamadanDates.length > 0
      ? missedRamadanDates
      : (calendarWindow?.missedRamadanDates ?? []);

  // Overlay other goals by their planned dates only — not activePotentials
  // (active Mon/Thu marks every Mon/Thu while the goal is on, which inflates the dimmed count).
  const overlayMonThuDates = calendarWindow?.monThuPlannedDates ?? [];
  const overlayDawoodDates = calendarWindow?.dawoodPlannedDates ?? [];
  const collisionDates = useMemo(
    () => getFastingCollisionDates(calendarWindow, "WHITE_DAYS"),
    [calendarWindow],
  );

  const occupiedByOtherGoals = useMemo(() => {
    return new Set([
      ...overlayMissedDates,
      ...overlayMonThuDates,
      ...overlayDawoodDates,
    ]);
  }, [overlayMissedDates, overlayMonThuDates, overlayDawoodDates]);

  const seedSelectedDates = useMemo(() => {
    const seed =
      initialSelectedDates ??
      calendarWindow?.whiteDaysPlannedDates ??
      [];
    // Drop any seed dates that are now occupied by another goal
    return seed.filter((ds) => !occupiedByOtherGoals.has(ds));
  }, [
    initialSelectedDates,
    calendarWindow?.whiteDaysPlannedDates,
    occupiedByOtherGoals,
  ]);

  const [selectedDates, setSelectedDates] = useState<Set<string>>(
    () => new Set(seedSelectedDates),
  );

  useEffect(() => {
    setSelectedDates(new Set(seedSelectedDates));
  }, [seedSelectedDates]);

  useEffect(() => {
    onDatesChange?.(Array.from(selectedDates));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDates]);

  const legendItems = useMemo(
    () =>
      getFastingLegendItems(calendarWindow?.legendTypes ?? [], {
        forceInclude: ["WHITE_DAYS"],
      }),
    [calendarWindow?.legendTypes],
  );

  const selectedCount = selectedDates.size;

  return (
    <View style={styles.wrapper}>
      {!hideLegend && legendItems.length > 0 && (
        <View style={styles.topBar}>
          <View style={styles.legendContainer}>
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
        </View>
      )}

      {!hideDateLabel && (
        <View style={styles.dateLabel}>
          <Text style={styles.dateLabelText}>{rangeLabel}</Text>
          <Text style={styles.islamicDateText}>{islamicRangeLabel}</Text>
        </View>
      )}

      <CalendarGrid
        mode="white_days"
        currentDate={currentDate}
        windowStartDate={
          calendarWindow?.startDate ?? startMoment.format("YYYY-MM-DD")
        }
        windowEndDate={
          calendarWindow?.endDate ?? endMoment.format("YYYY-MM-DD")
        }
        markedDates={overlayMissedDates}
        whiteDayDates={potentialWhiteDayDates}
        monThuDates={overlayMonThuDates}
        dawoodDates={overlayDawoodDates}
        conflictDates={collisionDates}
        selectedDates={Array.from(selectedDates)}
        dimInactiveDays={dimInactiveDays}
        onDayPress={
          readOnly
            ? undefined
            : (ds) => {
                if (!whiteDaySet.has(ds)) return;
                if (occupiedByOtherGoals.has(ds) && !selectedDates.has(ds)) {
                  return;
                }
                setSelectedDates((prev) => {
                  const next = new Set(Array.from(prev));
                  if (next.has(ds)) next.delete(ds);
                  else next.add(ds);
                  return next;
                });
              }
        }
      />

      {!hideFooter && (
        <View style={styles.footer}>
          <Text style={styles.description}>
            Tap the White Days (13th, 14th, 15th) you want to fast. You can
            select one, two, or all three. Dates already planned for other
            fasting goals are dimmed and cannot be selected.
          </Text>
          <TopSpace top={16} />
          <CalendarCountAndRamadanText
            fastCount={selectedCount}
            countColor={Colors.light.white}
            title="White Days Fasts"
          />
          <TouchableOpacity
            style={[
              styles.saveBtn,
              selectedCount === 0 && styles.saveBtnDisabled,
            ]}
            onPress={() => onSave?.(Array.from(selectedDates))}
            activeOpacity={0.8}
            disabled={selectedCount === 0}
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
    flexWrap: "wrap",
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
    borderRadius: 5,
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
