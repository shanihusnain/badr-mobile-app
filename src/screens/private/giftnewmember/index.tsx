import React from "react";
import { View, Text } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import BackButton from "@/components/atoms/Backbutton";
import PrimaryButton from "@/components/atoms/Primary-button";
import { Colors } from "@/constants/theme";
import { giftNewMemberStyles as styles } from "./style";
import { useRouter } from "expo-router";

export default function GiftNewMemberScreen() {
  const router = useRouter();

  const handleNext = () => {
    router.push("/(private)/newmembercart");
  };

  return (
    <BlackScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton bgcolor={Colors.light.greybuttonversion} />
        </View>

        <View style={{ flex: 1, paddingBottom: 40 }}>
          <View style={styles.content}>
            <Text style={styles.title}>GIFT BADR</Text>

            <Text style={styles.subtitle}>
              Get 2 months free with every Badr gift!
            </Text>

            <Text style={styles.description}>
              Get them started with a prepaid one-year Badr membership. Help
              them strengthen their worship, build better habits, and draw
              closer to Allah—one day at a time.
            </Text>

            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>
                Mobile Image Space
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <PrimaryButton text="NEXT" onPress={handleNext} />
        </View>
      </View>
    </BlackScreenWrapper>
  );
}
