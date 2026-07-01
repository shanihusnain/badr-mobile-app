import React from "react";
import { View, Text, SafeAreaView } from "react-native";
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>PAYMENT SUCCESSFUL!</Text>

        <View style={styles.iconContainer}>
          {/* Custom Credit Card + Check Icon */}
          <View
            style={{
              width: 120,
              height: 80,
              borderWidth: 5,
              borderColor: Colors.light.green,
              borderRadius: 12,
              position: "relative",
            }}
          >
            {/* Magstripe */}
            <View
              style={{
                height: 12,
                backgroundColor: Colors.light.green,
                marginTop: 14,
              }}
            />
            {/* Card lines */}
            <View
              style={{
                width: 50,
                height: 5,
                backgroundColor: Colors.light.green,
                marginTop: 12,
                marginLeft: 14,
                borderRadius: 2,
              }}
            />
            <View
              style={{
                width: 25,
                height: 5,
                backgroundColor: Colors.light.green,
                marginTop: 6,
                marginLeft: 14,
                borderRadius: 2,
              }}
            />

            {/* Checkmark badge */}
            <View
              style={{
                position: "absolute",
                bottom: -20,
                right: -20,
                backgroundColor: Colors.light.blackBackground,
                borderRadius: 30,
                padding: 4,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  borderWidth: 4,
                  borderColor: Colors.light.green,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
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
    </SafeAreaView>
  );
}
