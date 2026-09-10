import React, { useState } from "react";
import { useGoalSelectionOpenState } from "@/hooks/useGoalSelectionOpenState";
import { StyleSheet, Text, View, LayoutAnimation } from "react-native";
import { Colors } from "../../constants/theme";
import { fonts } from "../../assets/fonts";
import CustomSlider from "../atoms/CustomSlider";
import GoalSelectionSaveButton from "./GoalSelectionSaveButton";
import { useTranslation } from "react-i18next";
import { useLocaleNumber } from "../../hooks/useLocaleNumber";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { GoalSelectionOpenCloseButton } from "./GoalSelectionOpenCloseButton";
import { Divider } from "../atoms/Divider";

export default function ShukarPrayerGoalSelection({
  onSave,
  initialValue = 1,
  isSaving = false,
  openOnMount = false,
}: {
  onSave?: (value: number, onDone?: () => void, onFail?: () => void) => void;
  isSaving?: boolean;
  openOnMount?: boolean;
  initialValue?: number;
}) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const [sliderValue, setSliderValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useGoalSelectionOpenState(openOnMount);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  return (
    <View style={globalStyles.goalSelectionWrapper}>
      <GoalSelectionOpenCloseButton
        isOpen={isOpen}
        title={t("prayerGoals.shukarTitle")}
        toggleDropdown={toggleDropdown}
      />

      {isOpen && <Divider />}

      {isOpen && (
        <View style={styles.expandedContent}>
          <CustomSlider
            maxDays={28}
            initialDays={sliderValue}
            onChange={(val) => setSliderValue(val)}
          />

          <Text style={styles.valueText}>
            {formatNumber(sliderValue)}
            <Text style={styles.whiteText}>
              {t("prayerGoals.shukarSuffix")}
            </Text>
          </Text>

          <View style={styles.buttonContainer}>
            <GoalSelectionSaveButton
              text={t("prayerGoals.save").toLocaleUpperCase()}
              onPress={(markSaved, markFailed) => {
                const handleSaved = () => {
                  markSaved?.();
                  setTimeout(() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setIsOpen(false);
                  }, 2000);
                };
                onSave?.(sliderValue, handleSaved, markFailed);
              }}
              isLoading={isSaving}
              disabled={isSaving}
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
  expandedContent: {
    marginTop: 16,
    alignItems: "center",
    width: "100%",
    paddingBottom: 6,
  },
  valueText: {
    color: Colors.light.green,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 20,
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
