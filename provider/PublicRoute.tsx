import { Redirect, usePathname, type Href } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useEffect, useState } from "react";

import { useAuth } from "./useAuth";
import { resolvePostAuthHref } from "@/src/utils/resolvePostAuthHref";

type PublicRouteProps = {
  children: React.ReactNode;
};

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const pathname = usePathname();
  const [authHref, setAuthHref] = useState<Href | null>(null);
  const [resolving, setResolving] = useState(false);

  // Signed-in users finishing signup may stay on createaccount / email OTP.
  const isCompletingSignup =
    pathname.includes("createaccount") || pathname.includes("verifyemail");

  const isUnverifiedEmail = user?.emailVerified === false;

  useEffect(() => {
    if (
      isLoading ||
      !isAuthenticated ||
      isCompletingSignup ||
      isUnverifiedEmail
    ) {
      setAuthHref(null);
      setResolving(false);
      return;
    }

    let cancelled = false;
    setResolving(true);

    void (async () => {
      const href = await resolvePostAuthHref({ user });
      if (!cancelled) {
        setAuthHref(href);
        setResolving(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    isLoading,
    isAuthenticated,
    isCompletingSignup,
    isUnverifiedEmail,
    user?.emailVerified,
    user?.email,
  ]);

  if (isLoading || (isAuthenticated && !isCompletingSignup && !isUnverifiedEmail && resolving)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isAuthenticated && !isCompletingSignup && !isUnverifiedEmail && authHref) {
    return <Redirect href={authHref} />;
  }

  return <>{children}</>;
}
