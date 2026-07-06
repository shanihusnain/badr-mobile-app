import React from "react";
import { View, Text } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import PrimaryButton from "@/components/atoms/Primary-button";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { paymentSuccessStyles as styles } from "./styles";
import { useRouter } from "expo-router";

export default function PaymentSuccessScreen() {
  const router = useRouter();

  const handleBackToHome = () => {
    // Navigate back to the home tab. Adjust the path if needed.
    router.replace("/(tabs)");
  };

  return (
    <BlackScreenWrapper>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          {/* Custom Credit Card + Check Icon */}
          <View style={styles.cardIconContainer}>
            {/* Magstripe */}
            <View style={styles.cardMagstripe} />
            {/* Card lines */}
            <View style={styles.cardLine1} />
            <View style={styles.cardLine2} />

            {/* Checkmark badge */}
            <View style={styles.checkmarkBadgeContainer}>
              <View style={styles.checkmarkBadgeInner}>
                <Feather name="check" size={24} color={Colors.light.green} />
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.messageText}>
          JazakAllahu Khair for your order.{"\n"}
          May Allah accept it as a good deed{"\n"}
          done solely for His sake.
        </Text>

        <Text style={styles.subMessageText}>
          We've sent the gift to the recipients{"\n"}
          along with all the membership details.
        </Text>

        <Text style={styles.orderIdText}>Order ID: #Badr234567890</Text>

        <View style={styles.bottomSection}>
          <PrimaryButton text="BACK TO HOME" onPress={handleBackToHome} />
        </View>
      </View>
    </BlackScreenWrapper>
  );
}
