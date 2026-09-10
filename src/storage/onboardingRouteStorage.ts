import AsyncStorage from "@react-native-async-storage/async-storage";

const PENDING_ONBOARDING_ROUTE_KEY = "pending_onboarding_route";

/** Routes that must survive app reload until onboarding finishes. */
export type PendingOnboardingRoute =
  | "/(private)/greetingsscreen"
  | "/(private)/setpersonalizedgoals"
  | "/(private)/monthlygoalplanner";

export async function setPendingOnboardingRoute(
  href: PendingOnboardingRoute,
): Promise<void> {
  await AsyncStorage.setItem(PENDING_ONBOARDING_ROUTE_KEY, href);
}

export async function getPendingOnboardingRoute(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PENDING_ONBOARDING_ROUTE_KEY);
  } catch {
    return null;
  }
}

export async function clearPendingOnboardingRoute(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_ONBOARDING_ROUTE_KEY);
}
