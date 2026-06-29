import React from "react";
import { GoalData } from "../../home/components/goalsData";
import { getLoggingFlowTemplate } from "../loggingFlowRegistry";
import { isQuranHoursGoalId } from "../types";
import { isSurahRecitationGoalId } from "../quranRecitationTarget";
import { isSurahMemorisationGoalId } from "../quranMemorisationTarget";
import { isHizbMemorisationGoalId } from "../quranMemorisationHizbTarget";
import { isJuzMemorisationGoalId } from "../quranMemorisationJuzTarget";
import { QuranHoursPastAchievements } from "@/components/molecules/QuranHoursPastAchievements";
import { QuranRecitationPastAchievements } from "@/components/molecules/QuranRecitationPastAchievements";
import { QuranMemorisationPastAchievements } from "@/components/molecules/QuranMemorisationPastAchievements";
import { QuranMemorisationJuzPastAchievements } from "@/components/molecules/QuranMemorisationJuzPastAchievements";
import { QuranCompletionPastAchievements } from "@/components/molecules/QuranCompletionPastAchievements";

import { PrayerPastAchievements } from "@/components/molecules/PrayerPastAchievements";
import { SadaqahPastAchievements } from "@/components/molecules/SadaqahPastAchievements";

import { QuranJuzPastAchievements } from "@/components/molecules/QuranJuzPastAchievements";
import { MissedRamadanFastsPastAchievements } from "@/components/molecules/MissedRamadanFastsPastAchievements";
import { MondayThursdayFastsPastAchievements } from "@/components/molecules/MondayThursdayFastsPastAchievements";
import { WhiteDaysFastsPastAchievements } from "@/components/molecules/WhiteDaysFastsPastAchievements";
import { isCompletionGoalId, isJuzRecitationGoalId } from "../types";
import { isMissedRamadanFastsGoalId } from "../missedRamadanFastsTarget";
import { isMondayThursdayFastsGoalId } from "../mondayThursdayFastsTarget";
import { isWhiteDaysFastsGoalId } from "../whiteDaysFastsTarget";

type Props = {
  goalData: GoalData;
  refreshKey?: number;
};

export function PastAchievementsSection({ goalData, refreshKey = 0 }: Props) {
  const template = getLoggingFlowTemplate(goalData.id);

  if (goalData.category === "PRAYER") {
    return <PrayerPastAchievements goalId={goalData.id} />;
  }

  if (goalData.category === "SADAQAH") {
    return <SadaqahPastAchievements goalId={goalData.id} />;
  }
  if (
    template === "missed-ramadan-fasts" &&
    isMissedRamadanFastsGoalId(goalData.id)
  ) {
    return <MissedRamadanFastsPastAchievements refreshKey={refreshKey} />;
  }

  if (
    template === "monday-thursday-fasts" &&
    isMondayThursdayFastsGoalId(goalData.id)
  ) {
    return <MondayThursdayFastsPastAchievements refreshKey={refreshKey} />;
  }

  if (
    template === "white-days-fasts" &&
    isWhiteDaysFastsGoalId(goalData.id)
  ) {
    return <WhiteDaysFastsPastAchievements refreshKey={refreshKey} />;
  }

  if (template === "quran-completion" && isCompletionGoalId(goalData.id)) {
    return <QuranCompletionPastAchievements goalId={goalData.id} />;
  }

  if (template === "quran-juz" && isJuzRecitationGoalId(goalData.id)) {
    return <QuranJuzPastAchievements goalId={goalData.id} />;
  }

  if (template === "quran-recitation" && isSurahRecitationGoalId(goalData.id)) {
    return <QuranRecitationPastAchievements goalId={goalData.id} />;
  }

  if (
    template === "quran-memorisation" &&
    isSurahMemorisationGoalId(goalData.id)
  ) {
    return <QuranMemorisationPastAchievements goalId={goalData.id} />;
  }

  if (
    template === "quran-memorisation" &&
    isHizbMemorisationGoalId(goalData.id)
  ) {
    return <QuranMemorisationPastAchievements goalId={goalData.id} />;
  }

  if (
    template === "quran-memorisation" &&
    isJuzMemorisationGoalId(goalData.id)
  ) {
    return <QuranMemorisationJuzPastAchievements goalId={goalData.id} />;
  }

  if (template === "quran-hours" && isQuranHoursGoalId(goalData.id)) {
    return <QuranHoursPastAchievements goalId={goalData.id} />;
  }

  return null;
}
