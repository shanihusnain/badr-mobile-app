import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Colors } from "@/constants/theme";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import * as SystemUI from "expo-system-ui";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";

import { fontAssets } from "@/assets/fonts";
import { store } from "@/src/store/store";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/provider/AuthProvider";
import "@/i18next/i18next";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/src/config/toastConfig";

export const unstable_settings = {
  initialRouteName: "index",
};

const AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.light.blackBackground,
    card: Colors.light.blackBackground,
  },
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts(fontAssets);
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    if (!loaded && !error) return;

    // AnimatedSplash hides the native splash when the .riv is ready.
    // Fallback so we never stay stuck if the Rive screen fails to mount.
    const fallback = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 4000);

    return () => clearTimeout(fallback);
  }, [loaded, error]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(Colors.light.blackBackground);
  }, []);

  if (!loaded && !error) return null;
  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: Colors.light.blackBackground }}
    >
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <AuthProvider>
            <SafeAreaProvider>
              <ThemeProvider value={AppTheme}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(private)" />
                  <Stack.Screen
                    name="modal"
                    options={{ presentation: "modal", title: "Modal" }}
                  />
                </Stack>
                <StatusBar
                  style="light"
                  backgroundColor={Colors.light.blackBackground}
                />
                <Toast config={toastConfig} />
              </ThemeProvider>
            </SafeAreaProvider>
          </AuthProvider>
        </Provider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
