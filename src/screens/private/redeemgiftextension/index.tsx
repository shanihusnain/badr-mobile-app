import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { redeemGiftStyles as styles } from "./style";
import { useRouter } from "expo-router";
import PrimaryButton from "@/components/atoms/Primary-button";

export default function RedeemGiftExtensionScreen() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleClose = () => {
    router.back();
  };

  const handleApply = () => {
    if (code.length > 0) {
      // Implement redemption logic here
      console.log("Applying code:", code);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Feather name="x" size={18} color={Colors.light.white} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
          />

          <Text style={styles.title}>REDEEM GIFT EXTENSION</Text>
          <Text style={styles.subtitle}>
            Apply your gift to your membership
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Add Redemption Code</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="Redemption Code"
              placeholderTextColor={Colors.light.icon}
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
            />
          </View>

          <PrimaryButton
            text="APPLY TO ACCOUNT"
            onPress={handleApply}
            style={code.length > 0 ? undefined : { backgroundColor: "#8c94a1" }}
            textStyle={code.length === 0 ? { color: Colors.light.white } : undefined}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
