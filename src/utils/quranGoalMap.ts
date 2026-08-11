import type { ImageSourcePropType } from "react-native";
import {
  quranlisteningbottomsheetimage,
  quranrecitationbottomsheetimage,
  quranmemorizationbottomsheetimage,
  qurantajweedbottomsheetimage,
} from "@/assets/images";
import type {
  QuranGoalItemPayload,
  UpsertQuranGoalPayload,
} from "@/src/api/mutations/useUpsertQuranGoal";

/** Backend quranGoalType → local UI card id */
export const QURAN_TYPE_TO_UI_ID: Record<string, string> = {
  LISTENING: "quran-listening",
  RECITATION_SURAH: "quran-recitation",
  RECITATION_JUZ: "quran-recitation",
  RECITATION_COMPLETION: "quran-recitation",
  MEMORIZATION_SURAH: "quran-memorization",
  MEMORIZATION_JUZ: "quran-memorization",
  MEMORIZATION_HIZB: "quran-memorization",
  TAJWEED: "quran-tajweed",
};

/** Primary API type for each UI card (used for detail/description fetches). */
export const UI_ID_TO_QURAN_TYPE: Record<string, string> = {
  "quran-listening": "LISTENING",
  "quran-recitation": "RECITATION_SURAH",
  "quran-memorization": "MEMORIZATION_SURAH",
  "quran-tajweed": "TAJWEED",
};

/** Accept either API enum or local UI id */
export function resolveQuranType(goalKey: string): string {
  if (QURAN_TYPE_TO_UI_ID[goalKey]) return goalKey;
  return UI_ID_TO_QURAN_TYPE[goalKey] ?? goalKey;
}

export function resolveQuranUiId(goalKey: string): string {
  if (UI_ID_TO_QURAN_TYPE[goalKey]) return goalKey;
  return QURAN_TYPE_TO_UI_ID[goalKey] ?? goalKey;
}

export function isQuranGoalKey(goalKey: string): boolean {
  return !!QURAN_TYPE_TO_UI_ID[goalKey] || !!UI_ID_TO_QURAN_TYPE[goalKey];
}

export function getQuranTypesForUiId(uiId: string): string[] {
  return Object.entries(QURAN_TYPE_TO_UI_ID)
    .filter(([, mappedUiId]) => mappedUiId === uiId)
    .map(([quranGoalType]) => quranGoalType);
}

/** UI metric → backend quranGoalType */
export const RECITATION_METRIC_TO_TYPE = {
  surah: "RECITATION_SURAH",
  juz: "RECITATION_JUZ",
  completion: "RECITATION_COMPLETION",
} as const;

export const MEMORIZATION_METRIC_TO_TYPE = {
  surah: "MEMORIZATION_SURAH",
  juz: "MEMORIZATION_JUZ",
  hizb: "MEMORIZATION_HIZB",
} as const;

const SURAH_NAMES: Record<number, string> = {
  1: "Al-Baqarah",
  2: "Al-Imran",
  3: "An-Nisa",
  4: "Al-Maidah",
};

function toApiFrequency(freq?: string): string {
  if (!freq) return "DAILY";
  return freq.toUpperCase();
}

type SurahMetricValue = {
  selectedSurahs?: number[];
  surahSettings?: Record<
    number,
    { frequency?: "daily" | "weekly"; times?: number }
  >;
  surahNames?: Record<number, string>;
};

type JuzMetricValue = {
  start?: number;
  end?: number;
  /** Memorization juz multi-select */
  selectedJuzs?: number[];
};

export function getQuranGoalTypeForMetric(
  variant: "recitation" | "memorization" | "others",
  metric: "surah" | "juz" | "completion" | "hizb",
): string | null {
  if (variant === "memorization") {
    if (metric === "completion") return null;
    return MEMORIZATION_METRIC_TO_TYPE[metric];
  }
  if (metric === "hizb") return null;
  return RECITATION_METRIC_TO_TYPE[metric];
}

/** Exact detail payload from GET quran-goals/:quranGoalType */
export type QuranGoalDetailItem = {
  itemType: "SURAH" | "JUZ" | "HIZB" | string;
  itemNumber: number;
  surahName?: string | null;
  verseStart?: number | null;
  verseEnd?: number | null;
  targetCount?: number | null;
  completedCount?: number | null;
  status?: string | null;
};

export type QuranGoalDetail = {
  quranGoalId: string | null;
  quranGoalType: string;
  isActive: boolean;
  trackingMetric: "HOURS" | "COMPLETION" | "JUZ" | "HIZB" | "SURAH" | string;
  /** Backend may return number or numeric string */
  targetValue: number | string;
  completedValue: number | string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | string;
  items: QuranGoalDetailItem[];
};

export type QuranSurahOption = {
  id: number;
  surahName: string;
  surahTitle: string;
  verses?: string;
};

export type QuranHizbOption = {
  id: number;
  hizbName: string;
  verses?: string;
};

export type QuranJuzOption = {
  id: number;
  /** e.g. "Juz 1 | Al-Fatiha 1:1 – Al-Baqarah 2:141" */
  juzName: string;
  /** e.g. "(148 verses)" */
  verses?: string;
  startSurah?: number;
  startAyah?: number;
  endSurah?: number;
  endAyah?: number;
  totalAyahs?: number;
};

function asRecord(value: unknown): Record<string, any> | null {
  return value && typeof value === "object"
    ? (value as Record<string, any>)
    : null;
}

function pickNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return undefined;
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

/** Remove English glosses like "(The Opening)" from surah/hizb labels */
function stripEnglishParenthetical(label: string): string {
  return label.replace(/\s*\([^)]*\)/g, "").replace(/\s{2,}/g, " ").trim();
}

/** Map reference.surahs (or legacy /api/quran-reference/surahs) → UI options */
export function mapSurahOptionsFromReference(
  rows: unknown[] | null | undefined,
): QuranSurahOption[] {
  if (!Array.isArray(rows)) return [];
  const seen = new Set<number>();
  const options: QuranSurahOption[] = [];
  for (const item of rows) {
    const row = asRecord(item);
    if (!row) continue;
    const id = pickNumber(
      row.number,
      row.id,
      row.surahNumber,
      row.surahId,
      row.itemNumber,
    );
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const translit = pickString(row.nameTranslit, row.surahName, row.name, row.slug);
    const english = pickString(row.nameEnglish, row.englishName, row.surahTitle, row.title);
    const verseCount = pickNumber(
      row.verseCount,
      row.versesCount,
      row.totalVerses,
      row.totalAyahs,
      row.verses,
    );
    const verses = verseCount != null ? `(${verseCount} verses)` : undefined;
    const label =
      translit && english
        ? `${translit} (${english})`
        : translit ?? english ?? pickString(row.nameArabic) ?? `Surah ${id}`;
    options.push({
      id,
      surahName: label,
      surahTitle: label,
      verses,
    });
  }
  return options.sort((a, b) => a.id - b.id);
}

/** Map reference.juz → UI options */
export function mapJuzOptionsFromReference(
  rows: unknown[] | null | undefined,
  surahRows?: unknown[] | null | undefined,
): QuranJuzOption[] {
  if (!Array.isArray(rows)) return [];

  const surahNameMap = new Map<number, string>();
  for (const item of surahRows ?? []) {
    const row = asRecord(item);
    if (!row) continue;
    const surahId = pickNumber(
      row.number,
      row.id,
      row.surahNumber,
      row.surahId,
      row.itemNumber,
    );
    if (!surahId) continue;
    const shortName = stripEnglishParenthetical(
      pickString(row.nameTranslit, row.surahName, row.name, row.slug) ??
        pickString(row.nameEnglish, row.englishName) ??
        SURAH_NAMES[surahId] ??
        `Surah ${surahId}`,
    );
    surahNameMap.set(surahId, shortName);
  }

  const seen = new Set<number>();
  const options: QuranJuzOption[] = [];
  for (const item of rows) {
    const row = asRecord(item);
    if (!row) continue;
    const id = pickNumber(row.number, row.id, row.juzNumber, row.itemNumber);
    if (!id || seen.has(id)) continue;
    seen.add(id);

    const startSurah = pickNumber(row.startSurah);
    const startAyah = pickNumber(
      row.startAyah,
      row.verseStart,
      row.startVerse,
    );
    const endSurah = pickNumber(row.endSurah);
    const endAyah = pickNumber(row.endAyah, row.verseEnd, row.endVerse);
    const totalAyahs = pickNumber(
      row.totalAyahs,
      row.totalVerses,
      row.verseCount,
      row.versesCount,
    );

    const startSurahName =
      startSurah != null
        ? surahNameMap.get(startSurah) ??
          SURAH_NAMES[startSurah] ??
          `Surah ${startSurah}`
        : undefined;
    const endSurahName =
      endSurah != null
        ? surahNameMap.get(endSurah) ??
          SURAH_NAMES[endSurah] ??
          `Surah ${endSurah}`
        : undefined;

    const rangeLabel =
      startSurah != null &&
      startAyah != null &&
      endSurah != null &&
      endAyah != null
        ? `${startSurahName} ${startSurah}:${startAyah} – ${endSurahName} ${endSurah}:${endAyah}`
        : undefined;

    const juzName = rangeLabel
      ? `Juz ${id} | ${rangeLabel}`
      : (pickString(row.nameEnglish, row.label, row.title, row.name) ??
        `Juz ${id}`);

    options.push({
      id,
      juzName,
      verses: totalAyahs != null ? `(${totalAyahs} verses)` : undefined,
      startSurah,
      startAyah,
      endSurah,
      endAyah,
      totalAyahs,
    });
  }
  return options.sort((a, b) => a.id - b.id);
}

/** Map reference.hizb (or legacy /api/quran-reference/hizb) → UI options */
export function mapHizbOptionsFromReference(
  rows: unknown[] | null | undefined,
  surahRows?: unknown[] | null | undefined,
): QuranHizbOption[] {
  if (!Array.isArray(rows)) return [];
  const surahNameMap = new Map<number, string>();
  const surahVerseCountMap = new Map<number, number>();

  for (const item of surahRows ?? []) {
    const row = asRecord(item);
    if (!row) continue;
    const surahId = pickNumber(
      row.number,
      row.id,
      row.surahNumber,
      row.surahId,
      row.itemNumber,
    );
    if (!surahId) continue;
    const translit = pickString(
      row.nameTranslit,
      row.surahName,
      row.name,
      row.slug,
    );
    // Hizb labels use short transliteration only (no English parenthetical)
    const label =
      translit ??
      pickString(row.nameArabic) ??
      SURAH_NAMES[surahId] ??
      `Surah ${surahId}`;
    surahNameMap.set(surahId, stripEnglishParenthetical(label));

    const surahVerseCount = pickNumber(
      row.verseCount,
      row.versesCount,
      row.totalVerses,
      row.totalAyahs,
    );
    if (surahVerseCount != null) {
      surahVerseCountMap.set(surahId, surahVerseCount);
    }
  }

  const seen = new Set<number>();
  const options: QuranHizbOption[] = [];
  for (const item of rows) {
    const row = asRecord(item);
    if (!row) continue;
    const id = pickNumber(
      row.number,
      row.id,
      row.hizbNumber,
      row.hizbId,
      row.itemNumber,
    );
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const verseStart = pickNumber(
      row.verseStart,
      row.startVerse,
      row.startAyah,
    );
    const verseEnd = pickNumber(row.verseEnd, row.endVerse, row.endAyah);
    const verseCount = pickNumber(
      row.verseCount,
      row.versesCount,
      row.totalVerses,
      row.totalAyahs,
    );
    const startSurah = pickNumber(row.startSurah);
    const endSurah = pickNumber(row.endSurah);
    const startSurahName =
      startSurah != null
        ? stripEnglishParenthetical(
            surahNameMap.get(startSurah) ??
              SURAH_NAMES[startSurah] ??
              `Surah ${startSurah}`,
          )
        : undefined;
    const endSurahName =
      endSurah != null
        ? stripEnglishParenthetical(
            surahNameMap.get(endSurah) ??
              SURAH_NAMES[endSurah] ??
              `Surah ${endSurah}`,
          )
        : undefined;

    const rangeLabel =
      startSurah != null &&
      verseStart != null &&
      endSurah != null &&
      verseEnd != null
        ? `${startSurahName} ${startSurah}:${verseStart} – ${endSurahName} ${endSurah}:${verseEnd}`
        : verseStart != null && verseEnd != null
          ? `${verseStart} – ${verseEnd}`
          : undefined;

    let computedVerseCount: number | undefined;
    if (
      verseCount == null &&
      startSurah != null &&
      endSurah != null &&
      verseStart != null &&
      verseEnd != null
    ) {
      if (startSurah === endSurah) {
        computedVerseCount = Math.max(0, verseEnd - verseStart + 1);
      } else {
        const firstSurahCount = surahVerseCountMap.get(startSurah);
        const lastSurahCount = surahVerseCountMap.get(endSurah);
        if (firstSurahCount != null && lastSurahCount != null) {
          let total = firstSurahCount - verseStart + 1 + verseEnd;
          for (let surah = startSurah + 1; surah < endSurah; surah += 1) {
            const middleCount = surahVerseCountMap.get(surah);
            if (middleCount == null) {
              total = 0;
              break;
            }
            total += middleCount;
          }
          computedVerseCount = total > 0 ? total : undefined;
        }
      }
    }

    const verses =
      row.verses != null
        ? String(row.verses)
        : verseCount != null || computedVerseCount != null
          ? `(${verseCount ?? computedVerseCount} verses)`
          : rangeLabel
            ? undefined
            : undefined;

    const hizbName = stripEnglishParenthetical(
      rangeLabel
        ? `Hizb ${id} | ${rangeLabel}`
        : (pickString(row.hizbName, row.label, row.title, row.name) ??
          `Hizb ${id}`),
    );

    options.push({
      id,
      hizbName,
      verses,
    });
  }
  return options.sort((a, b) => a.id - b.id);
}

/** Ensure selected detail items still appear even if reference list is incomplete */
export function mergeSurahOptionsWithDetail(
  reference: QuranSurahOption[],
  detail: QuranGoalDetail | null | undefined,
): QuranSurahOption[] {
  const map = new Map(reference.map((s) => [s.id, s]));
  for (const item of detail?.items ?? []) {
    if (String(item.itemType).toUpperCase() !== "SURAH") continue;
    const id = Number(item.itemNumber);
    if (!Number.isFinite(id) || id <= 0 || map.has(id)) continue;
    const name = String(item.surahName ?? `Surah ${id}`);
    map.set(id, { id, surahName: name, surahTitle: name });
  }
  return Array.from(map.values()).sort((a, b) => a.id - b.id);
}

export function mergeHizbOptionsWithDetail(
  reference: QuranHizbOption[],
  detail: QuranGoalDetail | null | undefined,
): QuranHizbOption[] {
  const map = new Map(reference.map((h) => [h.id, h]));
  for (const item of detail?.items ?? []) {
    if (String(item.itemType).toUpperCase() !== "HIZB") continue;
    const id = Number(item.itemNumber);
    if (!Number.isFinite(id) || id <= 0 || map.has(id)) continue;
    const range =
      item.verseStart != null && item.verseEnd != null
        ? `(${item.verseStart} – ${item.verseEnd})`
        : undefined;
    map.set(id, {
      id,
      hizbName: String(item.surahName ?? `Hizb ${id}`),
      verses: range,
    });
  }
  return Array.from(map.values()).sort((a, b) => a.id - b.id);
}

export function mergeJuzOptionsWithDetail(
  reference: QuranJuzOption[],
  detail: QuranGoalDetail | null | undefined,
): QuranJuzOption[] {
  const map = new Map(reference.map((j) => [j.id, j]));
  for (const item of detail?.items ?? []) {
    if (String(item.itemType).toUpperCase() !== "JUZ") continue;
    const id = Number(item.itemNumber);
    if (!Number.isFinite(id) || id <= 0 || map.has(id)) continue;
    map.set(id, {
      id,
      juzName: String(item.surahName ?? `Juz ${id}`),
      totalAyahs:
        item.verseStart != null && item.verseEnd != null
          ? Math.max(0, Number(item.verseEnd) - Number(item.verseStart) + 1)
          : undefined,
    });
  }
  return Array.from(map.values()).sort((a, b) => a.id - b.id);
}

export function getSelectedSurahIdsFromDetail(
  detail: QuranGoalDetail | null | undefined,
): number[] {
  return (detail?.items ?? [])
    .filter((item) => String(item.itemType).toUpperCase() === "SURAH")
    .map((item) => Number(item.itemNumber))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export function getSurahSettingsFromDetail(
  detail: QuranGoalDetail | null | undefined,
): Record<number, { frequency: "daily" | "weekly"; times: number }> {
  const frequency = String(detail?.frequency ?? "MONTHLY").toLowerCase();
  const uiFrequency: "daily" | "weekly" =
    frequency === "weekly" ? "weekly" : "daily";
  const settings: Record<
    number,
    { frequency: "daily" | "weekly"; times: number }
  > = {};
  for (const item of detail?.items ?? []) {
    if (String(item.itemType).toUpperCase() !== "SURAH") continue;
    const id = Number(item.itemNumber);
    if (!Number.isFinite(id) || id <= 0) continue;
    settings[id] = {
      frequency: uiFrequency,
      times: Number(item.targetCount ?? 1) || 1,
    };
  }
  return settings;
}

export function getSurahNamesFromDetail(
  detail: QuranGoalDetail | null | undefined,
): Record<number, string> {
  const names: Record<number, string> = {};
  for (const item of detail?.items ?? []) {
    if (String(item.itemType).toUpperCase() !== "SURAH") continue;
    const id = Number(item.itemNumber);
    if (!Number.isFinite(id) || id <= 0 || !item.surahName) continue;
    names[id] = String(item.surahName);
  }
  return names;
}

export function getJuzRangeFromDetail(
  detail: QuranGoalDetail | null | undefined,
): { start: number; end: number } | null {
  const juzNumbers = getSelectedJuzIdsFromDetail(detail);
  if (juzNumbers.length === 0) return null;
  return {
    start: Math.min(...juzNumbers),
    end: Math.max(...juzNumbers),
  };
}

export function getSelectedJuzIdsFromDetail(
  detail: QuranGoalDetail | null | undefined,
): number[] {
  return (detail?.items ?? [])
    .filter((item) => String(item.itemType).toUpperCase() === "JUZ")
    .map((item) => Number(item.itemNumber))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export function getSelectedHizbIdsFromDetail(
  detail: QuranGoalDetail | null | undefined,
): number[] {
  return (detail?.items ?? [])
    .filter((item) => String(item.itemType).toUpperCase() === "HIZB")
    .map((item) => Number(item.itemNumber))
    .filter((n) => Number.isFinite(n) && n > 0);
}

/** @deprecated Prefer getSelectedHizbIdsFromDetail for multi-select */
export function getSelectedHizbFromDetail(
  detail: QuranGoalDetail | null | undefined,
): number | undefined {
  return getSelectedHizbIdsFromDetail(detail)[0];
}

/** Hours goals store the value in targetValue */
export function getHoursFromDetail(
  detail: QuranGoalDetail | null | undefined,
): number {
  if (!detail) return 0;
  if (String(detail.trackingMetric).toUpperCase() !== "HOURS") return 0;
  const n = Number(detail.targetValue ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** Completion goals store the value in targetValue */
export function getCompletionFromDetail(
  detail: QuranGoalDetail | null | undefined,
): number {
  if (!detail) return 0;
  if (String(detail.trackingMetric).toUpperCase() !== "COMPLETION") return 0;
  const n = Number(detail.targetValue ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function buildHoursQuranPayload(
  quranGoalType: "LISTENING" | "TAJWEED",
  hours: number,
): UpsertQuranGoalPayload {
  return {
    quranGoalType,
    isActive: true,
    frequency: "MONTHLY",
    targetHours: hours,
    items: [],
  };
}

export function buildQuranMetricUpsertPayload(
  variant: "recitation" | "memorization",
  metric: "surah" | "juz" | "completion" | "hizb",
  metrics: Record<string, any>,
): UpsertQuranGoalPayload | null {
  if (variant === "recitation") {
    if (metric === "hizb") return null;
    const quranGoalType = RECITATION_METRIC_TO_TYPE[metric];
    if (metric === "completion") {
      const completionTarget = Number(metrics.completion ?? 0);
      if (completionTarget <= 0) return null;
      return {
        quranGoalType,
        isActive: true,
        frequency: "MONTHLY",
        completionTarget,
        items: [],
      };
    }
    if (metric === "juz") {
      const juz = (metrics.juz ?? {}) as JuzMetricValue;
      let start = Number(juz.start ?? 0);
      let end = Number(juz.end ?? 0);
      // UI may leave "from" empty (0) while "to" is set — treat as 1..end
      if (start <= 0 && end > 0) start = 1;
      if (end <= 0 && start > 0) end = start;
      if (start <= 0 || end <= 0) return null;
      if (end < start) end = start;
      const items: QuranGoalItemPayload[] = [];
      for (let n = start; n <= end; n += 1) {
        items.push({ itemType: "JUZ", itemNumber: n, targetCount: 1 });
      }
      return {
        quranGoalType,
        isActive: true,
        frequency: "MONTHLY",
        items,
      };
    }
    // surah
    const surah = (metrics.surah ?? {}) as SurahMetricValue;
    const selected = surah.selectedSurahs ?? [];
    if (selected.length === 0) return null;
    const settings = surah.surahSettings ?? {};
    const firstFreq = settings[selected[0]]?.frequency;
    const items: QuranGoalItemPayload[] = selected.map((id) => ({
      itemType: "SURAH",
      itemNumber: id,
      surahName: surah.surahNames?.[id] ?? SURAH_NAMES[id] ?? String(id),
      targetCount: settings[id]?.times ?? 1,
    }));
    return {
      quranGoalType,
      isActive: true,
      frequency: toApiFrequency(firstFreq),
      items,
    };
  }

  // memorization
  if (metric === "completion") return null;
  const quranGoalType = MEMORIZATION_METRIC_TO_TYPE[metric];
  if (metric === "hizb") {
    const selectedIds: number[] = Array.isArray(metrics.hizb?.selectedHizbs)
      ? metrics.hizb.selectedHizbs.map(Number)
      : metrics.hizb?.selectedHizb != null
        ? [Number(metrics.hizb.selectedHizb)]
        : Array.isArray(metrics.hizb)
          ? metrics.hizb.map(Number)
          : [];
    const ids = selectedIds.filter((n) => Number.isFinite(n) && n > 0);
    if (ids.length === 0) return null;
    return {
      quranGoalType,
      isActive: true,
      frequency: "MONTHLY",
      items: ids.map((hizbId) => ({
        itemType: "HIZB" as const,
        itemNumber: hizbId,
        targetCount: 1,
      })),
    };
  }
  if (metric === "juz") {
    const juz = (metrics.juz ?? {}) as JuzMetricValue;
    const selectedIds = Array.isArray(juz.selectedJuzs)
      ? juz.selectedJuzs
          .map(Number)
          .filter((n) => Number.isFinite(n) && n > 0)
      : [];
    if (selectedIds.length > 0) {
      return {
        quranGoalType,
        isActive: true,
        frequency: "MONTHLY",
        items: selectedIds.map((juzId) => ({
          itemType: "JUZ" as const,
          itemNumber: juzId,
          targetCount: 1,
        })),
      };
    }
    let start = Number(juz.start ?? 0);
    let end = Number(juz.end ?? 0);
    if (start <= 0 && end > 0) start = 1;
    if (end <= 0 && start > 0) end = start;
    if (start <= 0 || end <= 0) return null;
    if (end < start) end = start;
    const items: QuranGoalItemPayload[] = [];
    for (let n = start; n <= end; n += 1) {
      items.push({ itemType: "JUZ", itemNumber: n, targetCount: 1 });
    }
    return {
      quranGoalType,
      isActive: true,
      frequency: "MONTHLY",
      items,
    };
  }
  // surah
  const surah = (metrics.surah ?? {}) as SurahMetricValue;
  const selected = surah.selectedSurahs ?? [];
  if (selected.length === 0) return null;
  return {
    quranGoalType,
    isActive: true,
    frequency: "MONTHLY",
    items: selected.map((id) => ({
      itemType: "SURAH",
      itemNumber: id,
      surahName: surah.surahNames?.[id] ?? SURAH_NAMES[id] ?? String(id),
      targetCount: 1,
    })),
  };
}

/** Collect every configured metric for a card into a bulk `goals` array. */
export function buildBulkQuranGoalsForVariant(
  variant: "recitation" | "memorization",
  metrics: Record<string, any>,
  onlyMetric?: "surah" | "juz" | "completion" | "hizb",
): UpsertQuranGoalPayload[] {
  const metricsToTry: Array<"surah" | "juz" | "completion" | "hizb"> =
    onlyMetric
      ? [onlyMetric]
      : variant === "memorization"
        ? ["surah", "juz", "hizb"]
        : ["surah", "juz", "completion"];

  const goals: UpsertQuranGoalPayload[] = [];
  for (const metric of metricsToTry) {
    const payload = buildQuranMetricUpsertPayload(variant, metric, metrics);
    if (payload) goals.push(payload);
  }
  return goals;
}

/** Stable display order for Quran cards */
const QURAN_UI_ORDER = [
  "quran-listening",
  "quran-recitation",
  "quran-memorization",
  "quran-tajweed",
] as const;

const QURAN_TYPE_IMAGES: Record<string, ImageSourcePropType> = {
  "quran-listening": quranlisteningbottomsheetimage,
  "quran-recitation": quranrecitationbottomsheetimage,
  "quran-memorization": quranmemorizationbottomsheetimage,
  "quran-tajweed": qurantajweedbottomsheetimage,
};

export type QuranGoalApiItem = {
  quranGoalId?: string | null;
  quranGoalType: string;
  isActive: boolean;
  trackingMetric?: string;
  targetValue?: number;
  completedValue?: number;
  frequency?: string;
  items?: QuranGoalDetailItem[];
  title?: string;
  description?: string;
};

export type QuranGoalListItem = {
  id: string;
  isSelected: boolean;
  image?: ImageSourcePropType;
  title?: string;
  description?: string;
  /** All backend rows that belong to this UI card */
  apiGoals: QuranGoalApiItem[];
};

export const QURAN_GOAL_LOADING_PLACEHOLDERS = QURAN_UI_ORDER.map(
  (_, index) => ({
    id: `quran-loading-${index}`,
    isLoadingPlaceholder: true,
  }),
);

export function mapQuranGoalsFromApi(
  goals: QuranGoalApiItem[] | undefined | null,
): QuranGoalListItem[] {
  if (!Array.isArray(goals)) return [];

  const grouped = new Map<string, QuranGoalApiItem[]>();

  for (const goal of goals) {
    const uiId = QURAN_TYPE_TO_UI_ID[goal.quranGoalType];
    if (!uiId) continue;
    const existing = grouped.get(uiId) ?? [];
    existing.push(goal);
    grouped.set(uiId, existing);
  }

  return QURAN_UI_ORDER.map((uiId) => {
    const apiGoals = grouped.get(uiId) ?? [];
    const firstWithTitle = apiGoals.find((g) => g.title || g.description);

    return {
      id: uiId,
      isSelected: apiGoals.some((g) => g.isActive),
      image: QURAN_TYPE_IMAGES[uiId],
      title: firstWithTitle?.title,
      description: firstWithTitle?.description,
      apiGoals,
    };
  }).filter((item) => item.apiGoals.length > 0);
}

/** True when any backend row for this card has saved targets/items (not merely isActive). */
export function hasConfiguredQuranGoal(
  item: QuranGoalListItem | undefined | null,
): boolean {
  if (!item?.apiGoals?.length) return false;
  return item.apiGoals.some((goal) => {
    if (typeof goal.targetValue === "number" && goal.targetValue > 0) {
      return true;
    }
    if (Array.isArray(goal.items) && goal.items.length > 0) {
      return true;
    }
    return false;
  });
}
