import { useRouter } from "expo-router";
import React from "react";
import { ImageBackground, Text, View } from "react-native";

import PrimaryButton from "@/components/atoms/Primary-button";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./styles";
import { useTranslation } from "react-i18next";

const backgroundImage = require("@/assets/images/react-logo.png");

export default function WelcomeScreen() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  const handleCreateAccount = () => {
    router.push("/(auth)/intro");
  };
  const { t } = useTranslation();
  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={{ paddingHorizontal: 20, flex: 1 }}>
        <View style={styles.overlay} />

        <Text style={styles.heroText}>{t("welcomeScreen.welcomeText")}</Text>

        <PrimaryButton
          text={t("welcomeScreen.loginBtnText")}
          onPress={handleLogin}
          style={{ marginBottom: 9 }}
        />

        <SecondaryButton
          text={t("welcomeScreen.createAccountBtnText")}
          onPress={handleCreateAccount}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}
