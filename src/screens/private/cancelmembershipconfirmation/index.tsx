import React from "react";
import { View, Text } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { cancelConfirmationStyles as styles } from "./style";
import { useRouter } from "expo-router";
import PrimaryButton from "@/components/atoms/Primary-button";

export default function CancelMembershipConfirmationScreen() {
  const router = useRouter();

  const handleBackToHome = () => {
    // Navigate to the main home screen of the app
    router.replace("/(tabs)");
  };

  return (
    <BlackScreenWrapper>
      <View style={styles.content}>
        <Text style={styles.title}>
          YOUR MEMBERSHIP CANCELLATION{"\n"}IS CONFIRMED
        </Text>

        <View style={styles.iconContainer}>
          <Feather name="x" size={90} color={Colors.light.blackBackground} strokeWidth={8} />
        </View>

        <Text style={styles.description}>
          We're sorry to see you go. May Allah{"\n"}
          (SWT) bless you on your journey, guide{"\n"}
          you to what is best, and grant you{"\n"}
          success in this life and the Hereafter.
        </Text>

        <Text style={styles.subDescription}>
          Your membership will remain active until{"\n"}
          <Text style={styles.boldText}>Nov 24, 2026</Text>. After that, your access to{"\n"}
          <Text style={styles.boldText}>Badr</Text> will end, and no further charges will{"\n"}
          be made.
        </Text>
      </View>

      <View style={styles.bottomContainer}>
        <PrimaryButton text="BACK TO HOME" onPress={handleBackToHome} />
      </View>
    </BlackScreenWrapper>
  );
}
