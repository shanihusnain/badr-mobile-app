import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Colors } from "../../constants/theme";

interface GreenTextButtonProps {
  title: string;
  onPress: () => void;
}

export const GreenTextButton: React.FC<GreenTextButtonProps> = ({
  title,
  onPress,
}) => {
  return (
    <Pressable onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  text: {
    color: Colors.light.greentextbutton,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
});
