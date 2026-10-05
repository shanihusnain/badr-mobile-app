import { resolvePrayerTypeFromGoalId } from "@/src/utils/prayerGoalMap";

/**
 * Maps a progress-logging `GoalId` to the `goaldescriptiondetails/[goal]` route
 * param used by monthly planner "read more".
 */
const LOGGING_GOAL_ID_TO_DESCRIPTION_PARAM: Record<string, string> = {
  "quran-listening": "quran-listening",
  "quran-Tajweed": "quran-tajweed",
  "quran-tajweed": "quran-tajweed",
  "quran-recitationBySurah-daily": "quran-recitation",
  "quran-recitationBySurah-weekly": "quran-recitation",
  "quran-recitationByCompletion": "quran-recitation",
  "quran-recitationByJuz": "quran-recitation",
  "quran-memorisationBySurah": "quran-memorization",
  "quran-memorisationByJuz": "quran-memorization",
  "quran-memorisationByHizb": "quran-memorization",
  "fasting-ramadan": "missed-fasts",
  "fasting-whiteDays": "white-days-fasts",
  "fasting-mondayThursday": "monday-and-thursday-fasts",
  "fasting-Dawwod": "dawood-fasts",
  "sadaqah-jariyah": "sadaqah-jariyah",
  "sadaqah-zakat": "missed-zakat",
  "sadaqah-kafarah": "kafarah-for-breaking-fasts",
  "sadaqah-fidya": "fidya",
  "sadaqah-Lillah": "lilah-donations",
  "sadaqah-volunteering": "volunteering-services",
};

export function resolveGoalDescriptionParamFromLoggingGoalId(
  goalId: string | null | undefined,
): string | null {
  if (!goalId) return null;

  const prayerType = resolvePrayerTypeFromGoalId(goalId);
  if (prayerType) return prayerType;

  return LOGGING_GOAL_ID_TO_DESCRIPTION_PARAM[goalId] ?? null;
}
