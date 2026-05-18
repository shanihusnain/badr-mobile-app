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

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ fromsignup?: string }>();

  const [buttonText, setButtonText] = useState("Verify");
  console.log("OTP Screen params:", params);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [timer, setTimer] = useState(60);

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
      ? "ACTIVATE"
      : "VERIFY";
  };

  const getDescriptionText = () => {
    return params?.fromsignup === "true"
      ? "Enter the 6-digit OTP sent to your email so we can\nactivate your account."
      : "Enter the 6-digit OTP sent to your email so we can\nverify it's you.";
  };

  const navigationBasedOnParams = () => {
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
        title: "VERIFY EMAIL",
      });
    } else {
      navigation.setOptions({
        title: "FORGOT PASSWORD",
      });
    }
  }, [navigation, params?.fromsignup]);

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

            <View style={styles.resendContainer}>
              <TouchableOpacity onPress={handleResend}>
                <Text
                  style={[
                    styles.resendAction,
                    styles.resendActionUnderline,
                  ]}
                >
                  Resend
                </Text>
              </TouchableOpacity>

              <Text style={styles.resendText}>
                OTP Code
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