import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/theme";
import { useTranslation } from "react-i18next";

interface BackButtonProps {
  onPress?: () => void;
}

export default function BackButton({ onPress }: BackButtonProps) {
  const router = useRouter();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const styles = StyleSheet.create({
    backButtonContainer: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: Colors.light.buttonBackground,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <TouchableOpacity
      style={styles.backButtonContainer}
      onPress={onPress ?? (() => router.back())}
    >
      <Feather
        name={isRtl ? "chevron-right" : "chevron-left"}
        size={24}
        color={Colors.light.white}
      />
    </TouchableOpacity>
  );
}
