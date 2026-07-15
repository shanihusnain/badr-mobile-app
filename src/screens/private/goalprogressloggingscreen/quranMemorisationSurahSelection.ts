export type SelectedSurahGoal = {
  id: string;
  surahName: string;
};

/** Shared selection list — keep Goals and Data free of circular imports. */
export const SELECTED_SURAH_GOALS: SelectedSurahGoal[] = [
  { id: "surah-al-baqarah", surahName: "Al-Baqarah" },
  { id: "surah-aal-imran", surahName: "Aal-Imran" },
  { id: "surah-an-nisa", surahName: "An-Nisa" },
  { id: "surah-al-maidah", surahName: "Al-Ma'idah" },
];

export function getSelectedMemorisationSurahIds(): string[] {
  return SELECTED_SURAH_GOALS.map((goal) => goal.id);
}
