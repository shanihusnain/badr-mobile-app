/**
 * When the user opens a goal from the daily-progress sheet, then presses back
 * on the logging screen, home should reopen the sheet on the select-goal view.
 */

export type DailyProgressSheetReturnTarget = {
  view: "detail";
  category: string;
};

let pendingReturn: DailyProgressSheetReturnTarget | null = null;

export function setDailyProgressSheetReturn(
  target: DailyProgressSheetReturnTarget,
): void {
  pendingReturn = target;
}

export function consumeDailyProgressSheetReturn(): DailyProgressSheetReturnTarget | null {
  const next = pendingReturn;
  pendingReturn = null;
  return next;
}
