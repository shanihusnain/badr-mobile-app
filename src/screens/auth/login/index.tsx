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
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { styles } from "./style";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/provider/useAuth";
import { TopSpace } from "@/components/atoms/TopSpace";
import { useLogin } from "@/src/api/mutations/useLogin";
import { showToast } from "@/src/config/toastConfig";
import { ImageBackground } from "expo-image";
import { BadrTreeImage } from "@/assets/images";
import { LetterIcon, PasswordLockIcon } from "@/assets/icons";
import { SocialAuthSection } from "./components/SocialAuthSection";
// Social login disabled (Expo Go / unmatched native routes).
// import { SocialAuthSection } from "./components/SocialAuthSection";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { loginSchema } = useValidations();
  const { t } = useTranslation();
  const { mutateAsync: loginMutation, isPending: loggingIn } = useLogin();

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
    router.push("/(auth)/forgotpassword");
  };

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      const result = await loginMutation({
        email: data.email.trim(),
        password: data.password,
      });

      const { accessToken, refreshToken, user } = result.data;
      if (!accessToken) {
        showToast("error", "Login succeeded but no access token was returned");
        return;
      }

      await signIn(accessToken, refreshToken, user);
      router.replace("/(private)/greetingsscreen");
    } catch {
      // Toast is handled in useLogin
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
                  <CustomTextInput
                    placeholder={t("loginScreen.emailPlaceholder")}
                    control={control}
                    name="email"
                    errors={errors.email?.message ? [errors.email.message] : []}
                    autoCapitalize="none"
                    leftIcon={<LetterIcon />}
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
                    leftIcon={<PasswordLockIcon />}
                  />

                  <TouchableOpacity
                    style={styles.forgotPasswordContainer}
                    onPress={handleForgotPassword}
                  >
                    <Text style={styles.forgotPasswordText}>
                      {t("loginScreen.forgotPassword")}
                    </Text>
                  </TouchableOpacity>
                  <TopSpace top={30} />
                  <PrimaryButton
                    text={t("loginScreen.loginBtnText")}
                    onPress={handleSubmit(onSubmit)}
                    disabled={loggingIn}
                    isLoading={loggingIn}
                    style={styles.primaryButton}
                  />

                  {/* Social login temporarily disabled */}
                  <View style={styles.orloginContainer}>
                    <View style={styles.line} />
                    <Text style={styles.orloginText}>
                      {t("loginScreen.orLoginWith")}
                    </Text>
                    <View style={styles.line} />
                  </View>
                  <TopSpace top={30} />
                  <SocialAuthSection disabled={loggingIn} />

                  {Platform.OS === "ios" ? <TopSpace top={10} /> : null}
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </View>
  );
}
