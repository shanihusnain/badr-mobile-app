import { GoalId } from "../home/components/goalsData";

export type MissedRamadanFastsGoalId = "fasting-ramadan";

export const isMissedRamadanFastsGoalId = (
  goalId: GoalId,
): goalId is MissedRamadanFastsGoalId => goalId === "fasting-ramadan";
