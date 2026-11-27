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
  ActivityIndicator,
} from "react-native";
import { ms } from "@/src/utils/responsive";

interface SecondaryButtonProps extends PressableProps {
  text: string;
  onPress: () => void;
  textStyle?: StyleProp<TextStyle>;
  variant?: "white" | "green" | "red";
  isLoading?: boolean;
  /** Compact height for WarningModal / goal-planner actions (smaller than default bordered CTAs). */
  size?: "default" | "compact" | "modal";
}

export default function SecondaryButton({
  text,
  onPress,
  style,
  textStyle,
  variant = "white",
  isLoading = false,
  size = "default",
  disabled,
  ...props
}: SecondaryButtonProps) {
  const spinnerColor =
    variant === "red"
      ? Colors.light.red
      : variant === "green"
        ? Colors.light.green
        : Colors.light.white;

  return (
    <Pressable
      style={(state) => [
        styles.button,
        size === "compact" && styles.buttonCompact,
        size === "modal" && styles.buttonModal,
        variant === "white" && styles.buttonWhite,
        variant === "green" && styles.buttonGreen,
        variant === "red" && styles.buttonRed,
        typeof style === "function" ? style(state) : style,
        state.pressed && !isLoading && styles.buttonPressed,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === "white" && styles.buttonWhiteText,
            variant === "green" && styles.buttonGreenText,
            variant === "red" && styles.buttonRedText,
            size === "modal" && styles.buttonTextModal,
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
    minHeight: ms(40),
    borderRadius: ms(6),
    paddingTop: ms(10),
    paddingBottom: ms(10),
    paddingHorizontal: ms(8),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: ms(1.5),
    borderColor: Colors.light.background,
    alignSelf: "center",
  } satisfies ViewStyle,
  buttonCompact: {
    paddingTop: ms(5),
    paddingBottom: ms(5),
    minHeight: ms(35),
  },
  buttonModal: {
    paddingTop: ms(3),
    paddingBottom: ms(3),
    minHeight: ms(28),
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: Colors.light.background,
    fontFamily: fonts.primary.regular,
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(18),
    letterSpacing: 0,
  },
  buttonTextModal: {
    fontSize: ms(13),
    lineHeight: ms(16),
  },
  buttonWhite: {
    borderColor: Colors.light.background,
  },
  buttonGreen: {
    borderColor: Colors.light.green,
  },
  buttonRed: {
    borderColor: Colors.light.red,
  },
  buttonWhiteText: {
    color: Colors.light.background,
  },
  buttonGreenText: {
    color: Colors.light.green,
  },
  buttonRedText: {
    color: Colors.light.red,
  },
});
