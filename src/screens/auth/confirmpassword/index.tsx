import PrimaryButton from "@/components/atoms/Primary-button";
import CustomTextInput from "@/components/atoms/CustomTextInput";
import { BadrTreeImage } from "@/assets/images";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { ImageBackground } from "expo-image";
import createStyles from "./style";
import { useValidations } from "@/src/validations/useValidations";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useLocalSearchParams } from "expo-router";
import { useResetPassword } from "@/src/api/mutations/useResetPassword";

export default function ConfirmPasswordScreen() {
  const { email, code }: { email: string; code: string } =
    useLocalSearchParams();
  const styles = createStyles();

  const { mutateAsync: resetPassword, isPending: isResetPasswordPending } =
    useResetPassword();
  const { confirmPasswordSchema } = useValidations();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(confirmPasswordSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess] = useState(false);

  const onPasswordToggle = () => setShowPassword((prev) => !prev);
  const onConfirmPasswordToggle = () => setShowConfirmPassword((prev) => !prev);

  const onUpdatePassword = async (
    data: z.infer<typeof confirmPasswordSchema>,
  ) => {
    try {
      await resetPassword({
        email,
        code,
        newPassword: data.password,
        confirmNewPassword: data.confirmPassword,
      });
    } catch {
      // Toast is handled in useResetPassword
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.contentView}>
            <ImageBackground
              source={BadrTreeImage}
              style={styles.imageSection}
              contentFit="cover"
            />

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "position"}
              keyboardVerticalOffset={0}
            >
              <View style={styles.bottomSheet}>
                <ScrollView
                  style={styles.bottomSheetScroll}
                  contentContainerStyle={styles.bottomSheetContent}
                  keyboardShouldPersistTaps="handled"
                  bounces={false}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.formWrapper}>
                    <CustomTextInput
                      placeholder={t(
                        "confirmPasswordScreen.newPasswordPlaceholder",
                      )}
                      control={control}
                      name="password"
                      showEye
                      secureTextEntry={!showPassword}
                      onToggleEye={onPasswordToggle}
                      errors={
                        errors.password?.message ? [errors.password.message] : []
                      }
                    />
                    <CustomTextInput
                      placeholder={t(
                        "confirmPasswordScreen.confirmPasswordPlaceholder",
                      )}
                      control={control}
                      name="confirmPassword"
                      showEye
                      secureTextEntry={!showConfirmPassword}
                      onToggleEye={onConfirmPasswordToggle}
                      errors={
                        errors.confirmPassword?.message
                          ? [errors.confirmPassword.message]
                          : []
                      }
                    />
                  </View>
                  <View style={styles.buttonWrapper}>
                    {isSuccess ? (
                      <View
                        style={{
                          width: "80%",
                          minHeight: 40,
                          borderRadius: 6,
                          paddingVertical: 1,
                          paddingHorizontal: 8,
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          alignSelf: "center",
                          gap: 8,
                          backgroundColor: Colors.light.darkgrey,
                        }}
                      >
                        <AntDesign
                          name="check-circle"
                          size={18}
                          color={Colors.light.green}
                        />
                        <Text
                          style={{
                            color: Colors.light.white,
                            fontFamily: fonts.primary.medium,
                            fontWeight: "500",
                            fontSize: 16,
                            lineHeight: 20,
                          }}
                        >
                          PASSWORD UPDATED!
                        </Text>
                      </View>
                    ) : (
                      <PrimaryButton
                        text={t("confirmPasswordScreen.updatePasswordBtn")}
                        onPress={handleSubmit(onUpdatePassword)}
                        isLoading={isResetPasswordPending}
                        disabled={isResetPasswordPending}
                      />
                    )}
                  </View>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </View>
  );
}
