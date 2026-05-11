import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import React from "react";
import {
    Pressable,
    PressableProps,
    StyleSheet,
    Text,
    TextStyle,
} from "react-native";

interface SecondaryButtonProps extends PressableProps {
  text: string;
  onPress: () => void;
  textStyle?: TextStyle;
}

export default function SecondaryButton({
  text,
  onPress,
  textStyle,
  ...props
}: SecondaryButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={onPress}
      {...props}
    >
      <Text style={[styles.buttonText, textStyle]}>{text}</Text>
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
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: Colors.light.background,
    alignSelf: "center",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: Colors.light.background,
    fontFamily: fonts.primary.regular,
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
  },
});
