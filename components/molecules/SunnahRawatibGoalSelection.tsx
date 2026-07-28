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
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import CustomSlider from "@/components/atoms/CustomSlider";
import PrimaryButton from "@/components/atoms/Primary-button";
import { useTranslation } from "react-i18next";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { GoalSelectionOpenCloseButton } from "./GoalSelectionOpenCloseButton";
import { Divider } from "../atoms/Divider";

export default function SunnahRawatibGoalSelection({
  onSave,
  initialValues,
}: {
  onSave?: (payload: {
    beforeFajr: number;
    beforeDhuhr: number;
    afterDhuhr: number;
    afterDhuhrRakahOption: number;
    beforeAsrEnabled: boolean;
    beforeAsr: number;
    beforeAsrRakahOption: number;
    afterMaghrib: number;
    afterIsha: number;
  }) => void;
  initialValues?: {
    beforeFajr?: number;
    beforeDhuhr?: number;
    afterDhuhr?: number;
    beforeAsr?: number;
    afterMaghrib?: number;
    afterIsha?: number;
    afterDhuhrRakahOption?: number;
    beforeAsrEnabled?: boolean;
    beforeAsrRakahOption?: number;
  };
}) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const [beforeFajar, setBeforeFajar] = useState(initialValues?.beforeFajr ?? 28);
  const [beforeDuhr, setBeforeDuhr] = useState(
    initialValues?.beforeDhuhr ?? 56,
  );
  const [afterDuhr, setAfterDuhr] = useState(initialValues?.afterDhuhr ?? 56);
  const [beforeAsar, setBeforeAsar] = useState(initialValues?.beforeAsr ?? 56);
  const [afterMaghrib, setAfterMaghrib] = useState(
    initialValues?.afterMaghrib ?? 28,
  );
  const [afterIsha, setAfterIsha] = useState(initialValues?.afterIsha ?? 28);
  const [afterDuhrOption, setAfterDuhrOption] = useState<"one" | "two">(
    initialValues?.afterDhuhrRakahOption === 1 ? "one" : "two",
  );
  const [beforeAsarOption, setBeforeAsarOption] = useState<"one" | "two">(
    initialValues?.beforeAsrRakahOption === 1 ? "one" : "two",
  );
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };
  console.log("the prayer after dhuhur state is", afterDuhr);
  const handleAfterDuhrOptionChange = (option: "one" | "two") => {
    setAfterDuhrOption(option);

    const maxVal = option === "one" ? 28 : 56;
    if (option === "one") {
      setAfterDuhr(28);
    } else {
      setAfterDuhr(56);
    }
  };

  const handleBeforeAsarOptionChange = (option: "one" | "two") => {
    setBeforeAsarOption(option);
    const maxVal = option === "one" ? 28 : 56;
    if (option === "one") {
      setBeforeAsar(28);
    } else {
      setBeforeAsar(56);
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
      afterDuhrOption,
      beforeAsarOption,
    });
    if (onSave) {
      onSave({
        beforeFajr: beforeFajar,
        beforeDhuhr: beforeDuhr,
        afterDhuhr: afterDuhr,
        afterDhuhrRakahOption: afterDuhrOption === "one" ? 1 : 2,
        beforeAsrEnabled: true,
        beforeAsr: beforeAsar,
        beforeAsrRakahOption: beforeAsarOption === "one" ? 1 : 2,
        afterMaghrib: afterMaghrib,
        afterIsha: afterIsha,
      });
    }
  };

  const totalPrayers =
    beforeFajar +
    beforeDuhr +
    afterDuhr +
    beforeAsar +
    afterMaghrib +
    afterIsha;

  return (
    <View style={globalStyles.goalSelectionWrapper}>
      <GoalSelectionOpenCloseButton
        isOpen={isOpen}
        title={t("prayerGoals.sunnahTitle")}
        toggleDropdown={toggleDropdown}
      />

      {isOpen && <Divider />}

      {isOpen && (
        <View style={styles.expandedContent}>
          {/* Before Fajar */}
          <View style={styles.sliderGroup}>
            <Text style={styles.sliderHeading}>
              {t("prayerGoals.beforeFajrHeading")}{" "}
            </Text>
            <CustomSlider
              maxDays={28}
              initialDays={beforeFajar}
              onChange={(val) => setBeforeFajar(val)}
              locked={true}
            />
          </View>

          {/* Before Duhr */}
          <View style={styles.sliderGroup}>
            <Text style={styles.sliderHeading}>
              {t("prayerGoals.beforeDhuhrHeading")}{" "}
            </Text>
            <CustomSlider
              maxDays={56}
              initialDays={beforeDuhr}
              onChange={(val) => setBeforeDuhr(val)}
              locked={true}
            />
          </View>

          {/* After Duhr */}
          <View style={styles.sliderGroup}>
            <Text style={styles.sliderHeading}>
              {t("prayerGoals.afterDhuhrHeading")}
            </Text>
            <View style={styles.radioRow}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => handleAfterDuhrOptionChange("one")}
                activeOpacity={0.7}
              >
                <View style={styles.radioOuter}>
                  {afterDuhrOption === "one" && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.radioText}>
                  {t("prayerGoals.oneRakahOption")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => handleAfterDuhrOptionChange("two")}
                activeOpacity={0.7}
              >
                <View style={styles.radioOuter}>
                  {afterDuhrOption === "two" && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.radioText}>
                  {t("prayerGoals.twoRakahOption")}
                </Text>
              </TouchableOpacity>
            </View>
            <CustomSlider
              maxDays={afterDuhrOption === "one" ? 28 : 56}
              initialDays={afterDuhr}
              onChange={(val) => setAfterDuhr(val)}
              locked={true}
            />
          </View>

          {/* Before Asar */}
          <View style={styles.sliderGroup}>
            <Text style={styles.sliderHeading}>
              {t("prayerGoals.beforeAsrHeading")}
            </Text>
            <View style={styles.radioRow}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => handleBeforeAsarOptionChange("one")}
                activeOpacity={0.7}
              >
                <View style={styles.radioOuter}>
                  {beforeAsarOption === "one" && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.radioText}>
                  {t("prayerGoals.oneRakahOption")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => handleBeforeAsarOptionChange("two")}
                activeOpacity={0.7}
              >
                <View style={styles.radioOuter}>
                  {beforeAsarOption === "two" && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.radioText}>
                  {t("prayerGoals.twoRakahOption")}
                </Text>
              </TouchableOpacity>
            </View>
            <CustomSlider
              maxDays={beforeAsarOption === "one" ? 28 : 56}
              initialDays={beforeAsar}
              onChange={(val) => setBeforeAsar(val)}
              locked={true}
            />
          </View>

          {/* After Maghrib */}
          <View style={styles.sliderGroup}>
            <Text style={styles.sliderHeading}>
              {t("prayerGoals.afterMaghribHeading")}
            </Text>
            <CustomSlider
              maxDays={28}
              initialDays={afterMaghrib}
              onChange={(val) => setAfterMaghrib(val)}
              locked={true}
            />
          </View>

          {/* After Isha */}
          <View style={styles.sliderGroup}>
            <Text style={styles.sliderHeading}>
              {t("prayerGoals.afterIshaHeading")}
            </Text>
            <CustomSlider
              maxDays={28}
              initialDays={afterIsha}
              onChange={(val) => setAfterIsha(val)}
              locked={true}
            />
          </View>

          <Text style={styles.valueText}>
            {formatNumber(totalPrayers)}
            <Text style={styles.whiteText}>
              {t("prayerGoals.sunnahSuffix")}
            </Text>
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
