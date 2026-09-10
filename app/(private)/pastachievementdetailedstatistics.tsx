import { useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import type { GoalId } from "@/src/screens/private/home/components/goalsData";
import { getGoalById } from "@/src/screens/private/home/components/goalsData";
import Header from "@/components/Header";
import PastAchievementDetailedStatisticsScreen from "@/src/screens/private/pastachievementdetailedstatistics";
import { getActiveRecitationSurahGoal } from "@/src/screens/private/goalprogressloggingscreen/recitationSurahContext";
import type { PastAchievementDetailedRouteParams } from "@/src/screens/private/pastachievementdetailedstatistics/routeParams";

function resolveDetailedStatisticsTitle(
  goalId: GoalId,
  params: PastAchievementDetailedRouteParams,
): string {
  const goalData = getGoalById(goalId);
  if (!goalData) {
    return "DETAILED STATISTICS";
  }

  if (params.goalCategory === "surah" && params.selectedSurahId) {
    const surahGoal = getActiveRecitationSurahGoal(params.selectedSurahId);
    if (surahGoal?.surahName) {
      return surahGoal.surahName.toUpperCase();
    }
  }

  if (
    params.goalCategory === "juz" &&
    params.selectedJuzFilter &&
    params.selectedJuzFilter !== "all"
  ) {
    return `JUZ ${params.selectedJuzFilter}`;
  }

  if (
    params.goalCategory === "memorisation_juz" &&
    params.selectedMemorisationJuzFilter &&
    params.selectedMemorisationJuzFilter !== "all"
  ) {
    const juzNumber = params.selectedMemorisationJuzFilter.replace(/^juz-/, "");
    return `JUZ ${juzNumber}`;
  }

  if (
    params.goalCategory === "hizb" &&
    params.selectedHizbFilter &&
    params.selectedHizbFilter !== "all"
  ) {
    const hizbNumber = params.selectedHizbFilter.replace(/^hizb-/, "");
    return `HIZB ${hizbNumber}`;
  }

  return goalData.title?.toUpperCase() ?? "DETAILED STATISTICS";
}

export default function PastAchievementDetailedStatistics() {
  const params = useLocalSearchParams<PastAchievementDetailedRouteParams>();
  const goalId = (params.goalId ?? "") as GoalId;
  const title = resolveDetailedStatisticsTitle(goalId, params);

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
      <PastAchievementDetailedStatisticsScreen
        goalId={goalId}
        period={params.period}
        analyticsView={params.analyticsView}
        goalCategory={params.goalCategory}
        selectedSurahId={params.selectedSurahId}
        selectedJuzFilter={params.selectedJuzFilter}
        selectedHizbFilter={params.selectedHizbFilter}
        selectedMemorisationJuzFilter={params.selectedMemorisationJuzFilter}
      />
    </>
  );
}
