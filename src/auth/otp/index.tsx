import PrimaryButton from "@/components/atoms/Primary-button";
import React, { useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Backbutton from "../../../components/atoms/Backbutton";
import createStyles from "./style";

export default function OtpScreen() {
  const styles = createStyles();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }

    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if digit is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <Backbutton />

            <Text style={styles.title}>SIGNUP</Text>

            <View style={styles.placeholder} />
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Keyboard Handling */}
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
          >
            {/* Bottom Sheet */}
            <View style={styles.bottomSheet}>
              <View style={styles.scrollContent}>
                {/* Top Content */}
                <View>
                  <View style={styles.formWrapper}>
                    {/* OTP Boxes */}
                    <View style={styles.otpContainer}>
                      {otp.map((digit, index) => (
                        <TextInput
                          key={index}
                          ref={(ref) => (inputRefs.current[index] = ref)}
                          style={styles.otpBox}
                          value={digit}
                          onChangeText={(value) =>
                            handleOtpChange(value, index)
                          }
                          onKeyPress={(e) => handleKeyPress(e, index)}
                          keyboardType="numeric"
                          maxLength={1}
                        />
                      ))}
                    </View>
                  </View>
                </View>

                {/* Bottom Section */}
                <View style={styles.buttonWrapper}>
                  <PrimaryButton
                    text="ACTIVATE"
                    onPress={() => {}}
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