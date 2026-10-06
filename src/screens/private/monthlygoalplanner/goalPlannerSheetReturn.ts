/**
 * When the user opens "read more" from GoalPlannerSheet, then presses back
 * on the goal description screen, the monthly planner should reopen the sheet
 * on the same tab (prayer / quran / fasting / sadaqah / etc.).
 */

import type { Tab } from "./components/GoalPlannerSheet";

export type GoalPlannerSheetReturnTarget = {
  tab: Tab;
};

let pendingReturn: GoalPlannerSheetReturnTarget | null = null;

export function setGoalPlannerSheetReturn(
  target: GoalPlannerSheetReturnTarget,
): void {
  pendingReturn = target;
}

export function consumeGoalPlannerSheetReturn(): GoalPlannerSheetReturnTarget | null {
  const next = pendingReturn;
  pendingReturn = null;
  return next;
}
