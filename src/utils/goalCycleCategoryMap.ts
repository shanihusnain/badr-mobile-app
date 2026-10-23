import type { GoalId } from "@/src/screens/private/home/components/goalsData";
import { GOAL_ID_TO_PRAYER_TYPE } from "@/src/utils/prayerGoalMap";
import { SADAQAH_TYPE_TO_UI_ID } from "@/src/utils/sadaqahGoalMap";
import type { GoalCycleCategoryGoal } from "@/src/api/queries/useGetGoalCycleCategoryGoals";

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

/**
 * Daily-progress detail card titles for Quran goals.
 * Base name on line 1; metric in parentheses on line 2, e.g.
 * "Quran Recitation\n(by Completion)".
 */
const QURAN_DAILY_PROGRESS_TITLES: Partial<Record<GoalId, string>> = {
  "quran-listening": "Quran Listening",
  "quran-Tajweed": "Quran Tajweed",
  "quran-recitationBySurah-daily": "Quran Recitation\n(by Surah)",
  "quran-recitationBySurah-weekly": "Quran Recitation\n(by Surah)",
  "quran-recitationByCompletion": "Quran Recitation\n(by Completion)",
  "quran-recitationByJuz": "Quran Recitation\n(by Juz)",
  "quran-memorisationBySurah": "Quran Memorization\n(by Surah)",
  "quran-memorisationByJuz": "Quran Memorization\n(by Juz)",
  "quran-memorisationByHizb": "Quran Memorization\n(by Hizb)",
};

/**
 * Figma `goalsData.*` keys for sadaqah (missed-zakat, lilah-donations, …).
 * Prefer these over the short API `displayName` (e.g. "Kaffarah").
 */
export function getSadaqahGoalsDataKey(goalType: string): string | null {
  return SADAQAH_TYPE_TO_UI_ID[goalType.toUpperCase()] ?? null;
}

/**
 * Fallback English titles matching `goalsData.<key>.title` / Figma when i18n
 * is unavailable. Forced-small-caps prep will lowercase these.
 */
const SADAQAH_DAILY_PROGRESS_TITLES: Partial<Record<GoalId, string>> = {
  "sadaqah-zakat": "Missed Zakat",
  "sadaqah-kafarah": "Kaffarah for Breaking Fasts or Oaths",
  "sadaqah-fidya": "Fidya",
  "sadaqah-Lillah": "Lillah Donations",
  "sadaqah-jariyah": "Sadaqah Jariyah",
  "sadaqah-volunteering": "Volunteering Services",
};

export function formatDailyProgressGoalTitle(
  goalId: GoalId,
  displayName: string,
): string {
  if (goalId === "prayer-tahiyyatMasjid") {
    return displayName.replace(/\s+Prayer$/i, "");
  }
  return (
    QURAN_DAILY_PROGRESS_TITLES[goalId] ??
    SADAQAH_DAILY_PROGRESS_TITLES[goalId] ??
    displayName
  );
}

function formatHoursAmount(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

/** Backend ISO code + amount, e.g. "AED 200" / "AED 1,000". */
function formatCurrencyWithBackendCode(
  currencyCode: string,
  amount: number,
): string {
  const code = currencyCode.trim().toUpperCase();
  const formatted = Math.round(amount || 0).toLocaleString("en-US");
  return `${code} ${formatted}`;
}

/**
 * Detail-card progress line matching Figma:
 * currency → backend code + amount ("AED 200" + "/AED 1,000")
 * kaffarah → "15" + "/60 items"
 * fidya → "42" + "/60 meals"
 * volunteering (API minutes) → "1.5" + "/4 hours"
 */
export function formatDailyProgressGoalSubtitle(goal: GoalCycleCategoryGoal): {
  subtitleCount: string;
  subtitleLabel: string;
} {
  const completed = goal.completed ?? 0;
  const target = goal.target ?? 0;
  const unit = (goal.unit ?? "").trim().toLowerCase();
  const goalType = (goal.goalType ?? "").toUpperCase();
  const currencyCode = String(goal.currencyCode ?? "").trim();

  if (unit === "currency" || currencyCode) {
    if (currencyCode) {
      return {
        subtitleCount: formatCurrencyWithBackendCode(currencyCode, completed),
        subtitleLabel: `/${formatCurrencyWithBackendCode(currencyCode, target)}`,
      };
    }
    // Currency unit but no code from API — show plain amounts.
    return {
      subtitleCount: Math.round(completed).toLocaleString("en-US"),
      subtitleLabel: `/${Math.round(target).toLocaleString("en-US")}`,
    };
  }

  if (goalType === "VOLUNTEERING" || unit === "minutes" || unit === "hours") {
    const completedHours = unit === "minutes" ? completed / 60 : completed;
    const targetHours = unit === "minutes" ? target / 60 : target;
    return {
      subtitleCount: formatHoursAmount(completedHours),
      subtitleLabel: `/${formatHoursAmount(targetHours)} hours`,
    };
  }

  if (goalType === "KAFFARAH" || unit.includes("clothing")) {
    return {
      subtitleCount: String(completed),
      subtitleLabel: `/${target} items`,
    };
  }

  if (goalType === "FIDYA" || unit === "meals") {
    return {
      subtitleCount: String(completed),
      subtitleLabel: `/${target} meals`,
    };
  }

  const unitLabel = goal.unit?.trim() ? ` ${goal.unit.trim()}` : "";
  return {
    subtitleCount: String(completed),
    subtitleLabel: `/${target}${unitLabel}`,
  };
}
