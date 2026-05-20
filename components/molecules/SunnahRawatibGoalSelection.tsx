import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, LayoutAnimation, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import CustomSlider from "@/components/atoms/CustomSlider";
import PrimaryButton from "@/components/atoms/Primary-button";
import { useTranslation } from "react-i18next";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";

export default function SunnahRawatibGoalSelection() {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const [beforeFajar, setBeforeFajar] = useState(28);
  const [beforeDuhr, setBeforeDuhr] = useState(56);
  const [afterDuhr, setAfterDuhr] = useState(56);
  const [beforeAsar, setBeforeAsar] = useState(56);
  const [afterMaghrib, setAfterMaghrib] = useState(28);
  const [afterIsha, setAfterIsha] = useState(28);
  const [afterDuhrOption, setAfterDuhrOption] = useState<"one" | "two">("two");
  const [beforeAsarOption, setBeforeAsarOption] = useState<"one" | "two">("two");
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const handleAfterDuhrOptionChange = (option: "one" | "two") => {
    setAfterDuhrOption(option);
    const maxVal = option === "one" ? 28 : 56;
    if (afterDuhr > maxVal) {
      setAfterDuhr(maxVal);
    }
  };

  const handleBeforeAsarOptionChange = (option: "one" | "two") => {
    setBeforeAsarOption(option);
    const maxVal = option === "one" ? 28 : 56;
    if (beforeAsar > maxVal) {
      setBeforeAsar(maxVal);
    }
  };

  const handleSave = () => {
    console.log("Saved target Sunnah Rawatib prayers:", {
      beforeFajar,
      beforeDuhr,
      afterDuhr,
      beforeAsar,
      afterMaghrib,
      afterIsha,
    });
  };

  const totalPrayers = beforeFajar + beforeDuhr + afterDuhr + beforeAsar + afterMaghrib + afterIsha;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.headerRow} onPress={toggleDropdown} activeOpacity={0.7}>
        <Text style={styles.titleText}>
          {t("prayerGoals.sunnahTitle")}
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
          {/* Before Fajar */}
          <View style={styles.sliderGroup}>
            <Text style={styles.sliderHeading}>{t("prayerGoals.beforeFajrHeading")} </Text>
            <CustomSlider
              maxDays={28}
              initialDays={beforeFajar}
              onChange={(val) => setBeforeFajar(val)}
            />
          </View>

          {/* Before Duhr */}
          <View style={styles.sliderGroup}>
            <Text style={styles.sliderHeading}>{t("prayerGoals.beforeDhuhrHeading")} </Text>
            <CustomSlider
              maxDays={56}
              initialDays={beforeDuhr}
              onChange={(val) => setBeforeDuhr(val)}
            />
          </View>

          {/* After Duhr */}
          <View style={styles.sliderGroup}>
            <Text style={styles.sliderHeading}>{t("prayerGoals.afterDhuhrHeading")}</Text>
            <View style={styles.radioRow}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => handleAfterDuhrOptionChange("one")}
                activeOpacity={0.7}
              >
                <View style={styles.radioOuter}>
                  {afterDuhrOption === "one" && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>{t("prayerGoals.oneRakahOption")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => handleAfterDuhrOptionChange("two")}
                activeOpacity={0.7}
              >
                <View style={styles.radioOuter}>
                  {afterDuhrOption === "two" && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>{t("prayerGoals.twoRakahOption")}</Text>
              </TouchableOpacity>
            </View>
            <CustomSlider
              maxDays={afterDuhrOption === "one" ? 28 : 56}
              initialDays={afterDuhr}
              onChange={(val) => setAfterDuhr(val)}
            />
          </View>

          {/* Before Asar */}
          <View style={styles.sliderGroup}>
            <Text style={styles.sliderHeading}>{t("prayerGoals.beforeAsrHeading")}</Text>
            <View style={styles.radioRow}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => handleBeforeAsarOptionChange("one")}
                activeOpacity={0.7}
              >
                <View style={styles.radioOuter}>
                  {beforeAsarOption === "one" && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>{t("prayerGoals.oneRakahOption")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => handleBeforeAsarOptionChange("two")}
                activeOpacity={0.7}
              >
                <View style={styles.radioOuter}>
                  {beforeAsarOption === "two" && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>{t("prayerGoals.twoRakahOption")}</Text>
              </TouchableOpacity>
            </View>
            <CustomSlider
              maxDays={beforeAsarOption === "one" ? 28 : 56}
              initialDays={beforeAsar}
              onChange={(val) => setBeforeAsar(val)}
            />
          </View>

          {/* After Maghrib */}
          <View style={styles.sliderGroup}>
            <Text style={styles.sliderHeading}>{t("prayerGoals.afterMaghribHeading")}</Text>
            <CustomSlider
              maxDays={28}
              initialDays={afterMaghrib}
              onChange={(val) => setAfterMaghrib(val)}
            />
          </View>

          {/* After Isha */}
          <View style={styles.sliderGroup}>
            <Text style={styles.sliderHeading}>{t("prayerGoals.afterIshaHeading")}</Text>
            <CustomSlider
              maxDays={28}
              initialDays={afterIsha}
              onChange={(val) => setAfterIsha(val)}
            />
          </View>
          
          <Text style={styles.valueText}>
            {formatNumber(totalPrayers)}
            <Text style={styles.whiteText}>{t("prayerGoals.sunnahSuffix")}</Text>
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
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    width: "100%",
    marginTop: 12,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 20,
    marginVertical: 10,
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
