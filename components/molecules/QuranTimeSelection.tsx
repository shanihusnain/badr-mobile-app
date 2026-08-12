import { globalStyles } from "@/src/globalstyles/globalstyles";
import {
  ActivityIndicator,
  LayoutAnimation,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { GoalSelectionOpenCloseButton } from "./GoalSelectionOpenCloseButton";
import { Divider } from "../atoms/Divider";
import { TopSpace } from "../atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useEffect, useState } from "react";
import GoalSelectionSaveButton from "@/components/molecules/GoalSelectionSaveButton";
import { useGetQuranGoalByType } from "@/src/api/queries/useGetQuranGoalByType";
import { getHoursFromDetail } from "@/src/utils/quranGoalMap";
import { useTranslation } from "react-i18next";

const MAX_HOURS = 280;

export const QuranTimeSelection = ({
  title,
  descriptionKey,
  onSave,
  quranGoalType,
  isSaving = false,
}: {
  title: string;
  /** i18n key with `_one` / `_other` plural forms (pass count via input). */
  descriptionKey: string;
  onSave?: (hours: number, onDone?: () => void, onFail?: () => void) => void;
  quranGoalType?: "LISTENING" | "TAJWEED";
  isSaving?: boolean;
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);

  const { data: goalDetail, isLoading } = useGetQuranGoalByType(quranGoalType, {
    enabled: isOpen && !!quranGoalType,
  });

  useEffect(() => {
    if (!isOpen || hydrated || !goalDetail) return;
    const hours = getHoursFromDetail(goalDetail);
    if (hours > 0) {
      setInputValue(String(Math.min(MAX_HOURS, Math.round(hours))));
    }
    setHydrated(true);
  }, [isOpen, goalDetail, hydrated]);

  useEffect(() => {
    if (!isOpen) setHydrated(false);
  }, [isOpen]);

  const handleHoursChange = (text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, "");
    if (digitsOnly === "") {
      setInputValue("");
      return;
    }
    const parsed = parseInt(digitsOnly, 10);
    if (Number.isNaN(parsed)) {
      setInputValue("");
      return;
    }
    setInputValue(String(Math.min(MAX_HOURS, parsed)));
  };

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const hoursCount = parseInt(inputValue || "0", 10) || 0;
  const descriptionText = t(descriptionKey, { count: hoursCount });

  return (
    <View style={[styles.container, { paddingBottom: isOpen ? 6 : 10 }]}>
      <GoalSelectionOpenCloseButton
        isOpen={isOpen}
        title={title}
        toggleDropdown={toggleDropdown}
      />
      {isOpen && (
        <View style={styles.openContent}>
          <Divider />
          <TopSpace top={16} />
          {isLoading ? (
            <View style={{ paddingVertical: 16, alignItems: "center" }}>
              <ActivityIndicator color={Colors.light.green} />
            </View>
          ) : (
            <>
              <Text style={styles.header}>Enter up to {MAX_HOURS} hours.</Text>
              <TopSpace top={12} />
              <View style={styles.outerRow}>
                <TextInput
                  value={inputValue}
                  onChangeText={handleHoursChange}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.light.white}
                  maxLength={3}
                  textAlignVertical="center"
                  style={[
                    styles.hoursInput,
                    inputValue.trim().length > 0 && styles.hoursInputFilled,
                  ]}
                />

                <Text style={styles.descriptionText}>{descriptionText}</Text>
              </View>
              <TopSpace top={56} />

              <GoalSelectionSaveButton
                text="Save"
                disabled={hoursCount <= 0 || isSaving}
                isLoading={isSaving}
                onPress={(markSaved, markFailed) => {
                  const hours = Math.min(
                    MAX_HOURS,
                    parseInt(inputValue || "0", 10) || 0,
                  );
                  if (hours <= 0) {
                    markFailed();
                    return;
                  }
                  onSave?.(hours, markSaved, markFailed);
                }}
                style={{ width: "100%" }}
              />
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  descriptionText: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  hoursInput: {
    width: 44,
    paddingTop: 4,
    paddingRight: 6,
    paddingBottom: 4,
    paddingLeft: 6,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    borderWidth: 1,
    borderColor: Colors.light.white,
    backgroundColor: "transparent",
    borderRadius: 4,
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    includeFontPadding: false,
  },
  hoursInputFilled: {
    borderColor: Colors.light.green,
    backgroundColor: Colors.light.green,
  },
  innerRow: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
  },
  outerRow: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    flexDirection: "row",
  },
  header: {
    fontSize: 12,
    color: Colors.light.white,
    opacity: 0.8,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    textAlign: "left",
    letterSpacing: 0.1,
  },
  container: {
    ...globalStyles.goalSelectionWrapper,
    alignItems: "flex-start",
  },
  openContent: {
    width: "100%",
    paddingBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    width: 60,
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
    borderRadius: 8,
    color: Colors.light.white,
    fontSize: 12,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
  },
});
