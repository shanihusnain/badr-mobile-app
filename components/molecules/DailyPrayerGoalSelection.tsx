import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, LayoutAnimation } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSharedValue } from "react-native-reanimated";
import { Colors } from "../../constants/theme";
import { fonts } from "../../assets/fonts";
import CustomSlider from "../atoms/CustomSlider";
import PrimaryButton from "../atoms/Primary-button";
import { SwitchButton } from "../atoms/SwitchButton";
import { useTranslation } from "react-i18next";
import { useLocaleNumber } from "../../hooks/useLocaleNumber";

const PRAYER_SLIDERS = [
  { key: "fajr" as const, labelKey: "prayerGoals.fajr", maxDays: 28 },
  {
    key: "dhuhr" as const,
    labelKey: "prayerGoals.dhuhr",
    maxDaysDaily: 28,
    maxDaysCongregation: 24,
  },
  { key: "asar" as const, labelKey: "prayerGoals.asr", maxDays: 28 },
  { key: "maghrib" as const, labelKey: "prayerGoals.maghrib", maxDays: 28 },
  { key: "isha" as const, labelKey: "prayerGoals.isha", maxDays: 28 },
];

type PrayerKey = (typeof PRAYER_SLIDERS)[number]["key"];

export default function DailyPrayerGoalSelection() {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const [isOpen, setIsOpen] = useState(false);
  const [isCongregationMode, setIsCongregationMode] = useState(false);
  const trackCongregation = useSharedValue(false);

  const [dailyPrayers, setDailyPrayers] = useState<Record<PrayerKey, number>>({
    fajr: 28,
    dhuhr: 28,
    asar: 28,
    maghrib: 28,
    isha: 28,
  });

  const [congregationPrayers, setCongregationPrayers] = useState<
    Record<PrayerKey, number>
  >({
    fajr: 28,
    dhuhr: 24,
    asar: 28,
    maghrib: 28,
    isha: 28,
  });

  const [jumuah, setJumuah] = useState(4);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const handleCongregationSwitch = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newValue = !trackCongregation.value;
    trackCongregation.value = newValue;
    setIsCongregationMode(newValue);
  };

  const handleSave = () => {
    if (isCongregationMode) {
      console.log("Saved target Congregation Prayers:", {
        ...congregationPrayers,
        jumuah,
      });
    } else {
      console.log("Saved target Daily Prayers:", dailyPrayers);
    }
  };

  const activePrayers = isCongregationMode ? congregationPrayers : dailyPrayers;
  const setActivePrayer = (key: PrayerKey, value: number) => {
    if (isCongregationMode) {
      setCongregationPrayers((prev) => ({ ...prev, [key]: value }));
    } else {
      setDailyPrayers((prev) => ({ ...prev, [key]: value }));
    }
  };

  const totalPrayers = isCongregationMode
    ? congregationPrayers.fajr +
      congregationPrayers.dhuhr +
      congregationPrayers.asar +
      congregationPrayers.maghrib +
      congregationPrayers.isha +
      jumuah
    : dailyPrayers.fajr +
      dailyPrayers.dhuhr +
      dailyPrayers.asar +
      dailyPrayers.maghrib +
      dailyPrayers.isha;

  const getMaxDays = (slider: (typeof PRAYER_SLIDERS)[number]) => {
    if (slider.key === "dhuhr") {
      return isCongregationMode ? slider.maxDaysCongregation : slider.maxDaysDaily;
    }
    return slider.maxDays;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <Text style={styles.titleText}>{t("prayerGoals.dailyPrayersTitle")}</Text>
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
          <View style={styles.prayerContent}>
            {PRAYER_SLIDERS.map((slider) => (
              <View key={slider.key} style={styles.sliderGroup}>
                <Text style={styles.sliderHeading}>{t(slider.labelKey)}</Text>
                <CustomSlider
                  key={`${slider.key}-${isCongregationMode}`}
                  maxDays={getMaxDays(slider)}
                  initialDays={activePrayers[slider.key]}
                  onChange={(val) => setActivePrayer(slider.key, val)}
                />
                {isCongregationMode && slider.key === "dhuhr" && (
                  <Text style={styles.dhuhrFridayNote}>
                    {t("prayerGoals.dhuhrFridayNote")}
                  </Text>
                )}
              </View>
            ))}

            {isCongregationMode && (
              <View style={styles.sliderGroup}>
                <Text style={styles.sliderHeading}>{t("prayerGoals.jumuah")}</Text>
                <CustomSlider
                  key="jumuah"
                  maxDays={4}
                  initialDays={jumuah}
                  onChange={(val) => setJumuah(val)}
                />
              </View>
            )}
          </View>

          <View style={styles.resultContainer}>
            <Text style={styles.valueText}>
              {formatNumber(totalPrayers)}
              <Text style={styles.whiteText}>
                {isCongregationMode
                  ? t("prayerGoals.congregationSuffix")
                  : t("prayerGoals.dailyPrayersSuffix")}
              </Text>
            </Text>

            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={styles.trackText}>
                  {t("prayerGoals.trackCongregation")}
                </Text>
                {isCongregationMode && (
                  <Text style={styles.switchDescText}>
                    {t("prayerGoals.trackCongregationDesc")}
                  </Text>
                )}
              </View>
              <SwitchButton
                value={trackCongregation}
                onPress={handleCongregationSwitch}
                size="small"
                style={styles.congregationSwitch}
              />
            </View>

            <View style={styles.buttonContainer}>
              <PrimaryButton
                text={t("prayerGoals.save")}
                onPress={handleSave}
                style={styles.saveButton}
                textStyle={styles.saveButtonText}
              />
            </View>
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
    backgroundColor: Colors.light.dullWhiteOpacity,
    width: "100%",
    marginTop: 12,
  },
  expandedContent: {
    marginTop: 16,
    width: "100%",
  },
  prayerContent: {
    width: "100%",
    alignItems: "center",
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
  dhuhrFridayNote: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 10,
    fontWeight: "400",
    lineHeight: 14,
    textAlign: "left",
    marginTop: -18,
    marginBottom: 0,
  },
  resultContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 4,
  },
  valueText: {
    color: Colors.light.green,
    fontFamily: fonts.primary.medium,
    fontSize: 18,
    fontWeight: "500",
    marginTop: -9,
    marginBottom: 20,
    textAlign: "center",
  },
  whiteText: {
    color: Colors.light.white,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
    gap: 12,
  },
  switchTextContainer: {
    flex: 1,
  },
  trackText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "left",
  },
  switchDescText: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    fontSize: 10,
    fontWeight: "400",
    textAlign: "left",
    marginTop: 4,
    lineHeight: 14,
  },
  congregationSwitch: {
    flexShrink: 0,
  },
  buttonContainer: {
    width: "100%",
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
