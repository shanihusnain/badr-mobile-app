import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform, Text } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Colors } from "@/constants/theme";
import { changePasswordStyles as styles } from "./style";
import { useRouter } from "expo-router";
import PrimaryButton from "@/components/atoms/Primary-button";
import CustomTextInput from "@/components/atoms/CustomTextInput";
import { useValidations } from "@/src/validations/useValidations";
import { useAuth } from "@/provider/useAuth";
import { useForgotPassword } from "@/src/api/mutations/useForgotPassword";
import { setPendingPasswordReset } from "@/src/utils/pendingPasswordReset";
import { showToast } from "@/src/config/toastConfig";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { t } = useTypedTranslation();
  const { user } = useAuth();
  const { confirmPasswordSchema } = useValidations();
  const { mutateAsync: sendOtp, isPending } = useForgotPassword();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<z.infer<typeof confirmPasswordSchema>>({
    resolver: zodResolver(confirmPasswordSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSave = async (data: z.infer<typeof confirmPasswordSchema>) => {
    const email = user?.email?.trim();
    if (!email) {
      showToast("error", t("validations.emailRequired"));
      return;
    }

    try {
      setPendingPasswordReset({
        email,
        newPassword: data.password,
        confirmNewPassword: data.confirmPassword,
        source: "change-password",
      });
      await sendOtp(email);
      router.push({
        pathname: "/(auth)/verifyemail/[fromsignup]",
        params: {
          fromsignup: "false",
          email,
          fromChangePassword: "true",
        },
      });
    } catch {
      // Toast handled in useForgotPassword
    }
  };

  return (
    <BlackScreenWrapper>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Text style={styles.helperText}>
          We will email a verification code to confirm this change.
        </Text>

        <View style={styles.inputGroup}>
          <CustomTextInput
            label="New Password"
            placeholder="Your password must be at least 8 characters"
            control={control}
            name="password"
            secureTextEntry={!showNew}
            showEye
            onToggleEye={() => setShowNew((prev) => !prev)}
            containerStyle={styles.inputBox}
            inputStyle={styles.inputText}
            labelStyle={styles.label}
            errors={errors.password?.message ? [errors.password.message] : []}
          />
        </View>

        <View style={styles.inputGroup}>
          <CustomTextInput
            label="Confirm Password"
            placeholder="Confirm your new password"
            control={control}
            name="confirmPassword"
            secureTextEntry={!showConfirm}
            showEye
            onToggleEye={() => setShowConfirm((prev) => !prev)}
            containerStyle={styles.inputBox}
            inputStyle={styles.inputText}
            labelStyle={styles.label}
            errors={
              errors.confirmPassword?.message
                ? [errors.confirmPassword.message]
                : []
            }
          />
        </View>

        <View style={styles.bottomSection}>
          <PrimaryButton
            text="CONTINUE"
            onPress={handleSubmit(onSave)}
            disabled={!isValid || isPending}
            isLoading={isPending}
            style={
              isValid && !isPending
                ? undefined
                : { backgroundColor: Colors.light.greybuttonversion }
            }
          />
        </View>
      </KeyboardAvoidingView>
    </BlackScreenWrapper>
  );
}
