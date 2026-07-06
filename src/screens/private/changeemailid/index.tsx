import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { changeEmailStyles as styles } from "./style";
import { useRouter } from "expo-router";
import PrimaryButton from "@/components/atoms/Primary-button";

export default function ChangeEmailIdScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("layla.najia@gmail.com");

  const isEmailValid = email.trim().length > 0 && email.includes("@");

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    router.back();
  };

  return (
    <BlackScreenWrapper>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        
        <Text style={styles.sectionTitle}>EDIT EMAIL</Text>

        <Text style={styles.description}>
          This will change the account email you use to sign in with{" "}
          <Text style={styles.descriptionBold}>Badr</Text> and where you
          receive notifications.
        </Text>

        <TextInput
          style={styles.inputBox}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={Colors.light.icon}
        />

        <View style={styles.bottomSection}>
          <PrimaryButton
            text="SAVE"
            onPress={handleSave}
            style={
              isEmailValid
                ? undefined
                : { backgroundColor: Colors.light.inactivegreen }
            }
          />
        </View>
      </KeyboardAvoidingView>
    </BlackScreenWrapper>
  );
}
