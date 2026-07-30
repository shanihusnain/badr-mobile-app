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

  // New social users are signed in first, then finish profile on createaccount.
  const isCompletingSocialProfile = pathname.includes("createaccount");

  if (isAuthenticated && !isCompletingSocialProfile) {
    return <Redirect href="/(tabs)" />;
  }

  return <>{children}</>;
}
