import React, { useMemo } from "react";
import { useGoalSelectionOpenState } from "@/hooks/useGoalSelectionOpenState";
import { useDiscardUnsavedOnCollapse } from "@/hooks/useDiscardUnsavedOnCollapse";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  LayoutAnimation,
} from "react-native";
import { ms } from "@/src/utils/responsive";
import { Feather } from "@expo/vector-icons";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { Colors } from "../../constants/theme";
import { fonts } from "../../assets/fonts";
import GoalSelectionSaveButton from "./GoalSelectionSaveButton";
import { useLocaleNumber } from "../../hooks/useLocaleNumber";
import RamadanCalendar from "./RamadanCalendar";
import {
  getFastingLegendItems,
  type FastingCalendarWindow,
} from "@/src/utils/fastingCalendarPreview";
import { useUpsertFastingGoals } from "@/src/api/mutations/useUpsertFastingGoals";
import { showToast } from "@/src/config/toastConfig";
import { TopSpace } from "../atoms/TopSpace";
import { useTranslation } from "react-i18next";

export default function MissedRamadanFastGoalSelection({
  calendarWindow,
  onSave,
  openOnMount = false,
  collapseSignal = 0,
  initiallySaved = false,
}: {
  calendarWindow?: FastingCalendarWindow | null;
  onSave?: (selectedDates: string[]) => void;
  openOnMount?: boolean;
  collapseSignal?: number;
  initiallySaved?: boolean;
}) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const { mutate: upsertFastingGoal, isPending } = useUpsertFastingGoals();
  const [isOpen, setIsOpen] = useGoalSelectionOpenState(openOnMount, undefined, collapseSignal);
  const seedDatesKey = (calendarWindow?.missedRamadanDates ?? [])
    .slice()
    .sort()
    .join(",");
  const seedDates = useMemo(
    () => [...(calendarWindow?.missedRamadanDates ?? [])],
    [seedDatesKey],
  );
  const [selectedDates, setSelectedDates, commitSaved] =
    useDiscardUnsavedOnCollapse(isOpen, seedDates);

  const legendItems = useMemo(
    () =>
      getFastingLegendItems(calendarWindow?.legendTypes ?? [], {
        forceInclude: ["MISSED_RAMADAN"],
      }),
    [calendarWindow?.legendTypes],
  );

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const handleSave = (markSaved: () => void, markFailed: () => void) => {
    if (selectedDates.length === 0) {
      showToast("error", "Select at least one missed Ramadan fast date");
      markFailed();
      return;
    }
    const toSave = [...selectedDates];
    upsertFastingGoal(
      {
        fastingType: "MISSED_RAMADAN",
        plannedDates: toSave,
        targetCount: toSave.length,
      },
      {
        onSuccess: () => {
          commitSaved(toSave);
          markSaved();
          onSave?.(toSave);
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
          Select how many missed Ramadan fasts to make up this month
        </Text>
        <Feather
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={ms(18)}
          color={Colors.light.white}
          style={styles.icon}
        />
      </TouchableOpacity>

      {isOpen && <View style={styles.divider} />}

      {isOpen && (
        <View style={styles.expandedContent}>
          {legendItems.length > 0 && (
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
                      ? "MISSED RAMADAN FASTS"
                      : item.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.calendarWrapper}>
            <RamadanCalendar
              hideFooter
              hideLegend
              calendarWindow={calendarWindow}
              selectedDates={selectedDates}
              onDatesChange={setSelectedDates}
            />
          </View>

          <TopSpace top={ms(16)} />
          <View style={styles.advisoryContainer}>
            <EvilIcons
              name="exclamation"
              size={ms(24)}
              color={Colors.light.grey}
              style={styles.advisoryIcon}
            />
            <Text style={styles.advisoryText}>
              If you miss your originally selected dates, you can make them up
              anytime in the month, as long as the new dates don’t overlap with
              other fasting goals.
            </Text>
          </View>

          <Text style={styles.valueText}>
            {formatNumber(selectedDates.length)}
            <Text style={styles.whiteText}>
              {t("monthlyGoalPlanner.missedRamadanFastSuffix", {
                count: selectedDates.length,
              })}
            </Text>
          </Text>

          <View style={styles.buttonContainer}>
            <GoalSelectionSaveButton
              text="Save"
              onPress={handleSave}
              isLoading={isPending}
              disabled={isPending || selectedDates.length === 0}
              style={styles.saveButton}
              textStyle={styles.saveButtonText}
              initiallySaved={
                initiallySaved ||
                (calendarWindow?.missedRamadanDates?.length ?? 0) > 0
              }
              valueKey={selectedDates.slice().sort().join(",")}
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
    borderRadius: ms(12),
    padding: ms(16),
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
    fontSize: ms(14),
    fontWeight: "500",
    lineHeight: ms(20),
    marginRight: ms(8),
  },
  icon: {
    marginLeft: ms(4),
    marginTop: ms(-3),
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    width: "100%",
    marginTop: ms(10),
  },
  expandedContent: {
    marginTop: ms(12),
    alignItems: "center",
    width: "100%",
    paddingBottom: ms(6),
  },
  calendarWrapper: {
    width: "100%",
    marginHorizontal: ms(-16),
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    gap: ms(10),
    marginTop: 0,
    marginBottom: ms(16),
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: ms(6),
  },
  legendRing: {
    width: ms(10),
    height: ms(10),
    borderRadius: ms(5),
    borderWidth: 1,
  },
  legendText: {
    fontSize: ms(10),
    fontWeight: "400",
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    letterSpacing: 0.5,
  },
  advisoryContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: ms(10),
    paddingHorizontal: ms(4),
  },
  advisoryIcon: {
    marginRight: ms(6),
  },
  advisoryText: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: ms(12),
    lineHeight: ms(16),
    textAlign: "left",
    opacity: 0.5,
  },
  valueText: {
    color: Colors.light.ringRamadan,
    fontFamily: fonts.primary.medium,
    fontSize: ms(16),
    fontWeight: "500",
    marginTop: ms(12),
    marginBottom: ms(25),
    textAlign: "center",
    lineHeight: ms(22),
  },
  whiteText: {
    color: Colors.light.white,
  },
  buttonContainer: {
    width: "100%",
    marginTop: ms(6),
    alignItems: "center",
  },
  saveButton: {
    width: "100%",
  },
  saveButtonText: {
    fontSize: ms(16),
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
  },
});
