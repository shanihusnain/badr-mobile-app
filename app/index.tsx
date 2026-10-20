import { useState, useEffect } from "react";
import { Redirect, type Href } from "expo-router";

import AnimatedSplash from "@/components/atoms/AnimatedSplash";
import { useAuth } from "@/provider/useAuth";
import { resolvePostAuthHref } from "@/src/utils/resolvePostAuthHref";

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

      const href = await resolvePostAuthHref({ user });
      if (!cancelled) setBootHref(href);
    })();

    return () => {
      cancelled = true;
    };
  }, [splashDone, isLoading, isAuthenticated, user?.emailVerified, user?.email]);

  if (!splashDone) {
    return <AnimatedSplash onFinish={() => setSplashDone(true)} />;
  }

  if (isLoading || bootHref == null) {
    return null;
  }

  return <Redirect href={bootHref} />;
}
