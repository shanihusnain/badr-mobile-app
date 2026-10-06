import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useTranslation } from "react-i18next";
import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import PrimaryButton from "@/components/atoms/Primary-button";
import { GreenTickWithCircleIcon } from "@/assets/icons";

const SAVED_VISIBLE_MS = 2000;

type Props = {
  /**
   * Call `markSaved()` only after the API succeeds.
   * Call `markFailed()` if validation fails before the request, or on API error
   * when parent `isLoading` is not used.
   */
  onPress: (markSaved: () => void, markFailed: () => void) => void;
  text?: string;
  disabled?: boolean;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

/**
 * Goal-selection Save CTA phases:
 * 1) Save
 * 2) Loading until the API settles
 * 3) SAVED! only when `markSaved()` is called after success
 */
export default function GoalSelectionSaveButton({
  onPress,
  text,
  disabled,
  isLoading = false,
  style,
  textStyle,
}: Props) {
  const { t } = useTranslation();
  const [showSaved, setShowSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showSavedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    };
  }, []);

  const clearSafetyTimer = useCallback(() => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const markSaved = useCallback(() => {
    clearSafetyTimer();
    showSavedRef.current = true;
    setPending(false);
    setShowSaved(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      showSavedRef.current = false;
      setShowSaved(false);
      timerRef.current = null;
    }, SAVED_VISIBLE_MS);
  }, [clearSafetyTimer]);

  const markFailed = useCallback(() => {
    clearSafetyTimer();
    setPending(false);
  }, [clearSafetyTimer]);

  // Keep loading until markSaved/markFailed — do not drop pending when parent
  // isPending clears (that often happens one tick before mutate onSuccess).
  const loading = Boolean(isLoading) || pending;
  const isDisabled = Boolean(disabled) && !loading;

  if (showSaved) {
    return (
      <View style={[styles.savedBar, style]}>
        <GreenTickWithCircleIcon />
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
      onPress={() => {
        setPending(true);
        clearSafetyTimer();
        // Safety: if neither callback fires, recover to Save.
        safetyTimerRef.current = setTimeout(() => {
          safetyTimerRef.current = null;
          if (!showSavedRef.current) setPending(false);
        }, 15000);
        onPress(markSaved, markFailed);
      }}
      // Block presses while loading, but keep the green loading look
      // (PrimaryButton skips grey disabled styles when isLoading).
      disabled={isDisabled || loading}
      isLoading={loading}
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
    fontSize: 16,
    letterSpacing: 0.1,
    textTransform: "uppercase",
  },
});
