import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Fit, RiveView, useRive, useRiveFile } from "@rive-app/react-native";

type Props = {
  progressPercent: number;
  /** Fires once when the Rive view is ready (or if loading fails). */
  onReady?: () => void;
};

const MOON_RIV = require("../../assets/animations/moon.riv");

const MoonProgress = ({ progressPercent, onReady }: Props) => {
  const { riveFile, error } = useRiveFile(MOON_RIV);
  const { riveViewRef, setHybridRef } = useRive();
  const readyNotifiedRef = useRef(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const notifyReady = () => {
    if (readyNotifiedRef.current) return;
    readyNotifiedRef.current = true;
    onReadyRef.current?.();
  };

  useEffect(() => {
    if (!riveViewRef) return;

    const percentage = Math.min(100, Math.max(0, progressPercent));
    riveViewRef.setNumberInputValue("Number 1", percentage);
    riveViewRef.playIfNeeded();
    notifyReady();
  }, [progressPercent, riveViewRef]);

  useEffect(() => {
    if (!error) return;
    console.error("[MoonProgress] Failed to load moon.riv:", error);
    // Don't block parent animations if the moon asset fails.
    notifyReady();
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
