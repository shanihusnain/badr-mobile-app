const SURAH_NAMES: readonly string[] = [
  "Al-Fatiha", "Al-Baqarah", "Al-Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am",
  "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd",
  "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Ta-Ha",
  "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara",
  "An-Naml", "Al-Qasas", "Al-Ankabut", "Ar-Rum", "Luqman", "As-Sajdah",
  "Al-Ahzab", "Saba", "Fatir", "Ya-Sin", "As-Saffat", "Sad", "Al-Zumar",
  "Ghafir", "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah",
  "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf", "Adh-Dhariyat",
  "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid",
  "Al-Mujadila", "Al-Hashr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah",
  "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam",
  "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir",
  "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba", "An-Naziat", "Abasa",
  "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj",
  "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad", "Ash-Shams",
  "Al-Layl", "Ad-Duha", "Ash-Sharh", "At-Tin", "Al-Alaq", "Al-Qadr",
  "Al-Bayyinah", "Az-Zalzalah", "Al-Adiyat", "Al-Qari'ah", "At-Takathur",
  "Al-Asr", "Al-Humazah", "Al-Fil", "Quraysh", "Al-Ma'un", "Al-Kawthar",
  "Al-Kafirun", "An-Nasr", "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas",
];

const SURAH_AYAH_COUNTS: readonly number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110,
  98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88,
  75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24,
  13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
  29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3,
  9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

/** Standard Hafs juz start positions (surah number, ayah number). */
const JUZ_STARTS: readonly { surah: number; ayah: number }[] = [
  { surah: 1, ayah: 1 },
  { surah: 2, ayah: 142 },
  { surah: 2, ayah: 253 },
  { surah: 3, ayah: 92 },
  { surah: 4, ayah: 24 },
  { surah: 4, ayah: 147 },
  { surah: 5, ayah: 82 },
  { surah: 5, ayah: 110 },
  { surah: 6, ayah: 51 },
  { surah: 6, ayah: 111 },
  { surah: 7, ayah: 88 },
  { surah: 7, ayah: 171 },
  { surah: 8, ayah: 41 },
  { surah: 9, ayah: 93 },
  { surah: 11, ayah: 6 },
  { surah: 12, ayah: 53 },
  { surah: 15, ayah: 1 },
  { surah: 17, ayah: 1 },
  { surah: 21, ayah: 1 },
  { surah: 23, ayah: 1 },
  { surah: 25, ayah: 21 },
  { surah: 27, ayah: 1 },
  { surah: 29, ayah: 46 },
  { surah: 33, ayah: 31 },
  { surah: 36, ayah: 28 },
  { surah: 39, ayah: 32 },
  { surah: 41, ayah: 47 },
  { surah: 46, ayah: 1 },
  { surah: 51, ayah: 31 },
  { surah: 58, ayah: 1 },
];

type VerseRef = { surah: number; ayah: number };

function getSurahName(surah: number): string {
  return SURAH_NAMES[surah - 1] ?? `Surah ${surah}`;
}

function compareVerse(a: VerseRef, b: VerseRef): number {
  if (a.surah !== b.surah) return a.surah - b.surah;
  return a.ayah - b.ayah;
}

function previousVerse(ref: VerseRef): VerseRef | null {
  if (ref.ayah > 1) {
    return { surah: ref.surah, ayah: ref.ayah - 1 };
  }
  if (ref.surah <= 1) return null;
  const prevSurah = ref.surah - 1;
  return { surah: prevSurah, ayah: SURAH_AYAH_COUNTS[prevSurah - 1] };
}

function nextVerse(ref: VerseRef): VerseRef | null {
  const maxAyah = SURAH_AYAH_COUNTS[ref.surah - 1];
  if (ref.ayah < maxAyah) {
    return { surah: ref.surah, ayah: ref.ayah + 1 };
  }
  if (ref.surah >= 114) return null;
  return { surah: ref.surah + 1, ayah: 1 };
}

function buildJuzVerseList(juz: number): VerseRef[] {
  const index = Math.min(Math.max(juz, 1), 30) - 1;
  const start = JUZ_STARTS[index];
  const nextJuzStart =
    index < JUZ_STARTS.length - 1
      ? JUZ_STARTS[index + 1]
      : { surah: 114, ayah: 6 };
  const end = previousVerse(nextJuzStart) ?? nextJuzStart;

  const verses: VerseRef[] = [];
  let current: VerseRef = { ...start };

  while (compareVerse(current, end) <= 0) {
    verses.push({ ...current });
    const next = nextVerse(current);
    if (!next || compareVerse(next, end) > 0) break;
    current = next;
  }

  return verses;
}

const juzVerseCache = new Map<number, VerseRef[]>();

function getJuzVerses(juz: number): VerseRef[] {
  const clamped = Math.min(Math.max(juz, 1), 30);
  const cached = juzVerseCache.get(clamped);
  if (cached) return cached;

  const verses = buildJuzVerseList(clamped);
  juzVerseCache.set(clamped, verses);
  return verses;
}

export function formatJuzVerseRefLabel(verse: VerseRef): string {
  return `${getSurahName(verse.surah)} ${verse.surah}:${verse.ayah}`;
}

export type JuzVerseMetadata = {
  juzNumber: number;
  startSurahName: string;
  startSurahNumber: number;
  startAyah: number;
  endSurahName: string;
  endSurahNumber: number;
  endAyah: number;
  totalVerses: number;
  startLabel: string;
  endLabel: string;
  rangeLabel: string;
};

export function getJuzVerseMetadata(juz: number): JuzVerseMetadata {
  const verses = getJuzVerses(juz);
  const first = verses[0] ?? { surah: 1, ayah: 1 };
  const last = verses[verses.length - 1] ?? first;
  const startLabel = formatJuzVerseRefLabel(first);
  const endLabel = formatJuzVerseRefLabel(last);

  return {
    juzNumber: juz,
    startSurahName: getSurahName(first.surah),
    startSurahNumber: first.surah,
    startAyah: first.ayah,
    endSurahName: getSurahName(last.surah),
    endSurahNumber: last.surah,
    endAyah: last.ayah,
    totalVerses: verses.length,
    startLabel,
    endLabel,
    rangeLabel: `${startLabel} – ${endLabel}`,
  };
}

export function getJuzRangeLabel(juz: number): string {
  return getJuzVerseMetadata(juz).rangeLabel;
}

export function formatJuzVerseLabel(juz: number, position: number): string {
  const verses = getJuzVerses(juz);
  const index = Math.min(Math.max(position, 1), verses.length) - 1;
  const verse = verses[index];
  if (!verse) return `:${position}`;
  return `${getSurahName(verse.surah)}:${verse.ayah}`;
}

export function getJuzEndLabel(juz: number): string {
  const verses = getJuzVerses(juz);
  const last = verses[verses.length - 1];
  if (!last) return "";
  return formatJuzVerseRefLabel(last);
}

export function getJuzVerseCountFromMap(juz: number): number {
  return getJuzVerses(juz).length;
}
