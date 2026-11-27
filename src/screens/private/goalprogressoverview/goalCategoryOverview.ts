import { Colors } from "@/constants/theme";
import {
  getGoalById,
  type GoalData,
  type GoalId,
} from "../home/components/goalsData";
import type { GoalCycleCategoryGoal } from "@/src/api/queries/useGetGoalCycleCategoryGoals";
import type { GoalCycleCategorySummary } from "@/src/api/queries/useGetGoalCycleCategories";
import {
  formatDailyProgressGoalSubtitle,
  formatDailyProgressGoalTitle,
  getFastingGoalsDataKey,
  getSadaqahGoalsDataKey,
  goalTypeToGoalId,
  toUiIbadahCategory,
  type UiIbadahCategory,
} from "@/src/utils/goalCycleCategoryMap";

export type GoalCategorySlug = "prayer" | "quran" | "fasting" | "sadaqah";

type GoalCategory = GoalData["category"];

const SLUG_TO_CATEGORY: Record<GoalCategorySlug, GoalCategory> = {
  prayer: "PRAYER",
  quran: "QURAN",
  fasting: "FASTING",
  sadaqah: "SADAQAH",
};

export type CategoryProgressGoalRow = {
  id: GoalId;
  title: string;
  count: string;
  label: string;
  percentage: string;
  progressColor: string;
  titleFontSize?: number;
};

export type CategoryProgressOverview = {
  slug: GoalCategorySlug;
  category: GoalCategory;
  goals: CategoryProgressGoalRow[];
  goalsCount: number;
  averagePercentage: number;
  progressColor: string;
};

export const CATEGORY_ICON_COLOR: Record<GoalCategory, string> = {
  PRAYER: Colors.light.ringPrayer,
  QURAN: Colors.light.ringQuran,
  FASTING: Colors.light.green,
  SADAQAH: Colors.light.ringSadaqah,
};

export const isGoalCategorySlug = (value: string): value is GoalCategorySlug =>
  value in SLUG_TO_CATEGORY;

export type ProgressMessageTier =
  | "complete"
  | "outstanding"
  | "strong"
  | "promising";

export const getProgressMessageTier = (
  percentage: number,
): ProgressMessageTier => {
  if (percentage >= 100) return "complete";
  if (percentage >= 67) return "outstanding";
  if (percentage >= 34) return "strong";
  return "promising";
};

export function resolveCategorySlug(value: string): GoalCategorySlug | null {
  const normalized = value.trim().toLowerCase();
  if (isGoalCategorySlug(normalized)) return normalized;
  const ui = toUiIbadahCategory(normalized);
  if (!ui) return null;
  const entry = (
    Object.entries(SLUG_TO_CATEGORY) as [GoalCategorySlug, GoalCategory][]
  ).find(([, category]) => category === ui);
  return entry?.[0] ?? null;
}

export function findCategorySummary(
  summaries: GoalCycleCategorySummary[] | undefined,
  slug: GoalCategorySlug,
): GoalCycleCategorySummary | null {
  if (!summaries?.length) return null;
  return (
    summaries.find((item) => item.category?.toLowerCase() === slug) ?? null
  );
}

type MapGoalsOptions = {
  slug: GoalCategorySlug;
  goals: GoalCycleCategoryGoal[];
  progressColor: string;
  translateGoalsDataTitle?: (key: string) => string;
};

export function mapCategoryGoalsToRows({
  slug,
  goals,
  progressColor,
  translateGoalsDataTitle,
}: MapGoalsOptions): CategoryProgressGoalRow[] {
  return goals.flatMap((goal) => {
    const goalId = goalTypeToGoalId(slug, goal.goalType);
    const target = goal.target ?? 0;
    if (!goalId || target <= 0) return [];

    const goalsDataKey =
      getFastingGoalsDataKey(goal.goalType) ??
      getSadaqahGoalsDataKey(goal.goalType);
    const translated =
      goalsDataKey && translateGoalsDataTitle
        ? translateGoalsDataTitle(goalsDataKey).trim()
        : "";
    const title =
      translated || formatDailyProgressGoalTitle(goalId, goal.displayName);
    const { subtitleCount, subtitleLabel } =
      formatDailyProgressGoalSubtitle(goal);

    return [
      {
        id: goalId,
        title,
        count: subtitleCount,
        label: subtitleLabel,
        percentage: `${Math.round(goal.completedPct ?? 0)}%`,
        progressColor,
        titleFontSize: getGoalById(goalId)?.titleFontSize,
      },
    ];
  });
}

export function buildCategoryProgressOverview(params: {
  slug: GoalCategorySlug;
  summary: GoalCycleCategorySummary | null;
  goals: GoalCycleCategoryGoal[];
  translateGoalsDataTitle?: (key: string) => string;
}): CategoryProgressOverview {
  const { slug, summary, goals, translateGoalsDataTitle } = params;
  const category = SLUG_TO_CATEGORY[slug];
  const progressColor = CATEGORY_ICON_COLOR[category];
  const rows = mapCategoryGoalsToRows({
    slug,
    goals,
    progressColor,
    translateGoalsDataTitle,
  });

  const goalsCount =
    summary?.totalGoals && summary.totalGoals > 0
      ? summary.totalGoals
      : rows.length;

  const averagePercentage =
    summary?.completedPct != null
      ? Math.round(summary.completedPct)
      : rows.length > 0
        ? Math.round(
            rows.reduce(
              (sum, row) =>
                sum + (Number.parseInt(row.percentage.replace("%", ""), 10) || 0),
              0,
            ) / rows.length,
          )
        : 0;

  return {
    slug,
    category,
    goals: rows,
    goalsCount,
    averagePercentage,
    progressColor,
  };
}

export type { UiIbadahCategory };
