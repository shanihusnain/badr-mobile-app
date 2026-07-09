import React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useForm } from "react-hook-form";
import { Colors } from "@/constants/theme";
import { redeemGiftStyles as styles } from "./style";
import PrimaryButton from "@/components/atoms/Primary-button";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { BadarNameLogo } from "@/assets/icons";
import CustomTextInput from "@/components/atoms/CustomTextInput";
import {moonimage} from "@/assets/images";

export default function RedeemGiftExtensionScreen() {
  const { control, watch } = useForm({
    defaultValues: {
      redemptionCode: "",
    },
  });

  const code = watch("redemptionCode") ?? "";

  const handleApply = () => {
    if (code.trim().length > 0) {
      console.log("Applying code:", code.trim());
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
            <Image source={moonimage} style={styles.moonimage} />
            <BadarNameLogo size={44} color={Colors.light.white} />
          </View>

          <Text style={styles.title}>REDEEM GIFT EXTENSION</Text>
          <Text style={styles.subtitle}>
            Apply your gift to your membership
          </Text>

          <View style={styles.inputWrapper}>
            <CustomTextInput
              label="Add Redemption Code"
              placeholder="Redemption Code"
              control={control}
              name="redemptionCode"
              autoCapitalize="characters"
              containerStyle={styles.inputBox}
              inputStyle={styles.customInputStyle}
              labelStyle={styles.customLabelStyle}
            />
          </View>

          <PrimaryButton
            text="APPLY TO ACCOUNT"
            onPress={handleApply}
            style={code.trim().length > 0 ? undefined : styles.inactiveButton}
            textStyle={code.trim().length === 0 ? styles.inactiveButtonText : undefined}
          />
        </View>
      </KeyboardAvoidingView>
    </BlackScreenWrapper>
  );
}
