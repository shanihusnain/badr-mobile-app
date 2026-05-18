import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { Provider } from "react-redux";

import { fontAssets } from "@/assets/fonts";
import Header from "@/components/Header";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { store } from "@/src/store/store";
import { Colors } from "@/constants/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "@/i18next/i18next";

export const unstable_settings = {
  anchor: "welcome",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts(fontAssets);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync(); // ← hide splash once fonts ready
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="intro" options={{ headerShown: false }} />
            <Stack.Screen name="free_trial" options={{ headerShown: false }} />
            <Stack.Screen
              name="login"
              options={{
                headerShown: true,
                header: () => (
                  <Header
                    title="LOGIN"
                    backgroundColor={Colors.light.buttonBackground}
                  />
                ),
              }}
            />
            <Stack.Screen
              name="verifyemail/[fromsignup]"
              options={{
                headerShown: true,
                header: ({ options }: { options: any }) => (
                  <Header
                    title={options?.title}
                    backgroundColor={Colors.light.buttonBackground}
                  />
                ),
              }}
            />
            <Stack.Screen
              name="forgotpassword"
              options={{
                headerShown: true,
                header: () => (
                  <Header
                    title="FORGOT PASSWORD"
                    backgroundColor={Colors.light.buttonBackground}
                  />
                ),
              }}
            />
            <Stack.Screen
              name="createaccount"
              options={{
                headerShown: true,
                header: () => <Header title="CREATE ACCOUNT" />,
              }}
            />
            <Stack.Screen
              name="paymentMethod"
              options={{
                headerShown: true,
                header: () => <Header title="" />,
              }}
            />
            <Stack.Screen
              name="confirmpassword"
              options={{
                headerShown: true,
                header: () => (
                  <Header
                    title="FORGOT PASSWORD"
                    backgroundColor={Colors.light.buttonBackground}
                  />
                ),
              }}
            />
            <Stack.Screen
              name="debitCredit"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
            <Stack.Screen name="(private)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
