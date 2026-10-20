import type { Href } from "expo-router";

import { getMe, type MeUser } from "@/src/api/queries/useGetMe";
import {
  getPendingOnboardingRoute,
  isGoalOnboardingFinished,
  type PendingOnboardingRoute,
} from "@/src/storage/onboardingRouteStorage";

type AuthUserLike = {
  email?: string | null;
  emailVerified?: boolean;
} | null;

function unverifiedEmailHref(email?: string | null): Href {
  return {
    pathname: "/(auth)/verifyemail/[fromsignup]",
    params: {
      fromsignup: "true",
      ...(email ? { email } : {}),
    },
  };
}

const ONBOARDING_FALLBACK: PendingOnboardingRoute = "/(private)/goalplanner";

/**
 * Where a signed-in user should land after boot / login / auth redirects.
 * Tabs only when GET /me reports hasSelectedAllGoals === true, or the user
 * has completed Review → Finish & Save on this device (local marker).
 */
export async function resolvePostAuthHref(options: {
  user: AuthUserLike;
  /** When already fetched (e.g. after login), skip a second /me call. */
  me?: MeUser | null;
}): Promise<Href> {
  const { user } = options;

  if (user?.emailVerified === false) {
    return unverifiedEmailHref(user?.email);
  }

  let me = options.me;
  if (me === undefined) {
    try {
      me = await getMe();
    } catch {
      me = null;
    }
  }

  const finishedLocally = await isGoalOnboardingFinished();
  if (me?.hasSelectedAllGoals === true || finishedLocally) {
    return "/(tabs)/(home)";
  }

  // Incomplete: resume last onboarding screen, or open the goal planner.
  const pending = await getPendingOnboardingRoute();
  return (pending as Href) ?? ONBOARDING_FALLBACK;
}
