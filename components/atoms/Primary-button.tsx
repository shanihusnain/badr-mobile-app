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
import { ms } from "@/src/utils/responsive";

interface PrimaryButtonProps extends PressableProps {
  text: string;
  onPress: () => void;
  textStyle?: StyleProp<TextStyle>;
  isLoading?: boolean;
  /** Compact height for in-sheet goal Save actions (smaller than sheet NEXT). */
  size?: "default" | "compact";
}

export default function PrimaryButton({
  text,
  onPress,
  style,
  textStyle,
  disabled,
  isLoading,
  size = "default",
  ...props
}: PrimaryButtonProps) {
  const showLoading = Boolean(isLoading);
  // Loading stays green; only non-loading disabled uses the grey treatment.
  const showDisabled = Boolean(disabled) && !showLoading;

  return (
    <Pressable
      style={(state) => [
        styles.button,
        size === "compact" && styles.buttonCompact,
        typeof style === "function" ? style(state) : style,
        showLoading && styles.buttonLoading,
        showDisabled && styles.buttonDisabled,
        state.pressed && !showDisabled && !showLoading && styles.buttonPressed,
      ]}
      onPress={onPress}
      disabled={disabled || showLoading}
      {...props}
    >
      {showLoading ? (
        <ActivityIndicator
          size="small"
          color={Colors.light.blackBackground}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            showDisabled && styles.buttonTextDisabled,
            textStyle,
          ]}
        >
          {text.toLocaleUpperCase()}
        </Text>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderRadius: ms(4),
    paddingVertical: ms(8),
    paddingHorizontal: ms(8),
    // padding + label lineHeight — keeps loading/disabled the same height as enabled
    minHeight: ms(41),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.green,
  },
  buttonCompact: {
    paddingVertical: ms(2),
    minHeight: ms(32),
  },
  buttonLoading: {
    backgroundColor: Colors.light.green,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    backgroundColor: Colors.light.disabledButtonColor,
    borderColor: Colors.light.disabledButtonColor,
  },
  buttonText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(25),
    letterSpacing: 0,
  },
  buttonTextDisabled: {
    color: Colors.light.white,
  },
});
