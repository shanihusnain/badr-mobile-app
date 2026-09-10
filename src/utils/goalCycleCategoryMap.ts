import type { GoalId } from "@/src/screens/private/home/components/goalsData";
import { GOAL_ID_TO_PRAYER_TYPE } from "@/src/utils/prayerGoalMap";

export type UiIbadahCategory = "PRAYER" | "QURAN" | "FASTING" | "SADAQAH";

export const API_CATEGORY_TO_UI: Record<string, UiIbadahCategory> = {
  prayer: "PRAYER",
  quran: "QURAN",
  fasting: "FASTING",
  sadaqah: "SADAQAH",
};

export const UI_CATEGORY_TO_API: Record<UiIbadahCategory, string> = {
  PRAYER: "prayer",
  QURAN: "quran",
  FASTING: "fasting",
  SADAQAH: "sadaqah",
};

export function toUiIbadahCategory(apiCategory: string): UiIbadahCategory | null {
  const mapped = API_CATEGORY_TO_UI[apiCategory.toLowerCase()];
  return mapped ?? null;
}

const PRAYER_TYPE_TO_GOAL_ID: Record<string, GoalId> = Object.fromEntries(
  Object.entries(GOAL_ID_TO_PRAYER_TYPE).map(([goalId, prayerType]) => [
    prayerType,
    goalId,
  ]),
) as Record<string, GoalId>;

const QURAN_TYPE_TO_GOAL_ID: Record<string, GoalId> = {
  LISTENING: "quran-listening",
  RECITATION_SURAH: "quran-recitationBySurah-daily",
  RECITATION_JUZ: "quran-recitationByJuz",
  RECITATION_COMPLETION: "quran-recitationByCompletion",
  MEMORIZATION_SURAH: "quran-memorisationBySurah",
  MEMORIZATION_JUZ: "quran-memorisationByJuz",
  MEMORIZATION_HIZB: "quran-memorisationByHizb",
  TAJWEED: "quran-Tajweed",
};

const FASTING_TYPE_TO_GOAL_ID: Record<string, GoalId> = {
  MISSED_RAMADAN: "fasting-ramadan",
  WHITE_DAYS: "fasting-whiteDays",
  MONDAY_THURSDAY: "fasting-mondayThursday",
  PROPHET_DAWOOD: "fasting-Dawwod",
};

const SADAQAH_TYPE_TO_GOAL_ID: Record<string, GoalId> = {
  SADAQAH_JARIYAH: "sadaqah-jariyah",
  MISSED_ZAKAT: "sadaqah-zakat",
  KAFFARAH: "sadaqah-kafarah",
  FIDYA: "sadaqah-fidya",
  LILLAH: "sadaqah-Lillah",
  VOLUNTEERING: "sadaqah-volunteering",
};

export function goalTypeToGoalId(
  category: string,
  goalType: string,
): GoalId | null {
  const key = goalType.toUpperCase();
  switch (category.toLowerCase()) {
    case "prayer":
      return PRAYER_TYPE_TO_GOAL_ID[key] ?? null;
    case "quran":
      return QURAN_TYPE_TO_GOAL_ID[key] ?? null;
    case "fasting":
      return FASTING_TYPE_TO_GOAL_ID[key] ?? null;
    case "sadaqah":
      return SADAQAH_TYPE_TO_GOAL_ID[key] ?? null;
    default:
      return (
        PRAYER_TYPE_TO_GOAL_ID[key] ??
        QURAN_TYPE_TO_GOAL_ID[key] ??
        FASTING_TYPE_TO_GOAL_ID[key] ??
        SADAQAH_TYPE_TO_GOAL_ID[key] ??
        null
      );
  }
}
