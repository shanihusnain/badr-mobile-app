import PrimaryButton from "@/components/atoms/Primary-button";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Backbutton from "../../../components/atoms/Backbutton";
import { styles } from "./style";
import { useTranslation } from "react-i18next";

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ fromsignup?: string }>();
  const { t } = useTranslation();

  const [buttonText, setButtonText] = useState("Verify");
  console.log("OTP Screen params:", params);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );

    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

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
    if (
      e.nativeEvent.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    console.log("Resend OTP clicked");
    setTimer(60);
  };

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const getBtnTitle = () => {
    return params?.fromsignup === "true"
      ? t("otpScreen.activateBtn")
      : t("otpScreen.verifyBtn");
  };

  const getDescriptionText = () => {
    return params?.fromsignup === "true"
      ? t("otpScreen.activateDescription")
      : t("otpScreen.verifyDescription");
  };

  const navigationBasedOnParams = () => {
    const isComplete = otp.every((digit) => digit !== "");
    if (!isComplete) {
      setError(t("validations.inputMissing"));
      return;
    }
    setError(null);
    if (params?.fromsignup === "true") {
      router.push("/paymentMethod");
    } else {
      router.push("/confirmpassword");
    }
  };

  const navigation = useNavigation();

  useEffect(() => {
    if (params?.fromsignup === "true") {
      navigation.setOptions({
        title: t("otpScreen.verifyEmailTitle"),
      });
    } else {
      navigation.setOptions({
        title: t("otpScreen.forgotPasswordTitle"),
      });
    }
  }, [navigation, params?.fromsignup, t]);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.contentView}>
          <View
            style={[
              styles.bottomSheet,
              keyboardVisible && {
                marginBottom:
                  Platform.OS === "ios" ? 260 : 180,
              },
            ]}
          >
            <Text style={styles.otpInfoText}>
              {getDescriptionText()}
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={styles.otpBox}
                  value={digit}
                  onChangeText={(value) =>
                    handleOtpChange(value, index)
                  }
                  onKeyPress={(e) =>
                    handleKeyPress(e, index)
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                />
              ))}
            </View>

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

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
                onPress={navigationBasedOnParams}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}