import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./styles";
import { useTranslation } from "react-i18next";

const backgroundImage = require("@/assets/images/introscreenimage.png");

export default function IntroScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const handlePress = () => {
    router.push("/(auth)/free_trial");
  };

  return (
    <Pressable style={styles.pressable} onPress={handlePress}>
      <SafeAreaView style={styles.container}>
        <Image
          source={backgroundImage}
          style={styles.image}
          contentFit="contain"
        />

        <Text style={styles.introText}>{t("introScreen.introText")}</Text>

        <Text style={styles.subtitleText}>{t("introScreen.subtitleText")}</Text>
      </SafeAreaView>
    </Pressable>
  );
}
