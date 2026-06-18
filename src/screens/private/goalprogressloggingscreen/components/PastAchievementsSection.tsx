import React from "react";
import { GoalData } from "../../home/components/goalsData";
import { getLoggingFlowTemplate } from "../loggingFlowRegistry";
import { isQuranHoursGoalId } from "../types";
import { isSurahRecitationGoalId } from "../quranRecitationTarget";
import { QuranHoursPastAchievements } from "@/components/molecules/QuranHoursPastAchievements";
import { QuranRecitationPastAchievements } from "@/components/molecules/QuranRecitationPastAchievements";
import { QuranCompletionPastAchievements } from "@/components/molecules/QuranCompletionPastAchievements";
import { QuranJuzPastAchievements } from "@/components/molecules/QuranJuzPastAchievements";
import { isCompletionGoalId, isJuzRecitationGoalId } from "../types";

type Props = {
  goalData: GoalData;
};

export function PastAchievementsSection({ goalData }: Props) {
  const template = getLoggingFlowTemplate(goalData.id);

  if (template === "quran-completion" && isCompletionGoalId(goalData.id)) {
    return <QuranCompletionPastAchievements goalId={goalData.id} />;
  }

  if (template === "quran-juz" && isJuzRecitationGoalId(goalData.id)) {
    return <QuranJuzPastAchievements goalId={goalData.id} />;
  }

  if (template === "quran-recitation" && isSurahRecitationGoalId(goalData.id)) {
    return <QuranRecitationPastAchievements goalId={goalData.id} />;
  }

  if (template === "quran-hours" && isQuranHoursGoalId(goalData.id)) {
    return <QuranHoursPastAchievements goalId={goalData.id} />;
  }

  return null;
}
