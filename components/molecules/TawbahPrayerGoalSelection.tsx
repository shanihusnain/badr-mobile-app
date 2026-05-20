import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, LayoutAnimation, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import { fonts } from "../../assets/fonts";
import CustomSlider from "../atoms/CustomSlider";
import PrimaryButton from "../atoms/Primary-button";
import { useTranslation } from "react-i18next";
import { useLocaleNumber } from "../../hooks/useLocaleNumber";

export default function TawbahPrayerGoalSelection() {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const [sliderValue, setSliderValue] = useState(25);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const handleSave = () => {
    console.log("Saved target Tawbah Prayers:", sliderValue);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.headerRow} onPress={toggleDropdown} activeOpacity={0.7}>
        <Text style={styles.titleText}>
          {t("prayerGoals.tawbahTitle")}
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
          <CustomSlider
            maxDays={28}
            initialDays={sliderValue}
            onChange={(val) => setSliderValue(val)}
          />
          
          <Text style={styles.valueText}>
            {formatNumber(sliderValue)}
            <Text style={styles.whiteText}>{t("prayerGoals.tawbahSuffix")}</Text>
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
