import {
  getMemorizedJuzAyahCount,
  getJuzMemorisationProgressPercent,
  isJuzFullyMemorized,
} from "./quranMemorisationJuzData";
import {
  getJuzDefinitions,
  getJuzVerseCount,
  type JuzDefinition,
} from "./quranMemorisationJuzVerse";

export type JuzMemorisationStatusKind =
  | "not-started"
  | "in-progress"
  | "completed";

export type JuzMemorisationGoal = {
  id: string;
  juzNumber: number;
  juzName: string;
  endLabel: string;
  rangeLabel: string;
  totalAyahs: number;
  memorizedAyahs: number;
  progressPercentage: number;
  completed: boolean;
  status: JuzMemorisationStatusKind;
};

export type MemorisationJuzFilterId = "all" | string;

const SELECTED_JUZ_GOALS = getJuzDefinitions();

function deriveJuzMemorisationStatus(
  memorizedAyahs: number,
  totalAyahs: number,
  completed: boolean,
): JuzMemorisationStatusKind {
  if (completed || memorizedAyahs >= totalAyahs) {
    return "completed";
  }

  if (memorizedAyahs > 0) {
    return "in-progress";
  }

  return "not-started";
}

function buildGoal(definition: JuzDefinition): JuzMemorisationGoal {
  const totalAyahs = getJuzVerseCount(definition.id);
  const memorizedAyahs = getMemorizedJuzAyahCount(definition.id);
  const completed = isJuzFullyMemorized(definition.id);
  const progressPercentage = getJuzMemorisationProgressPercent(definition.id);

  return {
    id: definition.id,
    juzNumber: definition.juzNumber,
    juzName: definition.juzName,
    endLabel: definition.endLabel,
    rangeLabel: definition.rangeLabel,
    totalAyahs,
    memorizedAyahs,
    progressPercentage,
    completed,
    status: deriveJuzMemorisationStatus(
      memorizedAyahs,
      totalAyahs,
      completed,
    ),
  };
}

export function getSelectedMemorisationJuzIds(): string[] {
  return SELECTED_JUZ_GOALS.map((goal) => goal.id);
}

export function getJuzMemorisationGoals(): JuzMemorisationGoal[] {
  return SELECTED_JUZ_GOALS.map((definition) => buildGoal(definition));
}

export function getJuzMemorisationGoalById(
  id: string,
): JuzMemorisationGoal | undefined {
  const base = SELECTED_JUZ_GOALS.find((goal) => goal.id === id);
  if (!base) return undefined;
  return buildGoal(base);
}

export function getJuzMemorisationGoalsForFilter(
  juzFilter: MemorisationJuzFilterId,
): JuzMemorisationGoal[] {
  const goals = getJuzMemorisationGoals();
  if (juzFilter === "all") return goals;
  const goal = goals.find((item) => item.id === juzFilter);
  return goal ? [goal] : [];
}

export function getJuzMemorisationAggregateProgress() {
  const goals = getJuzMemorisationGoals();
  const totalMemorized = goals.reduce(
    (sum, goal) => sum + goal.memorizedAyahs,
    0,
  );
  const totalAyahs = goals.reduce((sum, goal) => sum + goal.totalAyahs, 0);
  const completedJuzs = goals.filter((goal) => goal.completed).length;
  const percent =
    totalAyahs > 0
      ? Math.min(100, Math.round((totalMemorized / totalAyahs) * 1000) / 10)
      : 0;

  return {
    totalMemorized,
    totalAyahs,
    completedJuzs,
    totalJuzs: goals.length,
    percent,
  };
}

export function toJuzMemorisationTargetConfig(goal: JuzMemorisationGoal) {
  return {
    juzId: goal.id,
    juzName: goal.juzName,
    juzNumber: goal.juzNumber,
    totalAyahs: goal.totalAyahs,
  };
}
