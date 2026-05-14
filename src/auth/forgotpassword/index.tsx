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

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Input missing").email("Invalid email"),
});

export default function ForgotPasswordScreen() {
  const router = useRouter();

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
                    Enter the email address linked to your account.
                    We'll send you a 6-digit code to reset your
                    password.
                  </Text>
                </View>

                <View style={styles.formWrapper}>
                  <CustomTextInput
                    placeholder="Email Address"
                    control={control}
                    name="email"
                    errors={
                      errors.email?.message
                        ? [errors.email.message]
                        : []
                    }
                  />
                </View>

                <View style={styles.buttonWrapper}>
                  <PrimaryButton
                    text="SEND"
                    onPress={handleSubmit(onSubmit)}
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