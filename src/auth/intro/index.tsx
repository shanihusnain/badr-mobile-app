import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./styles";

const backgroundImage = require("../../../assets/images/react-logo.png");

export default function IntroScreen() {
  const router = useRouter();

  const handlePress = () => {
    router.push("/free_trial");
  };

  return (
    <Pressable style={styles.pressable} onPress={handlePress}>
      <SafeAreaView style={styles.container}>
        <Image
          source={backgroundImage}
          style={styles.image}
          contentFit="contain"
        />

        <Text style={styles.introText}>
          Embark on your journey to become a better Muslim with Badar
        </Text>

        <Text style={styles.subtitleText}>
          Set ibadat goal, track progress in real-time, and elevate
          your journey as a devoted Muslim with a reflective journal
          and enriching experiences islamic content
        </Text>
      </SafeAreaView>
    </Pressable>
  );
}