import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import { fonts } from "../../assets/fonts";
import CustomSlider from "../atoms/CustomSlider";
import GoalSelectionSaveButton from "./GoalSelectionSaveButton";
import { useTranslation } from "react-i18next";
import { useLocaleNumber } from "../../hooks/useLocaleNumber";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { GoalSelectionOpenCloseButton } from "./GoalSelectionOpenCloseButton";
import { Divider } from "../atoms/Divider";

export default function TahiyatWuduGoalSelection({
  onSave,
  initialValue = 25,
  isSaving = false,
}: {
  onSave?: (value: number, onDone?: () => void, onFail?: () => void) => void;
  initialValue?: number;
  isSaving?: boolean;
}) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const [sliderValue, setSliderValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  return (
    <View
      style={[
        globalStyles.goalSelectionWrapper,
        {
          paddingBottom: isOpen ? 6 : 10,
        }
      ]}
    >
      <GoalSelectionOpenCloseButton
        isOpen={isOpen}
        title={t("prayerGoals.tahiyaWuduTitle")}
        toggleDropdown={toggleDropdown}
      />
      {isOpen && <Divider />}

      {isOpen && (
        <View style={styles.expandedContent}>
          <CustomSlider
            maxDays={100}
            initialDays={sliderValue}
            onChange={(val) => setSliderValue(val)}
          />

          <Text style={styles.valueText}>
            {formatNumber(sliderValue)}
            <Text style={styles.whiteText}>
              {t("prayerGoals.tahiyaWuduSuffix")}
            </Text>
          </Text>

          <View style={styles.buttonContainer}>
            <GoalSelectionSaveButton
              text={t("prayerGoals.save").toLocaleUpperCase()}
              onPress={(markSaved, markFailed) => {
                onSave?.(sliderValue, markSaved, markFailed);
              }}
              style={styles.saveButton}
              textStyle={styles.saveButtonText}
              isLoading={isSaving}
              disabled={isSaving}
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
    marginTop: -9,
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
