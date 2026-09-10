import PrimaryButton from "@/components/atoms/Primary-button";
import CustomTextInput from "@/components/atoms/CustomTextInput";
import { EmailAddressMailIcon } from "@/assets/icons";
import { BadrTreeImage } from "@/assets/images";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { ImageBackground } from "expo-image";

import { styles } from "./style";
import { useTranslation } from "react-i18next";
import { useValidations } from "@/src/validations/useValidations";
import { useForgotPassword } from "@/src/api/mutations/useForgotPassword";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { forgotPasswordSchema } = useValidations();
  const {
    mutateAsync: forgotPasswordMutation,
    isPending: forgotPasswordLoading,
  } = useForgotPassword();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    try {
      await forgotPasswordMutation(data.email);

      router.push({
        pathname: "./verifyemail/[fromsignup]",
        params: { fromsignup: "false", email: data.email },
      });
    } catch {}
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
                  <View style={styles.messageContainer}>
                    <Text style={styles.messageText}>
                      {t("forgotPasswordScreen.description")}
                    </Text>
                  </View>

                  <View style={styles.formWrapper}>
                    <CustomTextInput
                      placeholder={t("forgotPasswordScreen.emailPlaceholder")}
                      control={control}
                      name="email"
                      errors={
                        errors.email?.message ? [errors.email.message] : []
                      }
                      autoCapitalize="none"
                      leftIcon={<EmailAddressMailIcon />}
                      inputStyle={styles.emailInput}
                      containerStyle={styles.emailContainer}
                    />
                  </View>

                  <View style={styles.buttonWrapper}>
                    <PrimaryButton
                      text={t("forgotPasswordScreen.sendInstructionsBtn")}
                      onPress={handleSubmit(onSubmit)}
                      style={styles.primaryButton}
                      disabled={forgotPasswordLoading}
                      isLoading={forgotPasswordLoading}
                    />
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
