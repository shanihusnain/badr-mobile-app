import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Fit, RiveView, useRive, useRiveFile } from "@rive-app/react-native";

type Props = {
  /** 0–100; fractional values keep the moon fill smooth. */
  progressPercent: number;
  /** Fires once when the Rive view is ready (or if loading fails). */
  onReady?: () => void;
};

const MOON_RIV = require("../../assets/animations/moon.riv");

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

const MoonProgress = ({ progressPercent, onReady }: Props) => {
  const { riveFile, error } = useRiveFile(MOON_RIV);
  const { riveViewRef, setHybridRef } = useRive();
  const readyNotifiedRef = useRef(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const targetRef = useRef(clampPercent(progressPercent));
  const appliedRef = useRef<number | null>(null);
  const frameRef = useRef(0);
  const startedRef = useRef(false);

  // Sync during render so the RAF loop sees the latest value immediately
  // (no wait for useEffect after paint).
  targetRef.current = clampPercent(progressPercent);

  const notifyReady = () => {
    if (readyNotifiedRef.current) return;
    readyNotifiedRef.current = true;
    onReadyRef.current?.();
  };

  useEffect(() => {
    if (!riveViewRef) return;

    if (!startedRef.current) {
      startedRef.current = true;
      riveViewRef.playIfNeeded();
      const seed = clampPercent(progressPercent);
      targetRef.current = seed;
      appliedRef.current = seed;
      riveViewRef.setNumberInputValue("Number 1", seed);
      notifyReady();
    }

    const tick = () => {
      const target = targetRef.current;
      // Push every frame so Rive gets continuous fractional updates,
      // not only when React re-renders / useEffect fires.
      if (appliedRef.current !== target) {
        appliedRef.current = target;
        riveViewRef.setNumberInputValue("Number 1", target);
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riveViewRef]);

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
