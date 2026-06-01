import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import React from "react";
import { Pressable, PressableProps, StyleSheet, Text } from "react-native";

interface GreyButtonProps extends PressableProps {
  text: string;
  onPress: () => void;
}

export default function GreyButton({
  text,
  onPress,
  style,
  ...props
}: GreyButtonProps) {
  return (
    <Pressable
      style={(state) => [
        styles.button,
        typeof style === "function" ? style(state) : style,
        state.pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
      {...props}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    width: "90%",
    minHeight: 40,
    borderRadius: 6,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.buttonBackground,
    //borderColor: Colors.light.border,
    marginBottom: 10,
    alignSelf: "center",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: Colors.light.inputBackground,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 18,
  },
});
