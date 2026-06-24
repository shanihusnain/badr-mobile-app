import {
  getMemorizedHizbAyahCount,
  getHizbMemorisationProgressPercent,
  isHizbFullyMemorized,
} from "./quranMemorisationHizbData";
import {
  getHizbDefinitions,
  getHizbDisplayName,
  getHizbVerseCount,
} from "./quranHizbVerseMap";

export type HizbMemorisationStatusKind =
  | "not-started"
  | "in-progress"
  | "completed";

export type HizbMemorisationGoal = {
  id: string;
  hizbName: string;
  rangeLabel: string;
  displayName: string;
  totalAyahs: number;
  memorizedAyahs: number;
  progressPercentage: number;
  completed: boolean;
  status: HizbMemorisationStatusKind;
};

export type MemorisationHizbFilterId = "all" | string;

const SELECTED_HIZB_GOALS = getHizbDefinitions();

function deriveHizbMemorisationStatus(
  memorizedAyahs: number,
  totalAyahs: number,
  completed: boolean,
): HizbMemorisationStatusKind {
  if (completed || memorizedAyahs >= totalAyahs) {
    return "completed";
  }

  if (memorizedAyahs > 0) {
    return "in-progress";
  }

  return "not-started";
}

function buildGoal(
  id: string,
  hizbName: string,
  rangeLabel: string,
): HizbMemorisationGoal {
  const totalAyahs = getHizbVerseCount(id);
  const memorizedAyahs = getMemorizedHizbAyahCount(id);
  const completed = isHizbFullyMemorized(id);
  const progressPercentage = getHizbMemorisationProgressPercent(id);

  return {
    id,
    hizbName,
    rangeLabel,
    displayName: getHizbDisplayName(id),
    totalAyahs,
    memorizedAyahs,
    progressPercentage,
    completed,
    status: deriveHizbMemorisationStatus(
      memorizedAyahs,
      totalAyahs,
      completed,
    ),
  };
}

export function getSelectedMemorisationHizbIds(): string[] {
  return SELECTED_HIZB_GOALS.map((goal) => goal.id);
}

export function getHizbMemorisationGoals(): HizbMemorisationGoal[] {
  return SELECTED_HIZB_GOALS.map((goal) =>
    buildGoal(goal.id, goal.hizbName, goal.rangeLabel),
  );
}

export function getHizbMemorisationGoalById(
  id: string,
): HizbMemorisationGoal | undefined {
  const base = SELECTED_HIZB_GOALS.find((goal) => goal.id === id);
  if (!base) return undefined;
  return buildGoal(base.id, base.hizbName, base.rangeLabel);
}

export function getHizbMemorisationGoalsForFilter(
  hizbFilter: MemorisationHizbFilterId,
): HizbMemorisationGoal[] {
  const goals = getHizbMemorisationGoals();
  if (hizbFilter === "all") return goals;
  const goal = goals.find((item) => item.id === hizbFilter);
  return goal ? [goal] : [];
}

export function getHizbMemorisationAggregateProgress() {
  const goals = getHizbMemorisationGoals();
  const totalMemorized = goals.reduce(
    (sum, goal) => sum + goal.memorizedAyahs,
    0,
  );
  const totalAyahs = goals.reduce((sum, goal) => sum + goal.totalAyahs, 0);
  const completedHizbs = goals.filter((goal) => goal.completed).length;
  const percent =
    totalAyahs > 0
      ? Math.min(100, Math.round((totalMemorized / totalAyahs) * 1000) / 10)
      : 0;

  return {
    totalMemorized,
    totalAyahs,
    completedHizbs,
    totalHizbs: goals.length,
    percent,
  };
}

export function toHizbMemorisationTargetConfig(goal: HizbMemorisationGoal) {
  return {
    hizbId: goal.id,
    hizbName: goal.displayName,
    totalAyahs: goal.totalAyahs,
  };
}
