import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "./useAuth";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Register returns tokens before OTP; block private/tabs until verified.
  if (user?.emailVerified === false) {
    return (
      <Redirect
        href={{
          pathname: "/(auth)/verifyemail/[fromsignup]",
          params: {
            fromsignup: "true",
            ...(user?.email ? { email: user.email } : {}),
          },
        }}
      />
    );
  }

  return <>{children}</>;
}
