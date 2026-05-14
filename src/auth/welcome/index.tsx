import { useRouter } from "expo-router";
import React from "react";
import { ImageBackground, Text, View } from "react-native";

import PrimaryButton from "@/components/atoms/Primary-button";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./styles";

const backgroundImage = require("../../../assets/images/react-logo.png");

export default function WelcomeScreen() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  const handleCreateAccount = () => {
    router.push("/intro");
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={{ paddingHorizontal: 20, flex: 1 }}>
        <View style={styles.overlay} />

        <Text style={styles.heroText}>
          Your Daily Companion to help you set, track, and elevate your
          spiritual goals as a Muslim.
        </Text>

        <PrimaryButton
          text="LOGIN"
          onPress={handleLogin}
        />

        <SecondaryButton
          text="CREATE AN ACCOUNT"
          onPress={handleCreateAccount}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}