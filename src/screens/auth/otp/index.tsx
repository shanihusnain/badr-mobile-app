import PrimaryButton from "@/components/atoms/Primary-button";
import { BadrTreeImage } from "@/assets/images";
import React, { useEffect, useRef, useState } from "react";
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
import { ImageBackground } from "expo-image";

import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./style";
import { useTranslation } from "react-i18next";
import { useVerifyOtp } from "@/src/api/mutations/useVerifyOtp";
import { useResendOtp } from "@/src/api/mutations/useResendOtp";
import { useForgotPasswordOtpValidation } from "@/src/api/mutations/useForgotPasswordOtpValidation";

type OtpScreenParams = {
  fromsignup?: string | string[];
  email?: string | string[];
};

const getParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<OtpScreenParams>();
  const fromsignup = getParam(params.fromsignup);
  const email = getParam(params.email);
  const { t } = useTranslation();
  const { mutateAsync: verifyOtp, isPending } = useVerifyOtp();

  const {
    mutateAsync: forgotPasswordOtpValidation,
    isPending: isForgotPasswordOtpValidationPending,
  } = useForgotPasswordOtpValidation();
  const { mutateAsync: resendOtp } = useResendOtp();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) value = value.slice(-1);

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setTimer(60);
    if (email) {
      resendOtp(email);
    }
  };

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const getBtnTitle = () => {
    return fromsignup === "true"
      ? t("otpScreen.activateBtn")
      : t("otpScreen.verifyBtn");
  };

  const getDescriptionText = () => {
    return fromsignup === "true"
      ? t("otpScreen.activateDescription")
      : t("otpScreen.verifyDescription");
  };

  const handleVerify = async () => {
    const isComplete = otp.every((digit) => digit !== "");
    if (!isComplete) {
      setError(t("validations.otpRequired"));
      return;
    }

    if (!email) {
      setError(t("validations.emailRequired"));
      return;
    }

    setError(null);

    try {
      if (fromsignup === "true") {
        await verifyOtp({ otp: otp.join(""), email });
      } else {
        await forgotPasswordOtpValidation({ email, otp: otp.join("") });
      }

      if (fromsignup === "true") {
        // router.push("/(auth)/paymentMethod");
        router.replace("/login");
      } else {
        router.push({
          pathname: "/(auth)/confirmpassword",
          params: {
            email: email as string,
            code: otp.join("") as string,
          },
        });
      }
    } catch {
      // Toast is handled in mutations
    }
  };

  const navigation = useNavigation();

  useEffect(() => {
    if (fromsignup === "true") {
      navigation.setOptions({
        title: t("otpScreen.verifyEmailTitle"),
      });
    } else {
      navigation.setOptions({
        title: t("otpScreen.forgotPasswordTitle"),
      });
    }
  }, [navigation, fromsignup, t]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.contentView}>
            <KeyboardAvoidingView
              style={styles.keyboardAvoidingView}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={0}
            >
              <ImageBackground
                source={BadrTreeImage}
                style={styles.imageSection}
                contentFit="cover"
              >
                <View style={styles.imageTapArea} />
              </ImageBackground>

              <View style={styles.bottomSheet}>
                <Text style={styles.otpInfoText}>{getDescriptionText()}</Text>

                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        inputRefs.current[index] = ref;
                      }}
                      style={styles.otpBox}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                    />
                  ))}
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <View style={styles.resendContainer}>
                  <TouchableOpacity onPress={handleResend}>
                    <Text
                      style={[
                        styles.resendAction,
                        styles.resendActionUnderline,
                      ]}
                    >
                      {t("otpScreen.resend")}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.resendText}>
                    {t("otpScreen.otpCode")}
                  </Text>
                </View>

                <Text style={styles.resendTimer}>
                  {`00:${timer.toString().padStart(2, "0")}`}
                </Text>

                <View style={styles.buttonWrapper}>
                  <PrimaryButton
                    text={getBtnTitle()}
                    onPress={handleVerify}
                    disabled={isPending || isForgotPasswordOtpValidationPending}
                    isLoading={
                      isPending || isForgotPasswordOtpValidationPending
                    }
                  />
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </View>
  );
}
