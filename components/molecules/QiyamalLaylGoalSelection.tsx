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
import { useAuth } from "@/provider/useAuth";
import { TopSpace } from "../atoms/TopSpace";
import { PRAYER_CYCLE_DAYS } from "@/src/utils/prayerCycleUtils";

export default function QiyamalLaylGoalSelection({
  onSave,
  initialValues,
  isSaving = false,
}: {
  onSave?: (
    value: {
      commitment: "every_night" | "flexible";
      twoRakahPrayers: number;
      witrPrayers: number;
      trackTahajjud: "yes" | "no";
    },
    onDone?: () => void,
    onFail?: () => void,
  ) => void;
  initialValues?: {
    isFlexible?: boolean;
    unitTarget?: number;
    witrTarget?: number;
    trackTahajjud?: boolean;
  };
  isSaving?: boolean;
}) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const [isOpen, setIsOpen] = useState(false);
  const [commitment, setCommitment] = useState<"every_night" | "flexible">(
    initialValues?.isFlexible ? "flexible" : "every_night",
  );
  const [sliderValue, setSliderValue] = useState(
    initialValues?.unitTarget ?? 1,
  );
  const [trackTahajjud, setTrackTahajjud] = useState<"yes" | "no">(
    initialValues?.trackTahajjud ? "yes" : "no",
  );

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const handleSave = (markSaved: () => void, markFailed?: () => void) => {
    onSave?.(
      {
        commitment,
        twoRakahPrayers: sliderValue,
        witrPrayers: 28,
        trackTahajjud,
      },
      markSaved,
      markFailed,
    );
  };
  const { user } = useAuth();
  console.log("user gender in qiyam al layl goal selection", user?.gender);
  return (
    <View style={globalStyles.goalSelectionWrapper}>
      <GoalSelectionOpenCloseButton
        isOpen={isOpen}
        title={t("prayerGoals.qiyamTitle")}
        toggleDropdown={toggleDropdown}
      />

      {isOpen && <Divider />}

      {isOpen && (
        <View style={styles.expandedContent}>
          {user?.gender !== "MALE" && (
            <>
              <Text style={styles.greyDescription}>
                The target number of Witr prayers will automatically adjust if
                menstruation is logged from the home screen.
              </Text>
              <TopSpace top={10} />
            </>
          )}
          {/* STEP 1 */}
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>{t("prayerGoals.step1")}</Text>
          </View>
          <Text style={styles.stepTitle}>
            {t("prayerGoals.qiyamCommitQuestion")}
          </Text>
          <View style={styles.radioRow}>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setCommitment("every_night")}
              activeOpacity={0.7}
            >
              <View style={styles.radioOuter}>
                {commitment === "every_night" && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <Text style={styles.radioText}>
                {t("prayerGoals.commitEveryNight")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setCommitment("flexible")}
              activeOpacity={0.7}
            >
              <View style={styles.radioOuter}>
                {commitment === "flexible" && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <Text style={styles.radioText}>
                {t("prayerGoals.keepFlexible")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* STEP 2 */}
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>{t("prayerGoals.step2")}</Text>
          </View>
          <Text style={styles.stepTitle}>
            {t("prayerGoals.qiyamGoalQuestion")}
          </Text>
          <View style={styles.sliderContainer}>
            <CustomSlider
              maxDays={150}
              initialDays={sliderValue}
              onChange={(val) => setSliderValue(val)}
            />
          </View>

          {/* STEP 3 */}
          <View
            style={[
              styles.stepBadge,
              {
                marginTop: 0,
              },
            ]}
          >
            <Text style={styles.stepBadgeText}>{t("prayerGoals.step3")}</Text>
          </View>
          <Text style={styles.stepTitle}>
            {t("prayerGoals.qiyamTrackQuestion")}
          </Text>
          <View style={styles.radioCol}>
            <TouchableOpacity
              style={styles.radioOptionCol}
              onPress={() => setTrackTahajjud("yes")}
              activeOpacity={0.7}
            >
              <View style={styles.radioOuterCol}>
                {trackTahajjud === "yes" && (
                  <View style={styles.radioInnerCol} />
                )}
              </View>
              <Text style={styles.radioTextCol}>
                {t("prayerGoals.yes")}{" "}
                <Text style={styles.greyDescription}>
                  {t("prayerGoals.yesDesc")}
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioOptionCol}
              onPress={() => setTrackTahajjud("no")}
              activeOpacity={0.7}
            >
              <View style={styles.radioOuterCol}>
                {trackTahajjud === "no" && (
                  <View style={styles.radioInnerCol} />
                )}
              </View>
              <Text style={styles.radioTextCol}>
                {t("prayerGoals.no")}{" "}
                <Text style={styles.greyDescription}>
                  {t("prayerGoals.noDesc")}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Result / Save area */}
          <View style={styles.resultContainer}>
            <View style={{ alignItems: "center", paddingHorizontal: 46 }}>
              <Text style={styles.valueText}>
                {formatNumber(sliderValue)}
                <Text style={styles.whiteText}>
                  {sliderValue === 1
                    ? t("prayerGoals.rakahPrayer")
                    : t("prayerGoals.rakahPrayers")}
                </Text>
                {commitment === "every_night" ? (
                  <Text style={styles.whiteText}>
                    {t("prayerGoals.and28WitrBefore")}
                    <Text style={styles.greenCount}>
                      {formatNumber(PRAYER_CYCLE_DAYS)}
                    </Text>
                    {t("prayerGoals.and28WitrAfter")}
                  </Text>
                ) : (
                  <Text style={styles.whiteText}>
                    {t("prayerGoals.plusWitrFlexible")}
                  </Text>
                )}
              </Text>
              <Text style={styles.witrDescription}>
                {t("prayerGoals.witrDesc")}
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <GoalSelectionSaveButton
                text={t("prayerGoals.save")}
                onPress={handleSave}
                style={styles.saveButton}
                textStyle={styles.saveButtonText}
                isLoading={isSaving}
                disabled={isSaving}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  expandedContent: {
    marginTop: 10,
    width: "100%",
    paddingBottom: 6,
  },
  stepBadge: {
    backgroundColor: Colors.light.darkgrey,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    alignSelf: "flex-start",
    marginBottom: 6,
    marginTop: 10,
  },
  stepBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
  },
  stepTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    lineHeight: 15,
    marginBottom: 10,
    // letterSpacing: 0.1,
  },
  sliderContainer: {
    // marginTop: -9,
    // marginBottom: -13,
    paddingHorizontal: 10,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 20,
    marginVertical: 8,
    width: "100%",
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 8,
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
  },
  radioCol: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
    marginVertical: 8,
    width: "100%",
  },
  radioOptionCol: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  radioOuterCol: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.light.grey,
    backgroundColor: Colors.light.calendarBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  radioInnerCol: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.green,
  },
  radioTextCol: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
  },
  greyDescription: {
    color: Colors.light.dullDescriptionText,
    fontFamily: fonts.primary.regular,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "400",
  },
  resultContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  valueText: {
    color: Colors.light.green,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    textAlign: "center",
  },
  greenCount: {
    color: Colors.light.green,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    fontWeight: "500",
  },
  whiteText: {
    color: Colors.light.white,
  },
  witrDescription: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    fontSize: 10,
    textAlign: "left",
    paddingHorizontal: 10,
    marginBottom: 20,
    fontWeight: "400",
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
