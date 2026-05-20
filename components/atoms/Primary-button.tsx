import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import React from "react";
import { Pressable, PressableProps, StyleSheet, Text } from "react-native";

interface PrimaryButtonProps extends PressableProps {
  text: string;
  onPress: () => void;
}

export default function PrimaryButton({
  text,
  onPress,
  style,
  ...props
}: PrimaryButtonProps) {
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
      backgroundColor: Colors.light.green,
      //borderWidth: 1.5,
      borderColor: Colors.light.green,
      // marginBottom: 10,
      alignSelf: "center",
    },
    buttonPressed: {
      opacity: 0.8,
    },
    buttonText: {
      color: Colors.light.background,
      fontFamily: fonts.primary.medium,
      fontWeight: "500",
      fontSize: 14,
      lineHeight: 18,
      letterSpacing: 0,
    },
  });

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
