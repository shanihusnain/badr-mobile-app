import {
  clampRecitationQuantity,
  getRecitationCycleTotal,
  type QuranRecitationTargetConfig,
  type RecitationFrequency,
} from "./quranRecitationTarget";

export type SurahRecitationStatusKind =
  | "not-started"
  | "in-progress"
  | "achieved";

export type SurahRecitationGoal = {
  id: string;
  surahName: string;
  frequency: RecitationFrequency;
  quantity: number;
  loggedRecitations: number;
  cycleTotal: number;
  status: SurahRecitationStatusKind;
  achievementPercent?: number;
};

function buildGoal(
  id: string,
  surahName: string,
  frequency: RecitationFrequency,
  quantity: number,
  loggedRecitations: number,
  status: SurahRecitationStatusKind,
  achievementPercent?: number,
): SurahRecitationGoal {
  const clampedQuantity = clampRecitationQuantity(quantity);
  return {
    id,
    surahName,
    frequency,
    quantity: clampedQuantity,
    loggedRecitations,
    cycleTotal: getRecitationCycleTotal(frequency, clampedQuantity),
    status,
    achievementPercent,
  };
}

export function deriveSurahRecitationStatus(
  loggedRecitations: number,
  cycleTotal: number,
): Pick<SurahRecitationGoal, "status" | "achievementPercent"> {
  if (loggedRecitations <= 0) {
    return { status: "not-started" };
  }

  const percent = Math.min(
    100,
    Math.round((loggedRecitations / cycleTotal) * 100),
  );

  if (percent >= 100) {
    return { status: "achieved", achievementPercent: 100 };
  }

  if (percent < 15) {
    return { status: "in-progress" };
  }

  return { status: "achieved", achievementPercent: percent };
}

const MOCK_SURAH_GOALS: SurahRecitationGoal[] = [
  buildGoal("surah-al-mulk", "Al-Mulk", "daily", 2, 0, "not-started"),
  buildGoal("surah-al-baqarah", "Al-Baqarah", "daily", 2, 14, "achieved", 25),
  buildGoal("surah-ya-sin", "Ya-Sin", "weekly", 3, 5, "in-progress"),
  buildGoal("surah-al-kahf", "Al-Kahf", "daily", 1, 18, "achieved", 64),
];

export function getSurahRecitationGoals(): SurahRecitationGoal[] {
  return MOCK_SURAH_GOALS;
}

export function getSurahRecitationGoalById(
  id: string,
): SurahRecitationGoal | undefined {
  return MOCK_SURAH_GOALS.find((goal) => goal.id === id);
}

export function toSurahTargetConfig(
  goal: SurahRecitationGoal,
): QuranRecitationTargetConfig {
  return {
    surahName: goal.surahName,
    frequency: goal.frequency,
    quantity: goal.quantity,
  };
}
