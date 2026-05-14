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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import createStyles from "./style";
import { useValidations } from "@/src/validations/useValidations";

export default function ConfirmPasswordScreen() {
  const styles = createStyles();
  const { confirmPasswordSchema } = useValidations();

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

  const onPasswordToggle = () => setShowPassword((prev) => !prev);
  const onConfirmPasswordToggle = () => setShowConfirmPassword((prev) => !prev);

  const onUpdatePassword = (data: z.infer<typeof confirmPasswordSchema>) => {
    // handle update password
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
                    //label="Password"
                    placeholder="Enter password"
                    control={control}
                    name="password"
                    showEye
                    secureTextEntry={!showPassword}
                    onToggleEye={onPasswordToggle}
                    errors={errors.password?.message ? [errors.password.message] : []}
                  />
                  <CustomTextInput
                    //label="Confirm Password"
                    placeholder="Enter password"
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
                  <PrimaryButton
                    text="UPDATE PASSWORD"
                    onPress={handleSubmit(onUpdatePassword)}
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