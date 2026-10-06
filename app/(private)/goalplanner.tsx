import { GoalPlannerSheet } from "@/src/screens/private/monthlygoalplanner/components/GoalPlannerSheet";
import type { Tab } from "@/src/screens/private/monthlygoalplanner/components/GoalPlannerSheet";
import { setPendingOnboardingRoute } from "@/src/storage/onboardingRouteStorage";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

const VALID_TABS: Tab[] = [
  "cycle",
  "prayer",
  "quran",
  "fasting",
  "sadaqah",
  "review",
];

function parseTab(value: string | string[] | undefined): Tab | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  return VALID_TABS.includes(raw as Tab) ? (raw as Tab) : undefined;
}

export default function GoalPlannerScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const initialTab = parseTab(tab) ?? "cycle";

  useEffect(() => {
    void setPendingOnboardingRoute("/(private)/goalplanner");
  }, []);

  return <GoalPlannerSheet initialTab={initialTab} />;
}
