import { useState, useEffect } from "react";
import { Redirect, type Href } from "expo-router";

import AnimatedSplash from "@/components/atoms/AnimatedSplash";
import { useAuth } from "@/provider/useAuth";
import { getPendingOnboardingRoute } from "@/src/storage/onboardingRouteStorage";

function unverifiedEmailHref(email?: string | null): Href {
  return {
    pathname: "/(auth)/verifyemail/[fromsignup]",
    params: {
      fromsignup: "true",
      ...(email ? { email } : {}),
    },
  };
}

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const [bootHref, setBootHref] = useState<Href | null>(null);

  useEffect(() => {
    if (!splashDone || isLoading) return;

    let cancelled = false;

    void (async () => {
      if (!isAuthenticated) {
        if (!cancelled) setBootHref("/(auth)/welcome");
        return;
      }

      // Tokens are issued at register time; stay on OTP until email is verified.
      if (user?.emailVerified === false) {
        if (!cancelled) setBootHref(unverifiedEmailHref(user?.email));
        return;
      }

      // Resume incomplete goal onboarding instead of always dumping to tabs.
      const pending = await getPendingOnboardingRoute();
      if (!cancelled) {
        setBootHref((pending as Href | null) ?? "/(tabs)/(home)");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    splashDone,
    isLoading,
    isAuthenticated,
    user?.emailVerified,
    user?.email,
  ]);

  if (!splashDone || isLoading || bootHref == null) {
    return <AnimatedSplash onFinish={() => setSplashDone(true)} />;
  }

  return <Redirect href={bootHref} />;
}
