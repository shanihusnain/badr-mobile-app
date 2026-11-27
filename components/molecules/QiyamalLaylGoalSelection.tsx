import React, { useMemo } from "react";
import { useGoalSelectionOpenState } from "@/hooks/useGoalSelectionOpenState";
import { useDiscardUnsavedOnCollapse } from "@/hooks/useDiscardUnsavedOnCollapse";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
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
import { useAuth } from "@/provider/useAuth";
import { useGetMe } from "@/src/api/queries/useGetMe";
import { TopSpace } from "../atoms/TopSpace";
import { PRAYER_CYCLE_DAYS } from "@/src/utils/prayerCycleUtils";
import { ms } from "@/src/utils/responsive";

type QiyamDraft = {
  commitment: "every_night" | "flexible";
  sliderValue: number;
};

export default function QiyamalLaylGoalSelection({
  onSave,
  initialValues,
  isSaving = false,
  openOnMount = false,
  collapseSignal = 0,
  onInputFocus,
  initiallySaved = false,
}: {
  onSave?: (
    value: {
      commitment: "every_night" | "flexible";
      twoRakahPrayers: number;
      witrPrayers: number;
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
  openOnMount?: boolean;
  collapseSignal?: number;
  onInputFocus?: (layout?: { windowY: number; inputHeight: number }) => void;
  initiallySaved?: boolean;
}) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const [isOpen, setIsOpen] = useGoalSelectionOpenState(openOnMount, onInputFocus, collapseSignal);
  const seed = useMemo<QiyamDraft>(
    () => ({
      commitment: initialValues?.isFlexible ? "flexible" : "every_night",
      sliderValue: initialValues?.unitTarget ?? 1,
    }),
    [initialValues?.isFlexible, initialValues?.unitTarget],
  );
  const [draft, setDraft, commitSaved] = useDiscardUnsavedOnCollapse(
    isOpen,
    seed,
  );
  const commitment = draft.commitment;
  const sliderValue = draft.sliderValue;

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const handleSave = (markSaved: () => void, markFailed?: () => void) => {
    const toSave = draft;
    onSave?.(
      {
        commitment: toSave.commitment,
        twoRakahPrayers: toSave.sliderValue,
        // Every-night includes locked cycle Witr; flexible does not.
        witrPrayers:
          toSave.commitment === "every_night" ? PRAYER_CYCLE_DAYS : 0,
      },
      () => {
        commitSaved(toSave);
        markSaved();
      },
      markFailed,
    );
  };
  const { user } = useAuth();
  const { data: me } = useGetMe();
  const normalizeGender = (value?: string | null) =>
    value?.toString().trim().toUpperCase();
  const isFemaleUser = [
    me?.gender,
    user?.gender,
    user?.user?.gender,
    user?.data?.gender,
  ].some((value) => normalizeGender(value) === "FEMALE");

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
          {isFemaleUser && commitment === "every_night" ? (
            <>
              <Text style={styles.greyDescription}>
                The target number of Witr prayers will automatically adjust
                if menstruation is logged from the home screen.
              </Text>
              <TopSpace top={ms(10)} />
            </>
          ) : null}
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
              onPress={() =>
                setDraft({ ...draft, commitment: "every_night" })
              }
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
              onPress={() => setDraft({ ...draft, commitment: "flexible" })}
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
              maxDays={500}
              initialDays={sliderValue}
              onChange={(val) => setDraft({ ...draft, sliderValue: val })}
            />
          </View>

          {/* Result / Save area */}
          <View style={styles.resultContainer}>
            <View style={styles.summaryTextBlock}>
              {commitment === "every_night" ? (
                <>
                  <Text style={styles.valueText}>
                    {formatNumber(sliderValue)}
                    <Text style={styles.whiteText}>
                      {sliderValue === 1
                        ? t("prayerGoals.rakahPrayer")
                        : t("prayerGoals.rakahPrayers")}
                    </Text>
                    <Text style={styles.whiteText}>
                      {t("prayerGoals.and28WitrBefore")}
                      <Text style={styles.greenCount}>
                        {formatNumber(PRAYER_CYCLE_DAYS)}
                      </Text>
                      {t("prayerGoals.and28WitrAfter")}
                    </Text>
                  </Text>
                  <Text style={styles.witrDescription}>
                    {t("prayerGoals.witrDescLine1")}
                    {"\n"}
                    {t("prayerGoals.witrDescLine2")}
                  </Text>
                </>
              ) : (
                <Text style={styles.valueText}>
                  {formatNumber(sliderValue)}
                  <Text style={styles.whiteText}>
                    {sliderValue === 1
                      ? t("prayerGoals.rakahPrayer")
                      : t("prayerGoals.rakahPrayers")}
                    {t("prayerGoals.plusWitrFlexibleShort")}
                  </Text>
                  {"\n"}
                  <Text style={styles.whiteText}>
                    {t("prayerGoals.plusWitrFlexibleDesc")}
                  </Text>
                </Text>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <GoalSelectionSaveButton
                text={t("prayerGoals.save")}
                onPress={handleSave}
                style={styles.saveButton}
                textStyle={styles.saveButtonText}
                isLoading={isSaving}
                disabled={isSaving}
                initiallySaved={initiallySaved}
                valueKey={`${commitment}-${sliderValue}`}
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
    marginTop: ms(10),
    width: "100%",
    paddingBottom: ms(6),
  },
  stepBadge: {
    backgroundColor: Colors.light.darkgrey,
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(5),
    alignSelf: "flex-start",
    marginBottom: ms(6),
    marginTop: ms(10),
  },
  stepBadgeText: {
    color: "white",
    fontSize: ms(10),
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
  },
  stepTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: ms(12),
    lineHeight: ms(15),
    marginBottom: ms(10),
    // letterSpacing: 0.1,
  },
  sliderContainer: {
    // marginTop: ms(-9),
    // marginBottom: ms(-13),
    paddingHorizontal: ms(10),
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: ms(8),
    width: "100%",
    paddingRight: ms(20),
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: ms(8),
  },
  radioOuter: {
    width: ms(14),
    height: ms(14),
    borderRadius: ms(7),
    borderWidth: 1,
    borderColor: Colors.light.grey,
    backgroundColor: Colors.light.calendarBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: ms(7),
  },
  radioInner: {
    width: ms(10),
    height: ms(10),
    borderRadius: ms(8),
    backgroundColor: Colors.light.green,
  },
  radioText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: ms(12),
    fontWeight: "500",
  },
  greyDescription: {
    color: Colors.light.dullDescriptionText,
    fontFamily: fonts.primary.regular,
    fontSize: ms(10),
    lineHeight: ms(14),
    fontWeight: "400",
  },
  resultContainer: {
    width: "100%",
    marginTop: ms(10),
  },
  summaryTextBlock: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: ms(20),
  },
  valueText: {
    color: Colors.light.green,
    fontFamily: fonts.primary.medium,
    fontSize: ms(14),
    fontWeight: "500",
    lineHeight: ms(20),
    textAlign: "center",
  },
  greenCount: {
    color: Colors.light.green,
    fontFamily: fonts.primary.medium,
    fontSize: ms(14),
    fontWeight: "500",
  },
  whiteText: {
    color: Colors.light.white,
  },
  witrDescription: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    fontSize: ms(10),
    lineHeight: ms(15),
    textAlign: "left",
    alignSelf: "center",
    marginTop: ms(8),
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
    fontSize: ms(16),
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
  },
});
