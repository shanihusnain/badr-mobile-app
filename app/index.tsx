import { useState, useEffect } from "react";
import { Redirect, type Href } from "expo-router";

import { useAuth } from "@/provider/useAuth";
import { resolvePostAuthHref } from "@/src/utils/resolvePostAuthHref";

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [bootHref, setBootHref] = useState<Href | null>(null);

  useEffect(() => {
    if (isLoading) return;

    let cancelled = false;

    void (async () => {
      const href = !isAuthenticated
        ? "/(auth)/welcome"
        : await resolvePostAuthHref({ user });

      if (!cancelled) setBootHref(href);
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoading, isAuthenticated, user?.emailVerified, user?.email]);

  if (isLoading || bootHref == null) {
    return null;
  }

  return <Redirect href={bootHref} />;
}
