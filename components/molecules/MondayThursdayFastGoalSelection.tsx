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
import { MonThuCalendar } from "./MonThuCalendar";
import { TopSpace } from "../atoms/TopSpace";
import type { FastingCalendarWindow } from "@/src/utils/fastingCalendarPreview";
import { useUpsertFastingGoals } from "@/src/api/mutations/useUpsertFastingGoals";

export default function MondayThursdayFastGoalSelection({
  onSave,
  calendarWindow,
}: {
  onSave?: (selectedDates: string[]) => void;
  calendarWindow?: FastingCalendarWindow | null;
}) {
  const formatNumber = useLocaleNumber();
  const { mutate: upsertFastingGoal, isPending } = useUpsertFastingGoals();
  const [isOpen, setIsOpen] = useState(false);
  const [monThuCount, setMonThuCount] = useState(
    () => calendarWindow?.monThuPlannedDates.length ?? 0,
  );
  const [selectedMonThuDates, setSelectedMonThuDates] = useState<string[]>(
    () => calendarWindow?.monThuPlannedDates ?? [],
  );

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const handleSave = () => {
    // Empty plannedDates → backend auto-fills all Mon/Thu in the cycle
    upsertFastingGoal(
      {
        fastingType: "MONDAY_THURSDAY",
        ...(selectedMonThuDates.length > 0
          ? { plannedDates: selectedMonThuDates }
          : {}),
      },
      {
        onSuccess: () => onSave?.(selectedMonThuDates),
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
          Select the Mondays and Thursdays you aim to fast this month
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
            <MonThuCalendar
              calendarWindow={calendarWindow}
              missedRamadanDates={calendarWindow?.missedRamadanDates}
              initialSelectedDates={calendarWindow?.monThuPlannedDates}
              onSave={(selectedDates) => {
                setSelectedMonThuDates(selectedDates);
                setMonThuCount(selectedDates.length);
              }}
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
              You have the entire month to complete your fasting goal. If you
              happen to miss any planned fasting days, you can make them up on
              any Monday or Thursday that you have not already scheduled for
              fasting in this month.
            </Text>
          </View>

          <Text style={styles.valueText}>
            {formatNumber(monThuCount)}
            <Text style={styles.whiteText}> Monday & Thursday Fasts</Text>
          </Text>

          <View style={styles.buttonContainer}>
            <PrimaryButton
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
    color: Colors.light.ringMonThu,
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
