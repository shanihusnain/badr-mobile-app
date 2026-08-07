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
  ActivityIndicator,
} from "react-native";

interface PrimaryButtonProps extends PressableProps {
  text: string;
  onPress: () => void;
  textStyle?: StyleProp<TextStyle>;
  isLoading?: boolean;
}

export default function PrimaryButton({
  text,
  onPress,
  style,
  textStyle,
  disabled,
  isLoading,
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
      {isLoading ? (
        <ActivityIndicator size="small" color={Colors.light.white} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            disabled && styles.buttonTextDisabled,
            textStyle,
          ]}
        >
          {text}
        </Text>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.green,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    backgroundColor: Colors.light.disabledButtonColor,
    borderColor: Colors.light.disabledButtonColor,
    opacity: 1,
  },
  buttonText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 25,
    letterSpacing: 0,
  },
  buttonTextDisabled: {
    color: Colors.light.white,
  },
});
