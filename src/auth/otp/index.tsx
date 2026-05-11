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

import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Backbutton from "../../../components/atoms/Backbutton";
import createStyles from "./style";

export default function OtpScreen() {
  const styles = createStyles();
  const router = useRouter();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false),
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
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    console.log("Resend OTP clicked");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* HEADER */}
          <View style={styles.header}>
            <Backbutton />
            <Text style={styles.title}>SIGNUP</Text>
            <View style={styles.placeholder} />
          </View>

          {/* BOTTOM SHEET */}
          <View
            style={[
              styles.bottomSheet,
              keyboardVisible && {
                marginBottom: Platform.OS === "ios" ? 260 : 180,
              },
            ]}
          >
            {/* INFO TEXT */}
            <Text style={styles.otpInfoText}>
              Enter the 6-digit OTP sent to your email so we can{"\n"}
              activate your account.
            </Text>

            {/* OTP BOXES */}
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

            {/* RESEND (FIXED ALIGNMENT) */}
            <View style={styles.resendContainer}>
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendAction}>Resend</Text>
              </TouchableOpacity>
              <Text style={styles.resendText}>OTP Code</Text>
            </View>

            {/* BUTTON */}
            <View style={styles.buttonWrapper}>
              <PrimaryButton
                text="ACTIVATE"
                onPress={() => router.push("/paymentMethod")}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
