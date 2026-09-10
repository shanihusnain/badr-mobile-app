import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { getRecitationGoalSummarySegments } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationPastAchievementData";
import { SurahProgressStrip } from "./SurahProgressStrip";

type GraphBarSelectionFooterProps = {
  visible: boolean;
  completed: number;
  incomplete: number;
  goalTotal: number;
  onClose: () => void;
};

const ANIMATION_MS = 200;

export function GraphBarSelectionFooter({
  visible,
  completed,
  incomplete,
  goalTotal,
  onClose,
}: GraphBarSelectionFooterProps) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(visible);
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const scaleX = useRef(new Animated.Value(visible ? 1 : 0)).current;

  const segments = getRecitationGoalSummarySegments(
    completed,
    incomplete,
    goalTotal,
  );

  useEffect(() => {
    if (visible) {
      setMounted(true);
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: ANIMATION_MS,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleX, {
        toValue: visible ? 1 : 0,
        duration: ANIMATION_MS,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && !visible) {
        setMounted(false);
      }
    });
  }, [completed, goalTotal, incomplete, opacity, scaleX, visible]);

  if (!mounted) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.wrapper, { opacity }]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <Pressable onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>
          {t("progressLogging.closeBtn")}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
    marginTop: 12,
  },

  closeButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.green,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});
