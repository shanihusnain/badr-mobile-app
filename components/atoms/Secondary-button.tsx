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

interface SecondaryButtonProps extends PressableProps {
  text: string;
  onPress: () => void;
  textStyle?: StyleProp<TextStyle>;
  variant?: "white" | "green";
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
  isLoading,
  size = "default",
  ...props
}: SecondaryButtonProps) {
  return (
    <Pressable
      style={(state) => [
        styles.button,
        size === "compact" && styles.buttonCompact,
        size === "modal" && styles.buttonModal,
        variant === "white" ? styles.buttonWhite : styles.buttonGreen,
        typeof style === "function" ? style(state) : style,
        state.pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === "white" ? Colors.light.white : Colors.light.green}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === "white"
              ? styles.buttonWhiteText
              : styles.buttonGreenText,
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
  buttonCompact: {
    paddingTop: 5,
    paddingBottom: 5,
    minHeight: 35,
  },
  buttonModal: {
    paddingTop: 3,
    paddingBottom: 3,
    minHeight: 28,
  },
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
  buttonTextModal: {
    fontSize: 13,
    lineHeight: 16,
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
