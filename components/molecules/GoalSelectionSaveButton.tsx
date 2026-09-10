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
import { GreenTickWithCircleIcon } from "@/assets/icons";

const SAVED_VISIBLE_MS = 3000;

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
  const wasParentLoadingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // If parent-driven loading ends without markSaved, return to Save.
  useEffect(() => {
    if (isLoading) {
      wasParentLoadingRef.current = true;
      return;
    }
    if (wasParentLoadingRef.current && pending && !showSaved) {
      setPending(false);
    }
    wasParentLoadingRef.current = false;
  }, [isLoading, pending, showSaved]);

  const markSaved = useCallback(() => {
    setPending(false);
    setShowSaved(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowSaved(false);
      timerRef.current = null;
    }, SAVED_VISIBLE_MS);
  }, []);

  const markFailed = useCallback(() => {
    setPending(false);
  }, []);

  const loading = Boolean(isLoading) || pending;

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
        onPress(markSaved, markFailed);
      }}
      disabled={disabled || loading}
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
