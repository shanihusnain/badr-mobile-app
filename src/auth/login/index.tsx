import PrimaryButton from "@/components/atoms/Primary-button";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import Backbutton from "../../../components/atoms/Backbutton";
import createStyles from "./style";

const schema = z.object({
  email: z.string().min(1, "Input missing").email("Invalid email"),
  password: z
    .string()
    .min(1, "Input missing")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain number")
    .regex(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      "Must contain special character",
    ),
});

export default function LoginScreen() {
  const styles = createStyles();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const checkPasswordValidations = (pwd: string) => {
    const validations = {
      hasMinLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    };
    return validations;
  };

  const validations = checkPasswordValidations(passwordValue);

  const passwordValidationMessages = [] as string[];
  if (passwordValue.length > 0) {
    if (!validations.hasMinLength)
      passwordValidationMessages.push("At least 8 characters");
    if (!validations.hasUppercase)
      passwordValidationMessages.push("Must contain uppercase");
    if (!validations.hasLowercase)
      passwordValidationMessages.push("Must contain lowercase");
    if (!validations.hasNumber)
      passwordValidationMessages.push("Must contain number");
    if (!validations.hasSpecial)
      passwordValidationMessages.push("Must contain special character");
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <Backbutton />

            <Text style={styles.title}>LOGIN</Text>

            <View style={styles.placeholder} />
          </View>

          {/* Keyboard Handling */}
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
          >
            {/* Bottom Sheet */}
            <View style={styles.bottomSheet}>
              <View style={styles.bottomSheetContent}>
                {/* Top Section */}
                <View style={styles.formWrapper}>
                  {/* Email Input */}
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View>
                        <View style={styles.emailContainer}>
                          <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            placeholderTextColor="#999"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            keyboardType="email-address"
                          />
                        </View>
                        {errors.email && (
                          <Text style={styles.errorText}>
                            {errors.email.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />

                  {/* Password Input */}
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View>
                        <View style={styles.passwordContainer}>
                          <TextInput
                            style={styles.passwordInput}
                            placeholder="Password"
                            placeholderTextColor="#999"
                            value={value}
                            onChangeText={(text) => {
                              onChange(text);
                              setPasswordValue(text);
                            }}
                            onBlur={onBlur}
                            secureTextEntry={!showPassword}
                          />

                          <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                          >
                            <Text style={styles.eyeIcon}>👁️</Text>
                          </TouchableOpacity>
                        </View>
                        {value &&
                        value.length > 0 &&
                        passwordValidationMessages.length > 0 ? (
                          <View style={styles.validationContainer}>
                            <Text style={styles.validationText}>
                              {passwordValidationMessages.join(" • ")}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    )}
                  />

                  {/* Forgot Password */}
                  <TouchableOpacity style={styles.forgotPasswordContainer}>
                    <Text style={styles.forgotPasswordText}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.buttonWrapper}>
                  <PrimaryButton
                    text="LOG IN"
                    onPress={handleSubmit(() => {})}
                  />
                  <View style={styles.orloginContainer}>
                    <View style={styles.line} />

                    <Text style={styles.orloginText}>Or login with</Text>

                    <View style={styles.line} />
                  </View>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
