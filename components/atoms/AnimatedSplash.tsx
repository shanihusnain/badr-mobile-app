import React, { useCallback, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Fit, RiveView, useRiveFile } from "@rive-app/react-native";
import * as SplashScreen from "expo-splash-screen";

import { Colors } from "@/constants/theme";

type Props = {
  onFinish: () => void;
};

const SPLASH_RIV = require("../../assets/animations/splash.riv");

/** Duration of the splash animation — tweak if the animation length differs. */
const SPLASH_DURATION_MS = 3500;

const AnimatedSplash = ({ onFinish }: Props) => {
  const { riveFile, error } = useRiveFile(SPLASH_RIV);
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    if (riveFile) {
      SplashScreen.hideAsync();
    }
  }, [riveFile]);

  useEffect(() => {
    if (error) {
      console.error("[AnimatedSplash] Failed to load splash.riv:", error);
      SplashScreen.hideAsync();
      finish();
    }
  }, [error, finish]);

  useEffect(() => {
    const timeout = setTimeout(finish, SPLASH_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [finish]);

  return (
    <View style={styles.container}>
      {riveFile ? (
        <RiveView
          file={riveFile}
          artboardName="Artboard"
          stateMachineName="State Machine 1"
          autoPlay
          fit={Fit.Contain}
          style={styles.rive}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
    padding: 40,
  },
  rive: {
    width: "100%",
    height: "100%",
  },
});

export default AnimatedSplash;
