import React, { useState } from "react";
import { useGoalSelectionOpenState } from "@/hooks/useGoalSelectionOpenState";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  LayoutAnimation,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import moment from "moment-hijri";
import { Colors } from "../../constants/theme";
import { fonts } from "../../assets/fonts";
import GoalSelectionSaveButton from "./GoalSelectionSaveButton";
import { useLocaleNumber } from "../../hooks/useLocaleNumber";
import { CalendarGrid } from "./CalendarGrid";
import type { FastingCalendarWindow } from "@/src/utils/fastingCalendarPreview";
import { useUpsertFastingGoals } from "@/src/api/mutations/useUpsertFastingGoals";
import { TopSpace } from "../atoms/TopSpace";

export default function ProphetDawoodFastGoalSelection({
  calendarWindow,
  onSave,
  openOnMount = false,
}: {
  calendarWindow?: FastingCalendarWindow | null;
  onSave?: (dawoodStartDay: 1 | 2) => void;
  openOnMount?: boolean;
}) {
  const formatNumber = useLocaleNumber();
  const { mutate: upsertFastingGoal, isPending } = useUpsertFastingGoals();
  const [isOpen, setIsOpen] = useGoalSelectionOpenState(openOnMount);
  const [selectedStartDay, setSelectedStartDay] = useState<1 | 2>(1);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const handleSave = (markSaved: () => void, markFailed: () => void) => {
    upsertFastingGoal(
      {
        fastingType: "PROPHET_DAWOOD",
        dawoodStartDay: selectedStartDay,
      },
      {
        onSuccess: () => {
          onSave?.(selectedStartDay);
          markSaved();
          setTimeout(() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setIsOpen(false);
          }, 2000);
        },
        onError: () => markFailed(),
      },
    );
  };

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

  const islamicRangeLabel =
    calendarWindow?.islamicRangeLabel ??
    (() => {
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
        "Dhul H."
      ];
      const startMonth = HIJRI_MONTHS_SHORT[startMoment.iMonth()];
      const endMonth = HIJRI_MONTHS_SHORT[endMoment.iMonth()];
      const startYear = startMoment.iYear();
      const endYear = endMoment.iYear();
      if (
        startMoment.iMonth() === endMoment.iMonth() &&
        startYear === endYear
      ) {
        return `${startMonth} ${startYear}`;
      }
      if (startYear === endYear) {
        return `${startMonth} - ${endMonth} ${startYear}`;
      }
      return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
    })();

  const fastCount = (() => {
    if (!calendarWindow?.days?.length) return 14;
    // isDawoodDay from API is the day-1 alternating pattern from cycle start.
    return calendarWindow.days.filter((day) =>
      selectedStartDay === 1 ? day.isDawoodDay : !day.isDawoodDay,
    ).length;
  })();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <Text style={styles.titleText}>
          Set you schedule to fast every other day this month
        </Text>
        <Feather
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color={Colors.light.white}
          style={styles.icon}
        />
      </TouchableOpacity>

      {isOpen && <View style={styles.divider} />}

      {isOpen && (
        <View style={styles.expandedContent}>
          <View style={styles.radioRow}>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setSelectedStartDay(1)}
              activeOpacity={0.7}
            >
              <View style={styles.radioOuter}>
                {selectedStartDay === 1 && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioText}>Start from Day 1</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setSelectedStartDay(2)}
              activeOpacity={0.7}
            >
              <View style={styles.radioOuter}>
                {selectedStartDay === 2 && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioText}>Start from Day 2</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calendarWrapper}>
            <View style={styles.dateLabel}>
              <Text style={styles.dateLabelText}>{rangeLabel}</Text>
              <Text style={styles.islamicDateText}>{islamicRangeLabel}</Text>
            </View>

            <CalendarGrid
              mode="dawood"
              currentDate={currentDate}
              windowStartDate={
                calendarWindow?.startDate ?? startMoment.format("YYYY-MM-DD")
              }
              windowEndDate={
                calendarWindow?.endDate ?? endMoment.format("YYYY-MM-DD")
              }
              dawoodStartDay={selectedStartDay}
            />
          </View>
          <TopSpace top={16} />
          {/* Advisory Text */}
          <View style={styles.advisoryContainer}>
            <EvilIcons
              name="exclamation"
              size={24}
              color={Colors.light.grey}
              style={styles.advisoryIcon}
            />
            <Text style={styles.advisoryText}>
              If you miss a planned fast and then resume fasting, a new cycle (
              ) will begin. This helps you track the length of each cycle and
              encourages you to stick to the every-other-day fasting pattern
              within a single cycle.
            </Text>
          </View>

          {/* Value/Count text */}
          <Text style={styles.valueText}>
            {formatNumber(fastCount)}
            <Text style={styles.whiteText}> Prophet Dawood (AS) Fasts</Text>
          </Text>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <GoalSelectionSaveButton
              text="Save"
              onPress={handleSave}
              isLoading={isPending}
              disabled={isPending}
              style={styles.saveButton}
              textStyle={styles.saveButtonText}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 12,
    padding: 16,
    marginVertical: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleText: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    marginRight: 8,
  },
  icon: {
    marginLeft: 4,
    marginTop: -3,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    width: "100%",
    marginTop: 12,
  },
  expandedContent: {
    marginTop: 16,
    alignItems: "center",
    width: "100%",
    paddingBottom: 6,
  },
  calendarWrapper: {
    width: "100%",
    marginHorizontal: -16,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 16,
    width: "100%",
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.light.grey,
    backgroundColor: Colors.light.calendarBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 7,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.green,
  },
  radioText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    marginLeft: -1,
  },
  dateLabel: {
    alignItems: "center",
    backgroundColor: Colors.light.calendarBg,
    paddingVertical: 10,
    width: "100%",
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
  advisoryContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  advisoryIcon: {
    marginRight: 6,
  },
  advisoryText: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
    textAlign: "left",
    opacity: 0.5,
  },
  valueText: {
    color: Colors.light.ringDawood,
    fontFamily: fonts.primary.medium,
    fontSize: 16,
    fontWeight: "500",
    marginTop: 12,
    marginBottom: 25,
    textAlign: "center",
    lineHeight: 22,
  },
  whiteText: {
    color: Colors.light.white,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 6,
    alignItems: "center",
  },
  saveButton: {
    width: "100%",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
  },
});
