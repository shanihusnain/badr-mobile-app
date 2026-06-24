import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import {
  Fit,
  RiveView,
  useRive,
  useRiveFile,
} from "@rive-app/react-native";

type Props = {
  progressPercent: number;
};

const MOON_RIV = require("../../assets/animations/moon.riv");

const MoonProgress = ({ progressPercent }: Props) => {
  const { riveFile, error } = useRiveFile(MOON_RIV);
  const { riveViewRef, setHybridRef } = useRive();

  useEffect(() => {
    if (!riveViewRef) return;

    const percentage = Math.min(100, Math.max(0, progressPercent));
    riveViewRef.setNumberInputValue("Number 1", percentage);
    riveViewRef.playIfNeeded();
  }, [progressPercent, riveViewRef]);

  useEffect(() => {
    if (error) {
      console.error("[MoonProgress] Failed to load moon.riv:", error);
    }
  }, [error]);

  if (!riveFile) {
    return <View style={styles.fallback} />;
  }

  return (
    <View style={styles.container}>
      <RiveView
        hybridRef={setHybridRef}
        file={riveFile}
        stateMachineName="State Machine 1"
        autoPlay
        fit={Fit.Contain}
        style={styles.rive}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  rive: {
    width: "100%",
    height: "100%",
  },
  fallback: {
    width: "100%",
    height: "100%",
  },
});

export default MoonProgress;
