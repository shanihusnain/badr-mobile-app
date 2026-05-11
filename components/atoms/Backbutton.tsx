import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/theme";

export default function BackButton() {
  const router = useRouter();

  const styles = StyleSheet.create({
    backButtonContainer: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: Colors.light.buttonBackground,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <TouchableOpacity
      style={styles.backButtonContainer}
      onPress={() => router.back()}
    >
      <Feather name="chevron-left" size={24} color={Colors.light.white} />
    </TouchableOpacity>
  );
}
