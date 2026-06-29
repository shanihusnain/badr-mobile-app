import PrimaryButton from "@/components/atoms/Primary-button";
import CustomTextInput from "@/components/atoms/CustomTextInput";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
  Text,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import createStyles from "./style";
import { useValidations } from "@/src/validations/useValidations";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";

export default function ConfirmPasswordScreen() {
  const styles = createStyles();
  const { confirmPasswordSchema } = useValidations();
  const { t } = useTranslation();
  const router = useRouter();

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
  const [isSuccess, setIsSuccess] = useState(false);

  const onPasswordToggle = () => setShowPassword((prev) => !prev);
  const onConfirmPasswordToggle = () => setShowConfirmPassword((prev) => !prev);

  const onUpdatePassword = (data: z.infer<typeof confirmPasswordSchema>) => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      router.push("/(auth)/login");
    }, 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.contentView}>
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
          >
            {/* Bottom Sheet */}
            <View style={styles.bottomSheet}>
              <View style={styles.bottomSheetContent}>
                <View style={styles.formWrapper}>
                  <CustomTextInput
                    placeholder={t("confirmPasswordScreen.newPasswordPlaceholder")}
                    control={control}
                    name="password"
                    showEye
                    secureTextEntry={!showPassword}
                    onToggleEye={onPasswordToggle}
                    errors={errors.password?.message ? [errors.password.message] : []}
                  />
                  <CustomTextInput
                    placeholder={t("confirmPasswordScreen.confirmPasswordPlaceholder")}
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
                        //borderWidth: 1.5,
                        //borderColor: Colors.light.green,
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
                    
                    />
                  )}
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}