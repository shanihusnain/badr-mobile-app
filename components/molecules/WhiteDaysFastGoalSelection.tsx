import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  LayoutAnimation,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { Colors } from "../../constants/theme";
import { fonts } from "../../assets/fonts";
import PrimaryButton from "../atoms/Primary-button";
import { useLocaleNumber } from "../../hooks/useLocaleNumber";
import { WhiteDaysCalendar } from "./WhiteDaysCalendar";
import type { FastingCalendarWindow } from "@/src/utils/fastingCalendarPreview";
import { useUpsertFastingGoals } from "@/src/api/mutations/useUpsertFastingGoals";
import { showToast } from "@/src/config/toastConfig";
import { TopSpace } from "../atoms/TopSpace";

export default function WhiteDaysFastGoalSelection({
  calendarWindow,
  onSave,
}: {
  calendarWindow?: FastingCalendarWindow | null;
  onSave?: (selectedDates: string[]) => void;
}) {
  const formatNumber = useLocaleNumber();
  const { mutate: upsertFastingGoal, isPending } = useUpsertFastingGoals();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>(
    () => calendarWindow?.whiteDaysPlannedDates ?? [],
  );

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const handleSave = () => {
    if (selectedDates.length === 0) {
      showToast("error", "Select at least one White Day to fast");
      return;
    }
    upsertFastingGoal(
      {
        fastingType: "WHITE_DAYS",
        plannedDates: selectedDates,
        targetCount: selectedDates.length,
      },
      {
        onSuccess: () => onSave?.(selectedDates),
      },
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <Text style={styles.titleText}>
          Select the White Days you aim to fast this month
        </Text>
        <Feather
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={24}
          color={Colors.light.white}
          style={styles.icon}
        />
      </TouchableOpacity>

      {isOpen && <View style={styles.divider} />}

      {isOpen && (
        <View style={styles.expandedContent}>
          <View style={styles.calendarWrapper}>
            <WhiteDaysCalendar
              hideFooter
              calendarWindow={calendarWindow}
              missedRamadanDates={calendarWindow?.missedRamadanDates}
              initialSelectedDates={calendarWindow?.whiteDaysPlannedDates}
              onDatesChange={setSelectedDates}
            />
          </View>
          <TopSpace top={16} />
          <View style={styles.advisoryContainer}>
            <EvilIcons
              name="exclamation"
              size={24}
              color={Colors.light.grey}
              style={styles.advisoryIcon}
            />
            <Text style={styles.advisoryText}>
              The White Days are the 13th, 14th and 15th of each Islamic month.
              Tap to select one, two, or all three. Dates already used by other
              fasting goals are dimmed and cannot be selected.
            </Text>
          </View>

          <Text style={styles.valueText}>
            {formatNumber(selectedDates.length)}
            <Text style={styles.whiteText}> White Days Fasts</Text>
          </Text>

          <View style={styles.buttonContainer}>
            <PrimaryButton
              text="Save"
              onPress={handleSave}
              isLoading={isPending}
              disabled={isPending || selectedDates.length === 0}
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
    marginVertical: 10,
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
  },
  calendarWrapper: {
    width: "100%",
    marginHorizontal: -16,
  },
  advisoryContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    marginTop: -20,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  advisoryIcon: {
    marginTop: -1,
    marginRight: 6,
  },
  advisoryText: {
    flex: 1,
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "left",
  },
  valueText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 18,
    fontWeight: "500",
    marginTop: 12,
    marginBottom: 25,
    textAlign: "center",
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
