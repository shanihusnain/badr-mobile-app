import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/theme";
import { useTranslation } from "react-i18next";

interface BackButtonProps {
  onPress?: () => void;
  bgcolor?: string;
}

export default function BackButton({ onPress, bgcolor }: BackButtonProps) {
  const router = useRouter();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(auth)/welcome");
  };

  return (
    <TouchableOpacity
      style={[
        styles.backButtonContainer,
        bgcolor ? { backgroundColor: bgcolor } : {},
      ]}
      onPress={handlePress}
    >
      <Feather
        name={isRtl ? "chevron-right" : "chevron-left"}
        size={24}
        color={Colors.light.white}
      />
    </TouchableOpacity>
  );
}
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
