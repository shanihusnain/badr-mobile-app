import { Redirect, usePathname, useSegments, type Href } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "./useAuth";
import { resolvePostAuthHref } from "@/src/utils/resolvePostAuthHref";
import { isGoalOnboardingFinished } from "@/src/storage/onboardingRouteStorage";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

type TabsAccess = "unknown" | "allowed" | "blocked";

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
  /** Once tabs are allowed this session, skip remount + /me on return from private. */
  const tabsAccessRef = useRef<TabsAccess>("unknown");

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      tabsAccessRef.current = "unknown";
      setGateReady(false);
      setGateHref(null);
      return;
    }

    if (user?.emailVerified === false) {
      setGateReady(true);
      return;
    }

    // Only gate the tabs shell — private onboarding / logging screens stay put.
    if (!onTabs) {
      setGateHref(null);
      setGateReady(true);
      return;
    }

    // Already cleared for tabs this session — keep children mounted (ibadah sheet).
    if (tabsAccessRef.current === "allowed") {
      setGateHref(null);
      setGateReady(true);
      return;
    }

    let cancelled = false;

    void (async () => {
      // Fast local bypass: same outcome as resolvePostAuthHref without /me or spinner.
      const finishedLocally = await isGoalOnboardingFinished();
      if (cancelled) return;
      if (finishedLocally) {
        tabsAccessRef.current = "allowed";
        setGateHref(null);
        setGateReady(true);
        return;
      }

      // Need network / pending-route check — show spinner only for this path.
      setGateReady(false);
      const href = await resolvePostAuthHref({ user });
      if (cancelled) return;

      const allowedTabs =
        typeof href === "string" && href.startsWith("/(tabs)");

      tabsAccessRef.current = allowedTabs ? "allowed" : "blocked";
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
    // pathname intentionally omitted — in-tabs / return-from-private must not re-gate.
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
