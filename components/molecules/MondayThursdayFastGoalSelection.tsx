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
import GoalSelectionSaveButton from "./GoalSelectionSaveButton";
import { useLocaleNumber } from "../../hooks/useLocaleNumber";
import { MonThuCalendar } from "./MonThuCalendar";
import { TopSpace } from "../atoms/TopSpace";
import {
  getSelectableMonThuDates,
  type FastingCalendarWindow,
} from "@/src/utils/fastingCalendarPreview";
import { useUpsertFastingGoals } from "@/src/api/mutations/useUpsertFastingGoals";
import { showToast } from "@/src/config/toastConfig";

function initialMonThuDates(
  calendarWindow?: FastingCalendarWindow | null,
): string[] {
  const planned = calendarWindow?.monThuPlannedDates ?? [];
  if (planned.length > 0) return planned;
  return getSelectableMonThuDates(calendarWindow);
}

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
  const [selectedMonThuDates, setSelectedMonThuDates] = useState<string[]>(() =>
    initialMonThuDates(calendarWindow),
  );
  const monThuCount = selectedMonThuDates.length;

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const handleSave = (markSaved: () => void, markFailed: () => void) => {
    if (selectedMonThuDates.length === 0) {
      showToast("error", "Select at least one Monday or Thursday to fast");
      markFailed();
      return;
    }
    upsertFastingGoal(
      {
        fastingType: "MONDAY_THURSDAY",
        plannedDates: selectedMonThuDates,
        targetCount: selectedMonThuDates.length,
      },
      {
        onSuccess: () => {
          onSave?.(selectedMonThuDates);
          markSaved();
        },
        onError: () => markFailed(),
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
          size={18}
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
              initialSelectedDates={initialMonThuDates(calendarWindow)}
              onSave={setSelectedMonThuDates}
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
              If you don't fast on your selected dates, you can still complete
              your goal by fasting on any unscheduled Monday or Thursday, as
              long as they don’t overlap with other fasting goals.
            </Text>
          </View>

          <Text style={styles.valueText}>
            {formatNumber(monThuCount)}
            <Text style={styles.whiteText}> Monday & Thursday Fasts</Text>
          </Text>

          <View style={styles.buttonContainer}>
            <GoalSelectionSaveButton
              text="Save"
              onPress={handleSave}
              isLoading={isPending}
              disabled={isPending || selectedMonThuDates.length === 0}
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
    lineHeight: 16,
    fontWeight: "500",
    textAlign: "left",
    opacity: 0.5,
  },
  valueText: {
    color: Colors.light.ringMonThu,
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
