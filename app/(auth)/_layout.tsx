import { Stack } from "expo-router";

import Header from "@/components/Header";
import { Colors } from "@/constants/theme";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
      }}
    >
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
          header: ({ options }: { options: { title?: string } }) => (
            <Header
              title={options?.title ?? ""}
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
      <Stack.Screen name="debitCredit" options={{ headerShown: false }} />
    </Stack>
  );
}
