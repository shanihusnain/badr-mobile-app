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
};

export type QuranHizbOption = {
  id: number;
  hizbName: string;
  verses?: string;
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

/** Map /api/quran-reference/surahs rows → UI options */
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
      row.id,
      row.number,
      row.surahNumber,
      row.surahId,
      row.itemNumber,
    );
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const title = String(
      row.englishName ??
        row.surahTitle ??
        row.title ??
        row.name ??
        row.surahName ??
        `Surah ${id}`,
    );
    options.push({
      id,
      surahName: String(row.surahName ?? row.name ?? row.slug ?? title),
      surahTitle: title,
    });
  }
  return options.sort((a, b) => a.id - b.id);
}

/** Map /api/quran-reference/hizb rows → UI options */
export function mapHizbOptionsFromReference(
  rows: unknown[] | null | undefined,
): QuranHizbOption[] {
  if (!Array.isArray(rows)) return [];
  const seen = new Set<number>();
  const options: QuranHizbOption[] = [];
  for (const item of rows) {
    const row = asRecord(item);
    if (!row) continue;
    const id = pickNumber(
      row.id,
      row.number,
      row.hizbNumber,
      row.hizbId,
      row.itemNumber,
    );
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const verseStart = row.verseStart ?? row.startVerse;
    const verseEnd = row.verseEnd ?? row.endVerse;
    const verseCount = row.verseCount ?? row.versesCount ?? row.totalVerses;
    const rangeLabel =
      verseStart != null && verseEnd != null
        ? `${verseStart} – ${verseEnd}`
        : undefined;
    const verses =
      row.verses != null
        ? String(row.verses)
        : verseCount != null
          ? `(${verseCount} verses)`
          : rangeLabel
            ? `(${rangeLabel})`
            : undefined;
    options.push({
      id,
      hizbName: String(
        row.hizbName ?? row.label ?? row.title ?? row.name ?? `Hizb ${id}`,
      ),
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
  const juzNumbers = (detail?.items ?? [])
    .filter((item) => String(item.itemType).toUpperCase() === "JUZ")
    .map((item) => Number(item.itemNumber))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (juzNumbers.length === 0) return null;
  return {
    start: Math.min(...juzNumbers),
    end: Math.max(...juzNumbers),
  };
}

export function getSelectedHizbFromDetail(
  detail: QuranGoalDetail | null | undefined,
): number | undefined {
  const item = (detail?.items ?? []).find(
    (row) => String(row.itemType).toUpperCase() === "HIZB",
  );
  const id = Number(item?.itemNumber);
  return Number.isFinite(id) && id > 0 ? id : undefined;
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
      const start = Number(juz.start ?? 0);
      const end = Number(juz.end ?? start);
      if (start <= 0) return null;
      const items: QuranGoalItemPayload[] = [];
      for (let n = start; n <= Math.max(start, end); n += 1) {
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
    const hizbId = Number(metrics.hizb?.selectedHizb ?? metrics.hizb ?? 0);
    if (!hizbId) return null;
    return {
      quranGoalType,
      isActive: true,
      frequency: "MONTHLY",
      items: [{ itemType: "HIZB", itemNumber: hizbId, targetCount: 1 }],
    };
  }
  if (metric === "juz") {
    const juz = (metrics.juz ?? {}) as JuzMetricValue;
    const start = Number(juz.start ?? 0);
    const end = Number(juz.end ?? start);
    if (start <= 0) return null;
    const items: QuranGoalItemPayload[] = [];
    for (let n = start; n <= Math.max(start, end); n += 1) {
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
