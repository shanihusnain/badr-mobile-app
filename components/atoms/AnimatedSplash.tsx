import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";

import { Colors } from "@/constants/theme";

type Props = {
  onFinish: () => void;
};

type SplashComponent = React.ComponentType<Props>;

/**
 * Rive needs native NitroModules (dev/production builds only).
 * Loading it with a static import crashes Expo Go and makes expo-router
 * treat `app/index.tsx` as missing its default export → ErrorBoundary crash.
 */
let RiveSplash: SplashComponent | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  RiveSplash = require("./AnimatedSplashRive").default;
} catch (error) {
  console.warn(
    "[AnimatedSplash] Rive/NitroModules unavailable; using fallback splash.",
    error,
  );
}

function FallbackSplash({ onFinish }: Props) {
  useEffect(() => {
    SplashScreen.hideAsync();
    const timeout = setTimeout(onFinish, 500);
    return () => clearTimeout(timeout);
  }, [onFinish]);

  return <View style={styles.container} />;
}

const AnimatedSplash = (props: Props) => {
  if (RiveSplash) {
    return <RiveSplash {...props} />;
  }
  return <FallbackSplash {...props} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
  },
});

export default AnimatedSplash;
