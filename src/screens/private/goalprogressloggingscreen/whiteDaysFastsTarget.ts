import { GoalId } from "../home/components/goalsData";

export type WhiteDaysFastsGoalId = "fasting-whiteDays";

export const WHITE_DAYS_FASTS_GOAL_TARGET = 3;

export const isWhiteDaysFastsGoalId = (
  goalId: GoalId,
): goalId is WhiteDaysFastsGoalId => goalId === "fasting-whiteDays";
