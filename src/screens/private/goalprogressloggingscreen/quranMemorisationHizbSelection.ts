import { getHizbDefinitions } from "./quranHizbVerseMap";

/** Shared selection list — keep Goals and Data free of circular imports. */
export const SELECTED_HIZB_GOALS = getHizbDefinitions();

export function getSelectedMemorisationHizbIds(): string[] {
  return SELECTED_HIZB_GOALS.map((goal) => goal.id);
}
