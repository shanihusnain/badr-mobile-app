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
import PrimaryButton from "../atoms/Primary-button";
import { useTranslation } from "react-i18next";
import { useLocaleNumber } from "../../hooks/useLocaleNumber";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { GoalSelectionOpenCloseButton } from "./GoalSelectionOpenCloseButton";
import { Divider } from "../atoms/Divider";

export default function DuhaPrayerGoalSelection({
  onSave,
}: {
  onSave?: (value: number) => void;
}) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const [sliderValue, setSliderValue] = useState(40);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const handleSave = () => {
    console.log("Saved target Duha Prayers:", sliderValue);
    if (onSave) {
      onSave(sliderValue);
    }
  };

  return (
    <View style={globalStyles.goalSelectionWrapper}>
      <GoalSelectionOpenCloseButton
        isOpen={isOpen}
        title={t("prayerGoals.duhaTitle")}
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
            <Text style={styles.whiteText}>{t("prayerGoals.duhaSuffix")}</Text>
          </Text>

          <View style={styles.buttonContainer}>
            <PrimaryButton
              text={t("prayerGoals.save")}
              onPress={handleSave}
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
  },
  valueText: {
    color: Colors.light.green,
    fontFamily: fonts.primary.medium,
    fontSize: 18,
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
