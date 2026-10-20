import { Redirect, usePathname, useSegments, type Href } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useEffect, useState } from "react";

import { useAuth } from "./useAuth";
import { resolvePostAuthHref } from "@/src/utils/resolvePostAuthHref";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

function pathMatchesHref(pathname: string, href: Href): boolean {
  const target =
    typeof href === "string" ? href : (href as { pathname?: string }).pathname;
  if (!target) return false;
  if (pathname === target) return true;
  const strip = (p: string) =>
    p
      .split("/")
      .filter((s) => s && !(s.startsWith("(") && s.endsWith(")")))
      .join("/");
  const a = strip(pathname);
  const b = strip(target);
  return a === b || a.endsWith(b) || b.endsWith(a);
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const pathname = usePathname();
  const segments = useSegments();
  const onTabs = segments[0] === "(tabs)";
  const [gateHref, setGateHref] = useState<Href | null>(null);
  const [gateReady, setGateReady] = useState(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      setGateReady(false);
      setGateHref(null);
      return;
    }

    if (user?.emailVerified === false) {
      setGateReady(true);
      return;
    }

    // Only gate the tabs shell — private onboarding screens stay put.
    if (!onTabs) {
      setGateHref(null);
      setGateReady(true);
      return;
    }

    let cancelled = false;
    setGateReady(false);

    void (async () => {
      const href = await resolvePostAuthHref({ user });
      if (cancelled) return;

      const allowedTabs =
        typeof href === "string" && href.startsWith("/(tabs)");

      setGateHref(allowedTabs ? null : href);
      setGateReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    isLoading,
    isAuthenticated,
    user?.emailVerified,
    user?.email,
    onTabs,
    pathname,
  ]);

  if (
    isLoading ||
    (isAuthenticated && user?.emailVerified !== false && onTabs && !gateReady)
  ) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

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

  if (gateHref && !pathMatchesHref(pathname, gateHref)) {
    return <Redirect href={gateHref} />;
  }

  return <>{children}</>;
}
