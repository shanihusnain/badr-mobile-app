import { Redirect, usePathname, type Href } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "./useAuth";

type PublicRouteProps = {
  children: React.ReactNode;
};

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
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

  // Tokens exist before OTP; never dump unverified users into private tabs
  // (that loops: tabs → ProtectedRoute → verifyemail again).
  const isUnverifiedEmail = user?.emailVerified === false;

  if (isAuthenticated && !isCompletingSignup && !isUnverifiedEmail) {
    return <Redirect href={"/(tabs)" as Href} />;
  }

  return <>{children}</>;
}
