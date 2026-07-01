import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Feather name="chevron-left" size={24} color={Colors.light.white} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>CHANGE EMAIL ID</Text>
          </View>
        </View>

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
    </SafeAreaView>
  );
}
