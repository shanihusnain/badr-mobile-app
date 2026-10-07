import PrimaryButton from "@/components/atoms/Primary-button";
import { BadrTreeImage } from "@/assets/images";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { useAuth } from "@/provider/useAuth";

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
  const { t } = useTranslation();
  const { updateUser, user: authUser, isAuthenticated } = useAuth();
  const email =
    getParam(params.email)?.trim() ||
    authUser?.email?.trim() ||
    undefined;
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
  const isLeavingVerifyRef = useRef(false);
  const navigation = useNavigation();

  const handleOtpChange = (value: string, index: number) => {
    const digits = value.replace(/\D/g, "");
    setError(null);

    // SMS autofill / paste often dumps the full code into one box.
    if (digits.length > 1) {
      setOtp((prev) => {
        const next = [...prev];
        for (let i = 0; i < 6; i += 1) {
          next[i] = digits[i] ?? "";
        }
        return next;
      });
      const focusIndex = Math.min(digits.length, 6) - 1;
      inputRefs.current[Math.max(0, focusIndex)]?.focus();
      return;
    }

    const digit = digits.slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key !== "Backspace") return;
    setOtp((prev) => {
      if (prev[index]) return prev;
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      return prev;
    });
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

    const code = otp.join("");

    try {
      if (fromsignup === "true") {
        await verifyOtp({ otp: code, email });
      } else {
        await forgotPasswordOtpValidation({ email, otp: code });
      }

      if (fromsignup === "true") {
        if (authUser) {
          await updateUser({ ...authUser, emailVerified: true });
        }

        // Skip beforeRemove → createaccount; go forward into private flow.
        isLeavingVerifyRef.current = true;

        // Prefer private entry when tokens exist (isAuthenticated can lag one frame).
        router.replace("/(private)/greetingsscreen");
      } else {
        isLeavingVerifyRef.current = true;
        router.push({
          pathname: "/(auth)/confirmpassword",
          params: {
            email,
            code,
          },
        });
      }
    } catch {
      // Toast is handled in mutations
    }
  };

  const leaveVerifyEmail = () => {
    if (isLeavingVerifyRef.current) return;
    isLeavingVerifyRef.current = true;
    if (fromsignup === "true") {
      router.replace("/(auth)/createaccount");
      return;
    }
    router.replace("/(auth)/forgotpassword");
  };

  useEffect(() => {
    navigation.setOptions({
      title:
        fromsignup === "true"
          ? t("otpScreen.verifyEmailTitle")
          : t("otpScreen.forgotPasswordTitle"),
    });
  }, [navigation, fromsignup, t]);

  // Hardware / gesture back: same destinations as header (createaccount / forgotpassword).
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (isLeavingVerifyRef.current) return;
      event.preventDefault();
      leaveVerifyEmail();
    });

    return unsubscribe;
  }, [navigation, fromsignup]);

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
                        // Allow full-code paste/autofill into the focused box.
                        maxLength={index === 0 ? 6 : 1}
                        textContentType="oneTimeCode"
                        autoComplete="sms-otp"
                        importantForAutofill="yes"
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
                      disabled={
                        isPending || isForgotPasswordOtpValidationPending
                      }
                      isLoading={isPending || isForgotPasswordOtpValidationPending}
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
