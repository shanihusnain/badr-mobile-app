import { Colors } from "@/constants/theme";
import { getGoalsByCategory, GoalData } from "../home/components/goalsData";

export type GoalCategorySlug = "prayer" | "quran" | "fasting" | "sadaqah";

type GoalCategory = GoalData["category"];

const SLUG_TO_CATEGORY: Record<GoalCategorySlug, GoalCategory> = {
  prayer: "PRAYER",
  quran: "QURAN",
  fasting: "FASTING",
  sadaqah: "SADAQAH",
};

export type CategoryProgressOverview = {
  slug: GoalCategorySlug;
  category: GoalCategory;
  goals: GoalData[];
  goalsCount: number;
  averagePercentage: number;
  progressColor: string;
  notStarted: number;
  inProgress: number;
  completed: number;
};

export const CATEGORY_ICON_COLOR: Record<GoalCategory, string> = {
  PRAYER: Colors.light.ringPrayer,
  QURAN: Colors.light.ringQuran,
  FASTING: Colors.light.green,
  SADAQAH: Colors.light.ringSadaqah,
};

export const parseGoalPercentage = (percentage: string): number =>
  Number.parseInt(percentage.replace("%", ""), 10) || 0;

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

export const getCategoryProgressOverview = (
  slug: string,
): CategoryProgressOverview | null => {
  if (!isGoalCategorySlug(slug)) return null;

  const category = SLUG_TO_CATEGORY[slug];
  const goals = getGoalsByCategory(category);
  const goalsCount = goals.length;

  const averagePercentage =
    goalsCount > 0
      ? Math.round(
          goals.reduce(
            (sum, goal) => sum + parseGoalPercentage(goal.percentage),
            0,
          ) / goalsCount,
        )
      : 0;

  let notStarted = 0;
  let inProgress = 0;
  let completed = 0;

  goals.forEach((goal) => {
    const value = parseGoalPercentage(goal.percentage);
    if (value >= 100) completed += 1;
    else if (value === 0) notStarted += 1;
    else inProgress += 1;
  });

  return {
    slug,
    category,
    goals,
    goalsCount,
    averagePercentage,
    progressColor: goals[0]?.progressColor ?? Colors.light.green,
    notStarted,
    inProgress,
    completed,
  };
};
