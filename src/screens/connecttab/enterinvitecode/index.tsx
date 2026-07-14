import { fonts } from "@/assets/fonts";
import { createTeamImage } from "@/assets/images";
import CustomTextInput from "@/components/atoms/CustomTextInput";
import PrimaryButton from "@/components/atoms/Primary-button";
import { Colors } from "@/constants/theme";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HEADER_HEIGHT = 100;

export const EnterInviteCodeScreen = () => {
  const insets = useSafeAreaInsets();
  const [inviteCode, setInviteCode] = useState("");

  const canSubmit = inviteCode.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    router.push({
      pathname: "/jointeam",
      params: { inviteCode: inviteCode.trim().toUpperCase() },
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.heroPressArea} pointerEvents="none">
        <ImageBackground
          source={createTeamImage}
          style={styles.heroImage}
          contentFit="cover"
        >
          <LinearGradient
            colors={[
              "rgba(8, 26, 47, 0.45)",
              "rgba(8, 26, 47, 0.75)",
              Colors.light.blackBackground,
            ]}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        </ImageBackground>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.content,
            {
              paddingTop: HEADER_HEIGHT + 24,
              paddingBottom: Math.max(insets.bottom, 16) + 8,
            },
          ]}
        >
          <View style={styles.form}>
            <Text style={styles.title}>JOIN TEAM</Text>
            <Text style={styles.subtitle}>
              Have a team code? Enter it below to find your team.
            </Text>

            <CustomTextInput
              placeholder="ENTER INVITATION CODE"
              value={inviteCode}
              onChangeText={(text) => setInviteCode(text.toUpperCase())}
              autoCapitalize="characters"
              containerStyle={styles.inputBox}
              inputStyle={styles.inputText}
            />

            <PrimaryButton
              text="SUBMIT CODE"
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={!canSubmit ? styles.submitDisabled : undefined}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
  },
  heroPressArea: {
    ...StyleSheet.absoluteFillObject,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  form: {
    width: "100%",
    gap: 16,
    alignItems: "center",
  },
  title: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 28,
    textAlign: "center",
    textTransform: "uppercase",
  },
  subtitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    opacity: 0.9,
    marginBottom: 8,
  },
  inputBox: {
    width: "100%",
    marginTop: 0,
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 8,
  },
  inputText: {
    textAlign: "center",
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    textTransform: "uppercase",
  },
  submitDisabled: {
    opacity: 0.45,
  },
});
