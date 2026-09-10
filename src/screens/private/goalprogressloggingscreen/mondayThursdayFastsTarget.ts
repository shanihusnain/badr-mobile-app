import { GoalId } from "../home/components/goalsData";

export type MondayThursdayFastsGoalId = "fasting-mondayThursday";

export const isMondayThursdayFastsGoalId = (
  goalId: GoalId,
): goalId is MondayThursdayFastsGoalId => goalId === "fasting-mondayThursday";
