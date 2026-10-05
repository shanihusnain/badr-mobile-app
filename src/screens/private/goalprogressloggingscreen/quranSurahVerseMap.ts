/** Ayah counts for surahs used in mock memorisation / recitation goals. */
const SURAH_VERSE_COUNTS: Record<string, number> = {
  "1": 7,
  "2": 286,
  "3": 200,
  "4": 176,
  "5": 120,
  "surah-al-baqarah": 286,
  "surah-al-imran": 200,
  "surah-aal-imran": 200,
  "surah-an-nisa": 176,
  "surah-al-maidah": 120,
  "surah-al-mulk": 30,
  "surah-ya-sin": 83,
  "surah-al-kahf": 110,
  "surah-yusuf": 111,
};

export function getSurahVerseCount(surahId: string): number {
  return SURAH_VERSE_COUNTS[surahId] ?? 1;
}
