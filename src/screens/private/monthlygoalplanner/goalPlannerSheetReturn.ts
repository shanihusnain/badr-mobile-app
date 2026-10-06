/**
 * When the user opens "read more" from GoalPlannerSheet, then presses back
 * on the goal description screen, the monthly planner should reopen the sheet
 * on the same tab and scroll position.
 */

import type { Tab } from "./components/GoalPlannerSheet";

export type GoalPlannerSheetReturnTarget = {
  tab: Tab;
  /** Vertical offset of the goal list when leaving for description details. */
  scrollOffset?: number;
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
