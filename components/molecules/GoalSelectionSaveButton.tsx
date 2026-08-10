import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import PrimaryButton from "@/components/atoms/Primary-button";

const SAVED_VISIBLE_MS = 3000;

type Props = {
  /** Call `markSaved()` once the save succeeds (sync or after mutation onSuccess). */
  onPress: (markSaved: () => void) => void;
  text?: string;
  disabled?: boolean;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

/**
 * Goal-selection Save CTA: on success shows a SAVED! bar for 3s, then Save again.
 * Does not collapse the selection panel.
 */
export default function GoalSelectionSaveButton({
  onPress,
  text,
  disabled,
  isLoading,
  style,
  textStyle,
}: Props) {
  const { t } = useTranslation();
  const [showSaved, setShowSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const markSaved = useCallback(() => {
    setShowSaved(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowSaved(false);
      timerRef.current = null;
    }, SAVED_VISIBLE_MS);
  }, []);

  if (showSaved) {
    return (
      <View style={[styles.savedBar, style]}>
        <Feather name="check-circle" size={18} color={Colors.light.green} />
        <Text style={styles.savedText}>
          {t("monthlyGoalPlanner.goalSaved", "SAVED!")}
        </Text>
      </View>
    );
  }

  return (
    <PrimaryButton
      size="compact"
      text={(text ?? t("prayerGoals.save", "Save")).toLocaleUpperCase()}
      onPress={() => onPress(markSaved)}
      disabled={disabled}
      isLoading={isLoading}
      style={style}
      textStyle={textStyle}
    />
  );
}

const styles = StyleSheet.create({
  savedBar: {
    width: "100%",
    minHeight: 35,
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: Colors.light.greybuttonBackground,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  savedText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 14,
    letterSpacing: 0.1,
    textTransform: "uppercase",
  },
});
