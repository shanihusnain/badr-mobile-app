import { Stack } from "expo-router";

import Header from "@/components/Header";
import { PublicRoute } from "@/provider/PublicRoute";

const transparentAuthScreenOptions = {
  headerShown: true,
  headerTransparent: true,
  headerStyle: { backgroundColor: "transparent" },
  contentStyle: { backgroundColor: "transparent" },
} as const;

export default function AuthLayout() {
  return (
    <PublicRoute>
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
            ...transparentAuthScreenOptions,
            header: () => (
              <Header title="LOGIN" backgroundColor="transparent" />
            ),
          }}
        />
        <Stack.Screen
          name="verifyemail/[fromsignup]"
          options={{
            ...transparentAuthScreenOptions,
            header: ({ options }: { options: { title?: string } }) => (
              <Header
                title={options?.title ?? ""}
                backgroundColor="transparent"
              />
            ),
          }}
        />
        <Stack.Screen
          name="forgotpassword"
          options={{
            ...transparentAuthScreenOptions,
            header: () => (
              <Header title="FORGOT PASSWORD" backgroundColor="transparent" />
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
            ...transparentAuthScreenOptions,
            header: () => (
              <Header title="FORGOT PASSWORD" backgroundColor="transparent" />
            ),
          }}
        />
        <Stack.Screen name="debitCredit" options={{ headerShown: false }} />
      </Stack>
    </PublicRoute>
  );
}
