import AsyncStorage from "@react-native-async-storage/async-storage";

const PENDING_ONBOARDING_ROUTE_KEY = "pending_onboarding_route";
/** Set on Review → Finish & Save; survives until sign-out. */
const GOAL_ONBOARDING_FINISHED_KEY = "goal_onboarding_finished";

/** Routes that must survive app reload until onboarding finishes. */
export type PendingOnboardingRoute =
  | "/(private)/greetingsscreen"
  | "/(private)/setpersonalizedgoals"
  | "/(private)/monthlygoalplanner"
  | "/(private)/goalplanner";

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

export async function setGoalOnboardingFinished(): Promise<void> {
  await AsyncStorage.setItem(GOAL_ONBOARDING_FINISHED_KEY, "1");
}

export async function isGoalOnboardingFinished(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(GOAL_ONBOARDING_FINISHED_KEY)) === "1";
  } catch {
    return false;
  }
}

export async function clearGoalOnboardingFinished(): Promise<void> {
  await AsyncStorage.removeItem(GOAL_ONBOARDING_FINISHED_KEY);
}
