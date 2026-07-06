import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Colors } from "@/constants/theme";
import { redeemGiftStyles as styles } from "./style";
import PrimaryButton from "@/components/atoms/Primary-button";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { BadarNameLogo } from "@/assets/icons";

export default function RedeemGiftExtensionScreen() {
  const [code, setCode] = useState("");

  const handleApply = () => {
    if (code.length > 0) {
      console.log("Applying code:", code);
    }
  };

  return (
    <BlackScreenWrapper>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <BadarNameLogo size={24} color={Colors.light.white} />
          </View>

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
    </BlackScreenWrapper>
  );
}
