import { GoalId } from "../home/components/goalsData";

export type ProphetDawoodFastsGoalId = "fasting-Dawwod";

export const PROPHET_DAWOOD_FASTS_GOAL_TARGET = 14;

export const isProphetDawoodFastsGoalId = (
  goalId: GoalId,
): goalId is ProphetDawoodFastsGoalId => goalId === "fasting-Dawwod";
