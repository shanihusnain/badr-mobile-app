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
  /**
   * When true, start in SAVED! (e.g. user reopened an already-configured goal).
   */
  initiallySaved?: boolean;
  /**
   * Fingerprint of the current form value. After a save (or when initially
   * saved), any change vs the baseline switches back to the green Save button.
   */
  valueKey?: string | number | undefined;
};

/**
 * Goal-selection Save CTA:
 * - Green Save while editing / dirty
 * - Loading until the API settles
 * - SAVED! after success, and again when reopening a saved goal — until valueKey changes
 */
export default function GoalSelectionSaveButton({
  onPress,
  text,
  disabled,
  isLoading = false,
  style,
  textStyle,
  initiallySaved = false,
  valueKey,
}: Props) {
  const { t } = useTranslation();
  const [showSaved, setShowSaved] = useState(initiallySaved);
  const [pending, setPending] = useState(false);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showSavedRef = useRef(initiallySaved);
  const baselineKeyRef = useRef<string | number | undefined>(
    initiallySaved ? valueKey : undefined,
  );
  const valueKeyRef = useRef(valueKey);
  valueKeyRef.current = valueKey;
  /**
   * Short fixed window after initiallySaved so async form hydration can set the
   * baseline once. Must NOT extend on each change — that kept TextInputs stuck
   * on SAVED! while typing.
   */
  const hydrateGraceUntilRef = useRef(initiallySaved ? Date.now() + 600 : 0);

  useEffect(() => {
    return () => {
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    };
  }, []);

  // Re-open already-saved goal → show SAVED! and lock baseline to current values.
  useEffect(() => {
    if (!initiallySaved) return;
    showSavedRef.current = true;
    setShowSaved(true);
    // Only lock baseline when we already have a concrete value; otherwise wait
    // for the first defined valueKey (API hydrate).
    if (valueKeyRef.current !== undefined) {
      baselineKeyRef.current = valueKeyRef.current;
    } else {
      baselineKeyRef.current = undefined;
    }
    hydrateGraceUntilRef.current = Date.now() + 600;
  }, [initiallySaved]);

  // Any edit after a saved baseline brings back the green Save button.
  useEffect(() => {
    if (valueKey === undefined) return;

    if (baselineKeyRef.current === undefined) {
      if (showSavedRef.current || initiallySaved) {
        baselineKeyRef.current = valueKey;
      }
      return;
    }

    if (valueKey === baselineKeyRef.current) return;

    // One-shot hydrate window (no extend) — absorb only until it expires.
    if (Date.now() < hydrateGraceUntilRef.current && showSavedRef.current) {
      baselineKeyRef.current = valueKey;
      return;
    }

    if (!showSavedRef.current && !showSaved) return;
    showSavedRef.current = false;
    setShowSaved(false);
  }, [valueKey, showSaved, initiallySaved]);

  const clearSafetyTimer = useCallback(() => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const markSaved = useCallback(() => {
    clearSafetyTimer();
    showSavedRef.current = true;
    baselineKeyRef.current = valueKeyRef.current;
    hydrateGraceUntilRef.current = 0;
    setPending(false);
    setShowSaved(true);
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
