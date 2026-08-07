import React from "react";
import { StyleSheet, View } from "react-native";
// Native Rive module disabled for Expo Go.
// import { Fit, RiveView, useRive, useRiveFile } from "@rive-app/react-native";

type Props = {
  progressPercent: number;
};

const MoonProgress = ({ progressPercent }: Props) => {
  // Moon progress native animation disabled for Expo Go.
  return <View style={styles.placeholder} />;
};

const styles = StyleSheet.create({
  placeholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },
});

export default MoonProgress;
