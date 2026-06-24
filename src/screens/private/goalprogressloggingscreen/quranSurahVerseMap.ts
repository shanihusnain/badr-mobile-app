/** Ayah counts for surahs used in mock memorisation / recitation goals. */
const SURAH_VERSE_COUNTS: Record<string, number> = {
  "surah-al-baqarah": 286,
  "surah-aal-imran": 200,
  "surah-an-nisa": 176,
  "surah-al-maidah": 120,
  "surah-al-mulk": 30,
  "surah-ya-sin": 83,
  "surah-al-kahf": 110,
};

export function getSurahVerseCount(surahId: string): number {
  return SURAH_VERSE_COUNTS[surahId] ?? 1;
}
