import type { JuzMemorisationGoalId } from "@/src/screens/private/goalprogressloggingscreen/types";
import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import type { MemorisationAnalyticsView } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationSurahPastAchievementData";
import { JuzMemorisationPastAchievements } from "../QuranMemorisationPastAchievements/JuzMemorisationPastAchievementsSection";

type Props = {
  goalId: JuzMemorisationGoalId;
  isDetailed?: boolean;
  initialPeriod?: PastAchievementPeriod;
  initialAnalyticsView?: MemorisationAnalyticsView;
  initialJuzId?: string;
};

export function QuranMemorisationJuzPastAchievements({
  goalId,
  isDetailed = false,
  initialPeriod,
  initialAnalyticsView,
  initialJuzId,
}: Props) {
  return (
    <JuzMemorisationPastAchievements
      goalId={goalId}
      isDetailed={isDetailed}
      initialPeriod={initialPeriod}
      initialAnalyticsView={initialAnalyticsView}
      initialJuzId={initialJuzId}
    />
  );
}
