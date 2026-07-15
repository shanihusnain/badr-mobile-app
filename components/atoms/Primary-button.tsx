import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import React from "react";
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  StyleProp,
  TextStyle,
} from "react-native";

interface PrimaryButtonProps extends PressableProps {
  text: string;
  onPress: () => void;
  textStyle?: StyleProp<TextStyle>;
}

export default function PrimaryButton({
  text,
  onPress,
  style,
  textStyle,
  disabled,
  ...props
}: PrimaryButtonProps) {
  return (
    <Pressable
      style={(state) => [
        styles.button,
        disabled && styles.buttonDisabled,
        typeof style === "function" ? style(state) : style,
        state.pressed && !disabled && styles.buttonPressed,
      ]}
      onPress={onPress}
      disabled={disabled}
      {...props}
    >
      <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled, textStyle]}>
        {text}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    width: "100%",
    minHeight: 40,
    borderRadius: 6,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.green,
    //borderWidth: 1.5,
    borderColor: Colors.light.green,
    // marginBottom: 10,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
  },
  buttonTextDisabled: {
    color: Colors.light.background,
  },
});
