import React, { useCallback, useState } from "react";
import { useGoalSelectionOpenState } from "@/hooks/useGoalSelectionOpenState";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  LayoutAnimation,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import CustomSlider from "@/components/atoms/CustomSlider";
import GoalSelectionSaveButton from "./GoalSelectionSaveButton";
import { useTranslation } from "react-i18next";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { GoalSelectionOpenCloseButton } from "./GoalSelectionOpenCloseButton";
import { Divider } from "../atoms/Divider";
import { SwitchButton } from "../atoms/SwitchButton";
import { TopSpace } from "../atoms/TopSpace";
import { useAuth } from "@/provider/useAuth";

function RadioOption({
  selected,
  label,
  onPress,
  disabled,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.radioOption}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
      <Text style={styles.radioText}>{label}</Text>
    </TouchableOpacity>
  );
}

function SliderHeading({
  text,
  style,
}: {
  text: string;
  style?: object | object[];
}) {
  const parenIndex = text.indexOf("(");
  if (parenIndex <= 0) {
    return <Text style={[styles.sliderHeading, style]}>{text}</Text>;
  }

  const main = text.slice(0, parenIndex);
  const parenthetical = text.slice(parenIndex);

  return (
    <Text style={[styles.sliderHeading, style]}>
      {main}
      <Text style={styles.sliderHeadingParen}>{parenthetical}</Text>
    </Text>
  );
}

export default function SunnahRawatibGoalSelection({
  onSave,
  initialValues,
  isSaving = false,
  openOnMount = false,
}: {
  onSave?: (
    payload: {
      beforeFajr: number;
      beforeDhuhr: number;
      afterDhuhr: number;
      afterDhuhrRakahOption: number;
      beforeAsrEnabled: boolean;
      beforeAsr: number;
      beforeAsrRakahOption: number;
      afterMaghrib: number;
      afterIsha: number;
    },
    onDone?: () => void,
    onFail?: () => void,
  ) => void;
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
  isSaving?: boolean;
  openOnMount?: boolean;
}) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const [beforeFajar, setBeforeFajar] = useState(
    initialValues?.beforeFajr ?? 28,
  );
  const [beforeDuhr, setBeforeDuhr] = useState(
    initialValues?.beforeDhuhr ?? 56,
  );
  const { user } = useAuth();
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
  const [isBeforeAsarEnabled, setIsBeforeAsarEnabled] = useState(
    initialValues?.beforeAsrEnabled ?? true,
  );
  const beforeAsarEnabled = useSharedValue(
    initialValues?.beforeAsrEnabled ?? true,
  );
  const [isOpen, setIsOpen] = useGoalSelectionOpenState(openOnMount);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const handleToggleBeforeAsar = useCallback(() => {
    const nextValue = !isBeforeAsarEnabled;
    beforeAsarEnabled.value = nextValue;
    setIsBeforeAsarEnabled(nextValue);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [beforeAsarEnabled, isBeforeAsarEnabled]);

  const handleAfterDuhrOptionChange = (option: "one" | "two") => {
    setAfterDuhrOption(option);
    if (option === "one") {
      setAfterDuhr(28);
    } else {
      setAfterDuhr(56);
    }
  };

  const handleBeforeAsarOptionChange = (option: "one" | "two") => {
    setBeforeAsarOption(option);
    if (option === "one") {
      setBeforeAsar(28);
    } else {
      setBeforeAsar(56);
    }
  };

  const handleSave = (markSaved: () => void, markFailed?: () => void) => {
    const handleSavedSuccess = () => {
      markSaved();
      setTimeout(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsOpen(false);
      }, 2000);
    };
    onSave?.(
      {
        beforeFajr: beforeFajar,
        beforeDhuhr: beforeDuhr,
        afterDhuhr: afterDuhr,
        afterDhuhrRakahOption: afterDuhrOption === "one" ? 1 : 2,
        beforeAsrEnabled: isBeforeAsarEnabled,
        beforeAsr: isBeforeAsarEnabled ? beforeAsar : 0,
        beforeAsrRakahOption: beforeAsarOption === "one" ? 1 : 2,
        afterMaghrib: afterMaghrib,
        afterIsha: afterIsha,
      },
      handleSavedSuccess,
      markFailed,
    );
  };

  const totalPrayers =
    beforeFajar +
    beforeDuhr +
    afterDuhr +
    (isBeforeAsarEnabled ? beforeAsar : 0) +
    afterMaghrib +
    afterIsha;

  const afterDuhrMax = afterDuhrOption === "one" ? 28 : 56;
  const beforeAsarMax = beforeAsarOption === "one" ? 28 : 56;

  return (
    <View style={styles.container}>
      <GoalSelectionOpenCloseButton
        isOpen={isOpen}
        title={t("prayerGoals.sunnahTitle")}
        toggleDropdown={toggleDropdown}
      />

      {isOpen && <Divider />}

      {isOpen && (
        <View style={styles.expandedContent}>
          {/* Before Fajr */}
          {user.gender === "FEMALE" ? (
            <Text
              style={{
                fontSize: 10,
                fontFamily: fonts.primary.regular,
                fontWeight: "400",
                color: Colors.light.white,
                marginBottom: 20,
                opacity: 0.6,
              }}
            >
              Prayer totals are locked for this goal and will automatically
              adjust if menstruation is logged from the home screen.
            </Text>
          ) : null}
          <View style={styles.sliderGroup}>
            <SliderHeading text={t("prayerGoals.beforeFajrHeading")} />
            <CustomSlider
              maxDays={28}
              initialDays={beforeFajar}
              onChange={setBeforeFajar}
              locked
              compact
              containerStyle={styles.slider}
            />
          </View>

          {/* Before Dhuhr */}
          <View style={styles.sliderGroup}>
            <SliderHeading text={t("prayerGoals.beforeDhuhrHeading")} />
            <CustomSlider
              maxDays={56}
              initialDays={beforeDuhr}
              onChange={setBeforeDuhr}
              locked
              compact
              containerStyle={styles.slider}
            />
          </View>

          {/* After Dhuhr */}
          <View style={styles.sliderGroup}>
            <SliderHeading text={t("prayerGoals.afterDhuhrHeading")} />
            <TopSpace top={20} />
            <View style={styles.radioRow}>
              <RadioOption
                selected={afterDuhrOption === "one"}
                label={t("prayerGoals.oneRakahOption")}
                onPress={() => handleAfterDuhrOptionChange("one")}
              />
              <RadioOption
                selected={afterDuhrOption === "two"}
                label={t("prayerGoals.twoRakahOption")}
                onPress={() => handleAfterDuhrOptionChange("two")}
              />
            </View>
            <CustomSlider
              key={`after-dhuhr-${afterDuhrMax}-${afterDuhr}`}
              maxDays={afterDuhrMax}
              initialDays={afterDuhr}
              onChange={setAfterDuhr}
              locked
              compact
              containerStyle={styles.slider}
            />
          </View>

          {/* Before Asr */}
          <View style={styles.sliderGroup}>
            <View style={styles.switchRow}>
              <SliderHeading
                text={t("prayerGoals.beforeAsrHeading")}
                style={[
                  styles.switchHeading,
                  !isBeforeAsarEnabled && styles.disabledText,
                ]}
              />
              <SwitchButton
                value={beforeAsarEnabled}
                onPress={handleToggleBeforeAsar}
                size="small"
              />
            </View>
            <View
              style={!isBeforeAsarEnabled ? styles.disabledControls : undefined}
              pointerEvents={isBeforeAsarEnabled ? "auto" : "none"}
            >
              <View style={styles.radioRow}>
                <RadioOption
                  selected={isBeforeAsarEnabled && beforeAsarOption === "one"}
                  label={t("prayerGoals.oneRakahOption")}
                  onPress={() => handleBeforeAsarOptionChange("one")}
                  disabled={!isBeforeAsarEnabled}
                />
                <RadioOption
                  selected={isBeforeAsarEnabled && beforeAsarOption === "two"}
                  label={t("prayerGoals.twoRakahOption")}
                  onPress={() => handleBeforeAsarOptionChange("two")}
                  disabled={!isBeforeAsarEnabled}
                />
              </View>
              <CustomSlider
                key={`before-asr-${beforeAsarMax}-${isBeforeAsarEnabled ? beforeAsar : 0}`}
                maxDays={beforeAsarMax}
                initialDays={isBeforeAsarEnabled ? beforeAsar : 0}
                onChange={setBeforeAsar}
                locked
                compact
                containerStyle={styles.slider}
              />
            </View>
          </View>

          {/* After Maghrib */}
          <View style={styles.sliderGroup}>
            <SliderHeading text={t("prayerGoals.afterMaghribHeading")} />
            <CustomSlider
              maxDays={28}
              initialDays={afterMaghrib}
              onChange={setAfterMaghrib}
              locked
              compact
              containerStyle={styles.slider}
            />
          </View>

          {/* After Isha */}
          <View style={styles.sliderGroup}>
            <SliderHeading text={t("prayerGoals.afterIshaHeading")} />
            <CustomSlider
              maxDays={28}
              initialDays={afterIsha}
              onChange={setAfterIsha}
              locked
              compact
              containerStyle={styles.slider}
            />
          </View>

          <Text style={styles.valueText}>
            {formatNumber(totalPrayers)}
            <Text style={styles.whiteText}>
              {t("prayerGoals.sunnahSuffix")}
            </Text>
          </Text>

          <View style={styles.buttonContainer}>
            <GoalSelectionSaveButton
              text={t("prayerGoals.save").toLocaleUpperCase()}
              onPress={handleSave}
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
  container: {
    width: "100%",
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    marginVertical: 0,
  },
  expandedContent: {
    width: "100%",
    paddingTop: 12,
    paddingBottom: 6,
  },
  sliderGroup: {
    width: "100%",
    // Track → next label ≈ Figma (~35px) with compact slider.
    marginBottom: 20,
    paddingRight: 10,
  },
  sliderHeading: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
    alignSelf: "flex-start",
    textAlign: "left",
    // marginBottom: 14,
  },
  sliderHeadingParen: {
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
  slider: {
    // Keep CustomSlider 112% bleed — do not force width: "100%".
    marginVertical: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
    marginBottom: 14,
  },
  switchHeading: {
    flex: 1,
    marginBottom: 0,
  },
  disabledText: {
    color: Colors.light.grey,
  },
  disabledControls: {
    opacity: 0.35,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 20,
    marginBottom: 12,
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
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: Colors.light.grey,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.green,
  },
  radioText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
  },
  valueText: {
    color: Colors.light.green,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    marginTop: 0,
    marginBottom: 32,
    letterSpacing: 0.1,
    textAlign: "center",
  },
  whiteText: {
    color: Colors.light.white,
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
