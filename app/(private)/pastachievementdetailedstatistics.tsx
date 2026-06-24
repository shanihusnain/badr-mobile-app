import { useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import type { GoalId } from "@/src/screens/private/home/components/goalsData";
import { getGoalById } from "@/src/screens/private/home/components/goalsData";
import Header from "@/components/Header";
import PastAchievementDetailedStatisticsScreen from "@/src/screens/private/pastachievementdetailedstatistics";

export default function PastAchievementDetailedStatistics() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const goalData = getGoalById(goalId as GoalId);
  const title = goalData?.title?.toUpperCase() ?? "DETAILED STATISTICS";

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "",
          headerBackTitle: "Back",
          header: () => <Header title={title} />,
        }}
      />
      <PastAchievementDetailedStatisticsScreen goalId={goalId as GoalId} />
    </>
  );
}
