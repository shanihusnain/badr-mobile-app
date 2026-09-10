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
import { Calendar, type DateData } from "react-native-calendars";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { getMonthName, parseDateKey } from "../journalFillingDateUtils";
import { FastingLegendItem } from "@/src/screens/private/home/components/FastingLegendItem";
import type { FastingLegendEntry } from "@/src/screens/private/home/fastingLegend";
import { TopSpace } from "@/components/atoms/TopSpace";

type JournalCalendarModalProps = {
  visible: boolean;
  selectedDateKey: string;
  calendarMonthDateKey: string;
  completionMap: Record<string, boolean>;
  isLoading?: boolean;
  onClose: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateKey: string) => void;
};

function JournalCalendarModalComponent({
  visible,
  selectedDateKey,
  calendarMonthDateKey,
  completionMap,
  isLoading,
  onClose,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: JournalCalendarModalProps) {
  const monthLabel = useMemo(() => {
    const d = parseDateKey(calendarMonthDateKey);
    const month = getMonthName(d).toUpperCase();
    const year = d.getFullYear();
    return `${month} ${year}`;
  }, [calendarMonthDateKey]);

  const journalLegendEntry: FastingLegendEntry = useMemo(
    () => ({
      id: "journal-filled",
      plannedLabel: "JOURNAL FILLED",
      completedLabel: "JOURNAL FILLED",
      color: Colors.light.green,
    }),
    [],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              onPress={onPrevMonth}
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
              <Text style={styles.monthLabel}>{monthLabel}</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next month"
              onPress={onNextMonth}
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

          {/* Legend (reuse existing calendar legend item) */}

          {/* Calendar */}
          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={Colors.light.green} />
            </View>
          ) : (
            <Calendar
              key={`${calendarMonthDateKey}-${selectedDateKey}`}
              current={calendarMonthDateKey}
              hideArrows
              renderHeader={() => null}
              markingType="custom"
              markedDates={{}}
              theme={{
                calendarBackground: "transparent",
                dayTextColor: Colors.light.white,
                textDisabledColor: Colors.light.white,
                monthTextColor: Colors.light.white,
                textSectionTitleColor: Colors.light.subtext,
                todayTextColor: Colors.light.white,
              }}
              dayComponent={({ date }: { date?: DateData }) => {
                if (!date) return <View />;
                const ds = date.dateString;
                const isSelected = ds === selectedDateKey;
                const isFilled = Boolean(completionMap[ds]);

                return (
                  <>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`Journal date ${ds}`}
                      onPress={() => onSelectDate(ds)}
                      disabled={false}
                    >
                      <View
                        style={[
                          styles.dayCell,
                          isSelected && styles.dayCellSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayNumber,
                            isSelected && styles.dayNumberSelected,
                            {
                              color: isFilled
                                ? Colors.light.green
                                : Colors.light.white,
                            },
                          ]}
                        >
                          {date.day}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TopSpace top={10} />
                    {isFilled ? <View style={styles.greenDot} /> : null}
                  </>
                );
              }}
              style={styles.calendar}
            />
          )}

          {/* Close */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <View
              style={{
                height: 3,
                width: 3,
                borderRadius: 3,
                backgroundColor: Colors.light.green,
              }}
            />
            <Text
              style={{
                fontFamily: fonts.primary.semiBold,
                fontSize: 12,
                color: Colors.light.green,
              }}
            >
              Journal Filled Out
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.light.overlayMask,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  modalCard: {
    backgroundColor: Colors.light.calendarBg,
    overflow: "hidden",
    paddingTop: 12,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 6,
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
  monthLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 13,
    letterSpacing: 0.4,
  },
  legendContainer: {
    paddingHorizontal: 16,
  },
  calendar: {
    paddingHorizontal: 6,
  },
  loading: {
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCell: {
    width: 34,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "transparent",
  },
  dayCellSelected: {
    backgroundColor: Colors.light.calendarBg,
  },
  dayNumber: {
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    color: Colors.light.white,
  },
  dayNumberSelected: {
    color: Colors.light.white,
  },
  greenDot: {
    position: "absolute",
    bottom: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.green,
  },
  closeBtn: {
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: Colors.light.greybuttonBackground,
    marginTop: 8,
  },
  closeBtnText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
  },
});

export const JournalCalendarModal = memo(JournalCalendarModalComponent);
