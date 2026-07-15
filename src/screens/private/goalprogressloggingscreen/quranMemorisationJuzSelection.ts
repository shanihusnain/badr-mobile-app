import { getJuzDefinitions } from "./quranMemorisationJuzVerse";

/** Shared selection list — keep Goals and Data free of circular imports. */
export const SELECTED_JUZ_GOALS = getJuzDefinitions();

export function getSelectedMemorisationJuzIds(): string[] {
  return SELECTED_JUZ_GOALS.map((goal) => goal.id);
}
