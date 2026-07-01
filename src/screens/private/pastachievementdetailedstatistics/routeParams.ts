import type { PastAchievementPeriod } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import type { RecitationAnalyticsView } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationPastAchievementData";
import type { JuzAnalyticsView } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationJuzPastAchievementData";
import type { JuzFilterId } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationJuzPastAchievementData";
import type { MissedRamadanAnalyticsView } from "@/src/screens/private/goalprogressloggingscreen/missedRamadanFastsPastAchievementData";
import type { ProphetDawoodAnalyticsView } from "@/src/screens/private/goalprogressloggingscreen/prophetDawoodFastsPastAchievementData";
import type { WhiteDaysAnalyticsView } from "@/src/screens/private/goalprogressloggingscreen/whiteDaysFastsPastAchievementData";
import type { MondayThursdayAnalyticsView } from "@/src/screens/private/goalprogressloggingscreen/mondayThursdayFastsPastAchievementData";

export type PastAchievementDetailedRouteParams = {
  goalId?: string;
  period?: string;
  analyticsView?: string;
  goalCategory?: string;
  goalType?: string;
  recitationType?: string;
  selectedSurahId?: string;
  selectedJuzFilter?: string;
  selectedHizbFilter?: string;
  selectedMemorisationJuzFilter?: string;
};

export function parsePastAchievementPeriod(
  value?: string,
): PastAchievementPeriod {
  if (value === "threeMonths" || value === "sixMonths") {
    return value;
  }
  return "monthly";
}

export function parseRecitationAnalyticsView(
  value?: string,
): RecitationAnalyticsView {
  if (value === "completedVsTimeSpent") {
    return "completedVsTimeSpent";
  }
  return "completedVsIncomplete";
}

export function parseJuzAnalyticsView(value?: string): JuzAnalyticsView {
  if (value === "completedVsTimeSpent") {
    return "completedVsTimeSpent";
  }
  return "completedVsIncomplete";
}

export function parseJuzFilterId(value?: string): JuzFilterId {
  if (!value || value === "all") {
    return "all";
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : "all";
}

export function parseMissedRamadanAnalyticsView(
  value?: string,
): MissedRamadanAnalyticsView {
  if (value === "completedVsTimeSpent" || value === "completedVsTime") {
    return "completedVsTime";
  }
  return "completedVsIncomplete";
}

export function parseProphetDawoodAnalyticsView(
  value?: string,
): ProphetDawoodAnalyticsView {
  return parseMissedRamadanAnalyticsView(value);
}

export function parseWhiteDaysAnalyticsView(
  value?: string,
): WhiteDaysAnalyticsView {
  return parseMissedRamadanAnalyticsView(value);
}

export function parseMondayThursdayAnalyticsView(
  value?: string,
): MondayThursdayAnalyticsView {
  return parseMissedRamadanAnalyticsView(value);
}
