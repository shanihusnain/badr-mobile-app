import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import React from "react";
import { Pressable, PressableProps, StyleSheet, Text } from "react-native";
import { ms } from "@/src/utils/responsive";

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
    minHeight: ms(40),
    borderRadius: ms(6),
    paddingTop: ms(10),
    paddingBottom: ms(10),
    paddingHorizontal: ms(8),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.buttonBackground,
    //borderColor: Colors.light.border,
    marginBottom: ms(10),
    alignSelf: "center",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: Colors.light.inputBackground,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(18),
  },
});
