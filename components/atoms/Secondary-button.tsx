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
  ViewStyle,
} from "react-native";

interface SecondaryButtonProps extends PressableProps {
  text: string;
  onPress: () => void;
  textStyle?: StyleProp<TextStyle>;
  variant?: "white" | "green";
}

export default function SecondaryButton({
  text,
  onPress,
  style,
  textStyle,
  variant = "white",
  ...props
}: SecondaryButtonProps) {
  return (
    <Pressable
      style={(state) => [
        styles.button,
        variant === "white" ? styles.buttonWhite : styles.buttonGreen,
        typeof style === "function" ? style(state) : style,
        state.pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
      {...props}
    >
      <Text
        style={[
          styles.buttonText,
          variant === "white" ? styles.buttonWhiteText : styles.buttonGreenText,
          textStyle,
        ]}
      >
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
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: Colors.light.background,
    alignSelf: "center",
  } satisfies ViewStyle,
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: Colors.light.background,
    fontFamily: fonts.primary.regular,
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
  },
  buttonWhite: {
    borderColor: Colors.light.background,
  },
  buttonGreen: {
    borderColor: Colors.light.green,
  },
  buttonWhiteText: {
    color: Colors.light.background,
  },
  buttonGreenText: {
    color: Colors.light.green,
  },
});
