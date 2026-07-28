import { useRouter } from "expo-router";
import React from "react";
import { ImageBackground, Text, View } from "react-native";
import { Image } from "expo-image";

import PrimaryButton from "@/components/atoms/Primary-button";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./styles";
import { useTranslation } from "react-i18next";
import { TopSpace } from "@/components/atoms/TopSpace";
import { BadarNameLogo } from "@/assets/icons";
import { moonimage } from "@/assets/images";
import { Colors } from "@/constants/theme";

const backgroundImage = require("@/assets/images/welcomescreenimagebackground.png");
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.overlay} />

        <Text
          style={styles.heroText}
          allowFontScaling={false}
          maxFontSizeMultiplier={1}
        >
          {t("welcomeScreen.welcomeText")}
        </Text>

        <PrimaryButton
          text={t("welcomeScreen.loginBtnText")}
          onPress={handleLogin}
        />
        <TopSpace top={10} />
        <SecondaryButton
          text={t("welcomeScreen.createAccountBtnText")}
          onPress={handleCreateAccount}
        />
        <TopSpace top={10} />
      </SafeAreaView>
    </ImageBackground>
  );
}
