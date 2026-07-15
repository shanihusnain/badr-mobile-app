import PrimaryButton from "@/components/atoms/Primary-button";
import CustomTextInput from "@/components/atoms/CustomTextInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { styles } from "./style";
import { useTranslation } from "react-i18next";
import { useValidations } from "@/src/validations/useValidations";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { forgotPasswordSchema } = useValidations();

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

  const onSubmit = (data: z.infer<typeof forgotPasswordSchema>) => {
    console.log("Forgot password data", data);

    router.push({
      pathname: "./verifyemail/[fromsignup]",
      params: { fromsignup: "false" },
    });
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
                    errors={errors.email?.message ? [errors.email.message] : []}
                  />
                </View>

                <View style={styles.buttonWrapper}>
                  <PrimaryButton
                    text={t("forgotPasswordScreen.sendInstructionsBtn")}
                    onPress={handleSubmit(onSubmit)}
                    style={styles.primaryButton}
                  />
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
