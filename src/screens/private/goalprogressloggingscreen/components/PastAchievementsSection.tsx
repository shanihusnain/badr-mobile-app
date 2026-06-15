import React from "react";
import { GoalData } from "../../home/components/goalsData";
import { getLoggingFlowTemplate } from "../loggingFlowRegistry";
import { isQuranHoursGoalId } from "../types";
import { QuranHoursPastAchievements } from "@/components/molecules/QuranHoursPastAchievements";

type Props = {
  goalData: GoalData;
};

export function PastAchievementsSection({ goalData }: Props) {
  const template = getLoggingFlowTemplate(goalData.id);

  if (template !== "quran-hours" || !isQuranHoursGoalId(goalData.id)) {
    return null;
  }

  return <QuranHoursPastAchievements goalId={goalData.id} />;
}
