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

export default function CongregationalPrayerGoalSelection() {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const [fajr, setFajr] = useState(28);
  const [dhuhr, setDhuhr] = useState(24);
  const [asar, setAsar] = useState(28);
  const [maghrib, setMaghrib] = useState(28);
  const [isha, setIsha] = useState(28);
  const [jumuah, setJumuah] = useState(4);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const handleSave = () => {
    console.log("Saved target Congregation Prayers:", {
      fajr,
      dhuhr,
      asar,
      maghrib,
      isha,
      jumuah,
    });
  };

  const totalPrayers = fajr + dhuhr + asar + maghrib + isha + jumuah;

  return (
    <View style={globalStyles.goalSelectionWrapper}>
      {/* <TouchableOpacity style={styles.headerRow} onPress={toggleDropdown} activeOpacity={0.7}>
        <Text style={styles.titleText}>
          {t("prayerGoals.congregationTitle")}
        </Text>
        <Feather
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={24}
          color={Colors.light.white}
          style={styles.icon}
        />
      </TouchableOpacity> */}
      <GoalSelectionOpenCloseButton
        isOpen={isOpen}
        title={t("prayerGoals.congregationTitle")}
        toggleDropdown={toggleDropdown}
      />

      {/* {isOpen && <View style={styles.divider} />} */}
      {isOpen && <Divider />}

      {isOpen && (
        <View style={styles.expandedContent}>
          {/* Fajr */}
          <View style={styles.sliderGroup}>
            <Text style={styles.sliderHeading}>{t("prayerGoals.fajr")}</Text>
            <CustomSlider
              maxDays={28}
              initialDays={fajr}
              onChange={(val) => setFajr(val)}
            />
          </View>

          {/* Dhuhr */}
          <View style={styles.sliderGroup}>
            <Text style={styles.sliderHeading}>{t("prayerGoals.dhuhr")}</Text>
            <CustomSlider
              maxDays={24}
              initialDays={dhuhr}
              onChange={(val) => setDhuhr(val)}
            />
          </View>

          {/* Asar */}
          <View style={styles.sliderGroup}>
            <Text style={styles.sliderHeading}>{t("prayerGoals.asr")}</Text>
            <CustomSlider
              maxDays={28}
              initialDays={asar}
              onChange={(val) => setAsar(val)}
            />
          </View>

          {/* Maghrib */}
          <View style={styles.sliderGroup}>
            <Text style={styles.sliderHeading}>{t("prayerGoals.maghrib")}</Text>
            <CustomSlider
              maxDays={28}
              initialDays={maghrib}
              onChange={(val) => setMaghrib(val)}
            />
          </View>

          {/* Isha */}
          <View style={styles.sliderGroup}>
            <Text style={styles.sliderHeading}>{t("prayerGoals.isha")}</Text>
            <CustomSlider
              maxDays={28}
              initialDays={isha}
              onChange={(val) => setIsha(val)}
            />
          </View>

          {/* Jumu'ah Prayer */}
          <View style={styles.sliderGroup}>
            <Text style={styles.sliderHeading}>{t("prayerGoals.jumuah")}</Text>
            <CustomSlider
              maxDays={4}
              initialDays={jumuah}
              onChange={(val) => setJumuah(val)}
            />
          </View>

          <Text style={styles.valueText}>
            {formatNumber(totalPrayers)}
            <Text style={styles.whiteText}>
              {t("prayerGoals.congregationSuffix")}
            </Text>
          </Text>

          <Text style={styles.trackText}>
            {t("prayerGoals.trackCongregation")}
          </Text>

          <Text style={styles.switchText}>
            {t("prayerGoals.trackCongregationDesc")}
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

  expandedContent: {
    marginTop: 16,
    alignItems: "center",
    width: "100%",
  },
  sliderGroup: {
    width: "100%",
    marginBottom: 10,
  },
  sliderHeading: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    alignSelf: "flex-start",
    textAlign: "left",
    marginBottom: 4,
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
  trackText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    alignSelf: "flex-start",
    textAlign: "left",
    marginTop: -16,
    marginBottom: 16,
  },
  switchText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 10,
    fontWeight: "400",
    alignSelf: "flex-start",
    textAlign: "left",
    marginTop: -12,
    marginBottom: 16,
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
