import PrimaryButton from "@/components/atoms/Primary-button";
import CustomTextInput from "@/components/atoms/CustomTextInput";
import { useValidations } from "@/src/validations/useValidations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { styles } from "./style";
import { useTranslation } from "react-i18next";

export default function LoginScreen() {
  const router = useRouter();
  const { loginSchema } = useValidations();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const handleForgotPassword = () => {
    router.push("/forgotpassword");
  };

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    router.replace("/setpersonalizedgoals");
    // handle login
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

            
            <View style={styles.bottomSheet}>
              <View style={styles.bottomSheetContent}>
                <View style={styles.formWrapper}>
                  <CustomTextInput
                    placeholder={t("loginScreen.emailPlaceholder")}
                    control={control}
                    name="email"
                    errors={errors.email?.message ? [errors.email.message] : []}
                  />

                  <CustomTextInput
                    placeholder={t("loginScreen.passwordPlaceholder")}
                    control={control}
                    name="password"
                    showEye
                    secureTextEntry={!showPassword}
                    onToggleEye={handleTogglePassword}
                    errors={
                      errors.password?.message ? [errors.password.message] : []
                    }
                  />

                  <TouchableOpacity
                    style={styles.forgotPasswordContainer}
                    onPress={handleForgotPassword}
                  >
                    <Text style={styles.forgotPasswordText}>
                      {t("loginScreen.forgotPassword")}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.buttonWrapper}>
                  <PrimaryButton
                    text={t("loginScreen.loginBtnText")}
                    onPress={handleSubmit(onSubmit)}
                  />

                  <TouchableOpacity
                    style={styles.orloginContainer}
                    onPress={() => router.push("/dummy")}
                    activeOpacity={0.7}
                  >
                    <View style={styles.line} />
                    <Text style={styles.orloginText}>{t("loginScreen.orLoginWith")}</Text>
                    <View style={styles.line} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
