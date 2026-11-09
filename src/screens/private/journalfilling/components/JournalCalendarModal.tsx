import React, { memo, useMemo } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import {
  buildCycleWeeks,
  getJournalDateRangeLabel,
  parseDateKey,
} from "../journalFillingDateUtils";

/** Match fasting CalendarGrid day footprint. */
const DAY_CELL_WIDTH = 36;
const DAY_CELL_HEIGHT = 48;
const DAY_MARKER_HEIGHT = 24;

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type JournalCalendarModalProps = {
  visible: boolean;
  selectedDateKey: string;
  windowStartDateKey: string;
  windowEndDateKey: string;
  completionMap: Record<string, boolean>;
  /** Dates from API `days[]` that can be selected. Empty = allow all (fallback). */
  availableDateKeys?: string[];
  isLoading?: boolean;
  onClose: () => void;
  onPrevWindow: () => void;
  onNextWindow: () => void;
  onSelectDate: (dateKey: string) => void;
};

function JournalCalendarModalComponent({
  visible,
  selectedDateKey,
  windowStartDateKey,
  windowEndDateKey,
  completionMap,
  availableDateKeys,
  isLoading,
  onClose,
  onPrevWindow,
  onNextWindow,
  onSelectDate,
}: JournalCalendarModalProps) {
  const insets = useSafeAreaInsets();
  const availableSet = useMemo(
    () => new Set(availableDateKeys ?? []),
    [availableDateKeys],
  );
  const restrictToAvailable = availableSet.size > 0;

  const rangeLabel = useMemo(
    () => getJournalDateRangeLabel(windowStartDateKey, windowEndDateKey),
    [windowEndDateKey, windowStartDateKey],
  );

  const weeks = useMemo(
    () => buildCycleWeeks(windowStartDateKey, windowEndDateKey),
    [windowEndDateKey, windowStartDateKey],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Dismiss calendar"
      >
        <Pressable
          style={[styles.modalCard, { paddingTop: Math.max(insets.top, 12) }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.headerRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous period"
              onPress={onPrevWindow}
              hitSlop={8}
              style={styles.arrowBtn}
            >
              <Feather
                name="chevron-left"
                size={20}
                color={Colors.light.white}
              />
            </Pressable>

            <View style={styles.monthLabelContainer}>
              <Text style={styles.rangeLabel}>{rangeLabel}</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next period"
              onPress={onNextWindow}
              hitSlop={8}
              style={styles.arrowBtn}
            >
              <Feather
                name="chevron-right"
                size={20}
                color={Colors.light.white}
              />
            </Pressable>
          </View>

          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={Colors.light.green} />
            </View>
          ) : (
            <View style={styles.grid}>
              <View style={styles.weekdayHeader}>
                {WEEKDAY_LABELS.map((label) => (
                  <Text key={label} style={styles.weekdayLabel}>
                    {label}
                  </Text>
                ))}
              </View>

              {weeks.map((week, weekIndex) => (
                <View key={`week-${weekIndex}`} style={styles.weekRow}>
                  {week.map((dateKey, dayIndex) => {
                    if (!dateKey) {
                      return (
                        <View
                          key={`pad-${weekIndex}-${dayIndex}`}
                          style={styles.daySlot}
                        >
                          <View style={styles.paddingDayCell} />
                        </View>
                      );
                    }

                    const isAvailable =
                      !restrictToAvailable || availableSet.has(dateKey);
                    const isSelected = dateKey === selectedDateKey;
                    const isFilled = Boolean(completionMap[dateKey]);
                    const dayNumber = parseDateKey(dateKey).getDate();

                    return (
                      <View key={dateKey} style={styles.daySlot}>
                        <TouchableOpacity
                          activeOpacity={isAvailable ? 0.7 : 1}
                          accessibilityRole="button"
                          accessibilityLabel={`Journal date ${dateKey}`}
                          accessibilityState={{ disabled: !isAvailable }}
                          onPress={() => {
                            if (!isAvailable) return;
                            onSelectDate(dateKey);
                          }}
                          disabled={!isAvailable}
                          style={styles.dayPressable}
                        >
                          <View
                            style={[
                              styles.dayCell,
                              isSelected &&
                                isAvailable &&
                                styles.dayCellSelected,
                              !isAvailable && styles.dayCellDisabled,
                            ]}
                          >
                            <View style={styles.dayMarkerWrap}>
                              <Text
                                style={[
                                  styles.dayNumber,
                                  {
                                    color: !isAvailable
                                      ? Colors.light.grey
                                      : isFilled
                                        ? Colors.light.green
                                        : Colors.light.white,
                                  },
                                ]}
                              >
                                {dayNumber}
                              </Text>
                            </View>
                            <View style={styles.dotSlot}>
                              {isFilled ? (
                                <View style={styles.greenDot} />
                              ) : null}
                            </View>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          )}

          <View style={styles.legendRow}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>Journal filled out</Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.light.overlayMask,
    justifyContent: "flex-start",
  },
  modalCard: {
    backgroundColor: Colors.light.calendarBg,
    overflow: "hidden",
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
  },
  arrowBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabelContainer: {
    flex: 1,
    alignItems: "center",
  },
  rangeLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 14,
    textAlign: "center",
  },
  grid: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  weekdayHeader: {
    flexDirection: "row",
    marginBottom: 0,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    marginBottom: 8,
  },
  weekRow: {
    flexDirection: "row",
  },
  loading: {
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.green,
    flexShrink: 0,
  },
  legendText: {
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 10,
    lineHeight: 14,
    color: Colors.light.green,
  },
  daySlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayPressable: {
    alignSelf: "center",
    width: DAY_CELL_WIDTH,
  },
  paddingDayCell: {
    width: DAY_CELL_WIDTH,
    height: DAY_CELL_HEIGHT,
  },
  dayCell: {
    width: DAY_CELL_WIDTH,
    height: DAY_CELL_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 0,
    borderRadius: 5,
    marginBottom: 7,
  },
  dayCellSelected: {
    backgroundColor: Colors.light.calendarTodayBg,
  },
  dayCellDisabled: {
    opacity: 0.35,
  },
  dayMarkerWrap: {
    width: DAY_CELL_WIDTH,
    height: DAY_MARKER_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 14,
    fontFamily: fonts.primary.medium,
    color: Colors.light.white,
    textAlign: "center",
  },
  dotSlot: {
    height: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.green,
  },
});

export const JournalCalendarModal = memo(JournalCalendarModalComponent);
