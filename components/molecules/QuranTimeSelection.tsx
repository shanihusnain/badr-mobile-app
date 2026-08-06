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
import PrimaryButton from "@/components/atoms/Primary-button";
import { useGetQuranGoalByType } from "@/src/api/queries/useGetQuranGoalByType";
import { getHoursFromDetail } from "@/src/utils/quranGoalMap";

const MAX_HOURS = 280;

export const QuranTimeSelection = ({
  title,
  description,
  onSave,
  quranGoalType,
}: {
  title: string;
  description: string;
  onSave?: (hours: number) => void;
  quranGoalType?: "LISTENING" | "TAJWEED";
}) => {
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
  return (
    <View style={styles.container}>
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
              <Text style={styles.header}>Enter upto {MAX_HOURS} hours.</Text>
              <TopSpace top={12} />
              <View style={styles.outerRow}>
                <TextInput
                  value={inputValue}
                  onChangeText={handleHoursChange}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.light.icon}
                  maxLength={3}
                  style={{
                    borderColor:
                      inputValue && inputValue.trim().length > 0
                        ? Colors.light.green
                        : Colors.light.white,
                    backgroundColor:
                      inputValue && inputValue.trim().length > 0
                        ? Colors.light.green
                        : "transparent",
                    borderWidth: 1,
                    width: 50,
                    alignItems: "center",
                    textAlign: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    color: Colors.light.white,
                    fontSize: 12,
                    fontWeight: "400",
                    fontFamily: fonts.primary.regular,
                    paddingVertical: 8,
                  }}
                />

                <Text style={styles.descriptionText}>{description}</Text>
              </View>
              <TopSpace top={16} />

              <PrimaryButton
                text="Save"
                onPress={() => {
                  const hours = Math.min(
                    MAX_HOURS,
                    parseInt(inputValue || "0", 10) || 0,
                  );
                  if (onSave) onSave(hours);
                  setIsOpen(false);
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
    fontSize: 12,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    textAlign: "center",
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
  },
  container: {
    ...globalStyles.goalSelectionWrapper,
    alignItems: "flex-start",
  },
  openContent: {
    width: "100%",
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
