/** Shown when a past-achievement chart period has no goal/data. */
export const PAST_ACHIEVEMENT_NO_DATA = "--";

/** Empty bar/period: no completed and no incomplete (no goal was set). */
export function isPastAchievementBarEmpty(
  completed: number,
  incomplete: number,
): boolean {
  return (Number(completed) || 0) <= 0 && (Number(incomplete) || 0) <= 0;
}

/**
 * Show dashes instead of zeros when the currently displayed stats have no data.
 * Does not require a selected chart bar — empty overall periods also use dashes.
 */
export function shouldShowPastAchievementNoDataDash(
  completed: number,
  incomplete: number,
): boolean {
  return isPastAchievementBarEmpty(completed, incomplete);
}

export function formatPastAchievementOrDash(
  value: number,
  format: (n: number) => string,
  isEmpty: boolean,
): string {
  return isEmpty ? PAST_ACHIEVEMENT_NO_DATA : format(value);
}
