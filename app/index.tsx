import { useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import AnimatedSplash from "@/components/atoms/AnimatedSplash";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/provider/useAuth";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  // if (!splashDone || isLoading) {
  //   return <AnimatedSplash onFinish={() => setSplashDone(true)} />;
  // }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
