import { Redirect, usePathname } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "./useAuth";

type PublicRouteProps = {
  children: React.ReactNode;
};

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Signed-in users finishing signup may stay on createaccount / email OTP.
  const isCompletingSignup =
    pathname.includes("createaccount") || pathname.includes("verifyemail");

  if (isAuthenticated && !isCompletingSignup) {
    return <Redirect href="/(tabs)" />;
  }

  return <>{children}</>;
}
