import React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm } from "react-hook-form";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Colors } from "@/constants/theme";
import { changeEmailStyles as styles } from "./style";
import { useRouter } from "expo-router";
import PrimaryButton from "@/components/atoms/Primary-button";
import CustomTextInput from "@/components/atoms/CustomTextInput";

export default function ChangeEmailIdScreen() {
  const router = useRouter();
  const { control, watch } = useForm({
    defaultValues: {
      email: "layla.najia@gmail.com",
    },
  });

  const email = watch("email") ?? "";
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

        <CustomTextInput
          placeholder="Email Address"
          control={control}
          name="email"
          keyboardType="email-address"
          autoCapitalize="none"
          containerStyle={styles.inputBox}
          inputStyle={{
            color: Colors.light.white,
            fontFamily: styles.inputBox.fontFamily,
            fontSize: styles.inputBox.fontSize,
          }}
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
