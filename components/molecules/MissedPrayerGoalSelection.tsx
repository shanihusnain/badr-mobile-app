import React from "react";
import { useGoalSelectionOpenState } from "@/hooks/useGoalSelectionOpenState";
import { useDiscardUnsavedOnCollapse } from "@/hooks/useDiscardUnsavedOnCollapse";
import {
  StyleSheet,
  Text,
  View,
  LayoutAnimation,
} from "react-native";
import { Colors } from "../../constants/theme";
import { fonts } from "../../assets/fonts";
import CustomSlider from "../atoms/CustomSlider";
import GoalSelectionSaveButton from "./GoalSelectionSaveButton";
import { useTranslation } from "react-i18next";
import { useLocaleNumber } from "../../hooks/useLocaleNumber";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { GoalSelectionOpenCloseButton } from "./GoalSelectionOpenCloseButton";
import { Divider } from "../atoms/Divider";
import { ms } from "@/src/utils/responsive";

const PRAYERS_PER_DAY = 5;

export default function MissedPrayerGoalSelection({
  onSave,
  initialValue = 1,
  isSaving = false,
  openOnMount = false,
  collapseSignal = 0,
  onInputFocus,
  initiallySaved = false,
}: {
  onSave?: (value: number, onDone?: () => void, onFail?: () => void) => void;
  isSaving?: boolean;
  openOnMount?: boolean;
  collapseSignal?: number;
  onInputFocus?: (layout?: { windowY: number; inputHeight: number }) => void;
  initialValue?: number;
  initiallySaved?: boolean;
}) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const [isOpen, setIsOpen] = useGoalSelectionOpenState(
    openOnMount,
    onInputFocus,
    collapseSignal,
  );
  const [sliderValue, setSliderValue, commitSaved] =
    useDiscardUnsavedOnCollapse(isOpen, initialValue);

  const totalPrayers = sliderValue * PRAYERS_PER_DAY;
  const totalLabel = t("prayerGoals.missedPrayersSuffix", {
    count: totalPrayers,
  }).trim();

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  return (
    <View style={globalStyles.goalSelectionWrapper}>
      <GoalSelectionOpenCloseButton
        isOpen={isOpen}
        title={t("prayerGoals.missedPrayersTitle")}
        toggleDropdown={toggleDropdown}
      />
      {isOpen && <Divider />}

      {isOpen && (
        <View style={styles.expandedContent}>
          <CustomSlider
            maxDays={30}
            initialDays={sliderValue}
            onChange={(val) => setSliderValue(val)}
          />

          <View style={styles.resultBlock}>
            <Text style={styles.totalText}>
              {formatNumber(totalPrayers)}
              <Text style={styles.totalSuffix}>
                {t("prayerGoals.missedPrayersSuffix", { count: totalPrayers })}
              </Text>
            </Text>

            <Text style={styles.parenText}>
              ({formatNumber(totalPrayers)} {totalLabel})*
            </Text>

            <Text style={styles.formulaText}>
              {t("prayerGoals.missedPrayersFormula", {
                days: formatNumber(sliderValue),
                dayLabel: t("prayerGoals.missedPrayersDayLabel", {
                  count: sliderValue,
                }),
                prayersPerDay: formatNumber(PRAYERS_PER_DAY),
                total: formatNumber(totalPrayers),
                totalLabel,
              })}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <GoalSelectionSaveButton
              text={t("prayerGoals.save").toLocaleUpperCase()}
              onPress={(markSaved, markFailed) => {
                const toSave = sliderValue;
                onSave?.(
                  toSave,
                  () => {
                    commitSaved(toSave);
                    markSaved();
                  },
                  markFailed,
                );
              }}
              isLoading={isSaving}
              disabled={isSaving}
              style={styles.saveButton}
              textStyle={styles.saveButtonText}
              initiallySaved={initiallySaved}
              valueKey={sliderValue}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  expandedContent: {
    marginTop: ms(16),
    alignItems: "center",
    width: "100%",
    paddingBottom: 6,
  },
  resultBlock: {
    alignItems: "center",
    width: "100%",
    marginTop: 0,
    marginBottom: ms(25),
  },
  totalText: {
    color: Colors.light.green,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    textAlign: "center",
    letterSpacing: 0.1,
    marginTop: ms(-9),
    marginBottom: 10,
  },
  totalSuffix: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    fontWeight: "500",
  },
  parenText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
    textAlign: "center",
    opacity: 0.6,
    marginTop: -2,
    marginBottom: 2,
  },
  formulaText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 10,
    fontWeight: "400",
    lineHeight: 14,
    textAlign: "center",
    opacity: 0.7,
  },
  buttonContainer: {
    width: "100%",
    marginTop: ms(2),
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
