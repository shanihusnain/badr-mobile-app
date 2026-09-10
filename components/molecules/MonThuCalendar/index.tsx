/**
 * MonThuCalendar — Monday & Thursday fast selection.
 * Dates/legends driven by GET fasting-goals/calendar-preview.
 */

import { Colors } from "@/constants/theme";
import { useState, useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import moment from "moment-hijri";
import { fonts } from "@/assets/fonts";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import {
  getFastingLegendItems,
  getSelectableMonThuDates,
  getFastingCollisionDates,
  type FastingCalendarWindow,
} from "@/src/utils/fastingCalendarPreview";

type MonThuCalendarProps = {
  missedRamadanDates?: string[];
  onSave?: (selectedDates: string[]) => void;
  hideFooter?: boolean;
  hideLegend?: boolean;
  hideDateLabel?: boolean;
  readOnly?: boolean;
  bgColor?: string;
  calendarWindow?: FastingCalendarWindow | null;
  initialSelectedDates?: string[];
};

export const MonThuCalendar = ({
  missedRamadanDates = [],
  onSave,
  hideFooter = false,
  hideLegend = false,
  hideDateLabel = false,
  readOnly = false,
  bgColor = Colors.light.calendarBg,
  calendarWindow,
  initialSelectedDates,
}: MonThuCalendarProps) => {
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
  const islamicRangeLabel = calendarWindow?.islamicRangeLabel ?? "";

  const monThuDates = calendarWindow?.monThuDates;
  const monThuSet = useMemo(
    () => new Set(monThuDates ?? []),
    [monThuDates],
  );

  const overlayMissedDates =
    missedRamadanDates.length > 0
      ? missedRamadanDates
      : (calendarWindow?.missedRamadanDates ?? []);

  // Other goals: show planned dates only (not every activePotential day).
  const overlayWhiteDayDates = calendarWindow?.whiteDaysPlannedDates ?? [];
  const overlayDawoodDates = calendarWindow?.dawoodPlannedDates ?? [];
  const collisionDates = useMemo(
    () => getFastingCollisionDates(calendarWindow, "MONDAY_THURSDAY"),
    [calendarWindow],
  );

  const legendItems = useMemo(
    () =>
      getFastingLegendItems(calendarWindow?.legendTypes ?? [], {
        forceInclude: ["MONDAY_THURSDAY"],
      }),
    [calendarWindow?.legendTypes],
  );

  const [selectedDates, setSelectedDates] = useState<Set<string>>(() => {
    const planned =
      initialSelectedDates ?? calendarWindow?.monThuPlannedDates ?? [];
    if (planned.length > 0) return new Set(planned);
    return new Set(getSelectableMonThuDates(calendarWindow));
  });

  // Hydrate from server-planned dates when calendar preview updates
  useEffect(() => {
    if (!calendarWindow?.monThuPlannedDates?.length) return;
    setSelectedDates(new Set(calendarWindow.monThuPlannedDates));
  }, [calendarWindow?.monThuPlannedDates]);

  useEffect(() => {
    onSave?.(Array.from(selectedDates));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDates]);

  const blockedOtherGoalDates = useMemo(() => {
    return new Set([
      ...overlayMissedDates,
      ...overlayWhiteDayDates,
      ...overlayDawoodDates,
    ]);
  }, [overlayMissedDates, overlayWhiteDayDates, overlayDawoodDates]);

  return (
    <View style={styles.wrapper}>
      {!hideLegend && legendItems.length > 0 && (
        <View
          style={[
            styles.topBar,
            hideDateLabel && {
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            },
          ]}
        >
          <View style={styles.legendRow}>
            {legendItems.map((item) => (
              <View key={item.type} style={styles.legendItem}>
                <View
                  style={[styles.legendRing, { borderColor: item.color }]}
                />
                <Text
                  style={[styles.legendText, { color: Colors.light.grey }]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {!hideDateLabel && (
        <View
          style={[
            styles.dateLabel,
            hideLegend && { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
          ]}
        >
          <Text style={styles.dateLabelText}>{rangeLabel}</Text>
          {!!islamicRangeLabel && (
            <Text style={styles.islamicDateText}>{islamicRangeLabel}</Text>
          )}
        </View>
      )}

      <CalendarGrid
        mode="mon_thu"
        currentDate={currentDate}
        windowStartDate={
          calendarWindow?.startDate ?? startMoment.format("YYYY-MM-DD")
        }
        windowEndDate={
          calendarWindow?.endDate ?? endMoment.format("YYYY-MM-DD")
        }
        markedDates={overlayMissedDates}
        monThuDates={monThuDates}
        whiteDayDates={overlayWhiteDayDates}
        dawoodDates={overlayDawoodDates}
        conflictDates={collisionDates}
        selectedDates={Array.from(selectedDates)}
        dimInactiveDays
        bgColor={bgColor}
        onDayPress={
          readOnly
            ? undefined
            : (ds) => {
                const isMonThu =
                  monThuSet.size > 0
                    ? monThuSet.has(ds)
                    : (() => {
                        const dow = new Date(ds + "T12:00:00").getDay();
                        return dow === 1 || dow === 4;
                      })();
                if (!isMonThu) return;
                // Allow deselect; block newly selecting days claimed by other goals
                if (
                  !selectedDates.has(ds) &&
                  blockedOtherGoalDates.has(ds)
                ) {
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
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
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
