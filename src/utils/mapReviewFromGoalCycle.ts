import type { TFunction } from "i18next";
import moment from "moment-hijri";
import type {
  CycleFastingGoal,
  CyclePrayerGoal,
  CycleQuranGoal,
  CycleSadaqahGoal,
  GoalCycleDetail,
} from "@/src/api/queries/useGetGoalCycleById";
import { PRAYER_TYPE_TO_UI_ID } from "@/src/utils/prayerGoalMap";
import { FASTING_TYPE_TO_UI_ID } from "@/src/utils/fastingGoalMap";
import { SADAQAH_TYPE_TO_UI_ID, formatReviewCurrencyAmount } from "@/src/utils/sadaqahGoalMap";
import type {
  QuranHizbOption,
  QuranJuzOption,
} from "@/src/utils/quranGoalMap";

export type ReviewSelectedGoal = {
  id: number;
  name: string;
  label: string;
  value: string | number;
};

export type ReviewQuranReference = {
  juz?: QuranJuzOption[];
  hizb?: QuranHizbOption[];
};

export type ReviewFastingReference = {
  /** Fallback when cycle detail omits MISSED_RAMADAN plans */
  missedRamadanDates?: string[];
};

export type ReviewAppliedGoal = {
  id: number | string;
  title: string;
  label: string;
  totalValue: number;
  selectedGoals?: ReviewSelectedGoal[];
  /** Backend enums for save handlers */
  prayerType?: string;
  quranGoalType?: string;
  fastingType?: string;
  sadaqahType?: string;
  sourcePrayer?: CyclePrayerGoal;
  sourceQuran?: CycleQuranGoal;
  sourceFasting?: CycleFastingGoal;
  sourceSadaqah?: CycleSadaqahGoal;
};

export type ReviewSection = {
  id: number;
  name: string;
  label: string;
  appliedGoals: ReviewAppliedGoal[];
};

/** Review editor switch keys — keep in sync with GoalPlannerSheet.renderGoalEditor */
export const PRAYER_TYPE_TO_REVIEW_TITLE: Record<string, string> = {
  TAHIYYAT_AL_WUDHU: "tahayyat-ul-wudhu",
  FIVE_DAILY_PRAYERS: "five-daily-prayers",
  SUNNAH_RAWATIB: "sunnah-rawatib",
  TAHIYYAT_AL_MASJID: "tahayyat-ul-masjid",
  MISSED_PAST_PRAYERS: "missed-past-prayers",
  DUHA: "duha-prayer",
  TAWBAH: "tawba-prayer",
  ISTIKHARA: "istikhara-prayer",
  SHUKR: "shukr-prayer",
  QIYAM_AL_LAYL: "qiyal-al-lail-prayer",
};

export const QURAN_TYPE_TO_REVIEW_TITLE: Record<string, string> = {
  LISTENING: "quran-listening",
  RECITATION_SURAH: "quran-recitation-by-surah",
  RECITATION_COMPLETION: "quran-recitation-by-completion",
  RECITATION_JUZ: "quran-recitation-by-juz",
  MEMORIZATION_JUZ: "quran-memorization-by-juz",
  MEMORIZATION_HIZB: "quran-memorization-by-hizb",
  MEMORIZATION_SURAH: "quran-memorization-by-surah",
  TAJWEED: "quran-tajweed",
};

/** Stable order matching prayer / quran / fasting / sadaqah selection tabs */
const PRAYER_REVIEW_ORDER = Object.keys(PRAYER_TYPE_TO_REVIEW_TITLE);
const QURAN_REVIEW_ORDER = Object.keys(QURAN_TYPE_TO_REVIEW_TITLE);
const FASTING_REVIEW_ORDER = Object.keys(FASTING_TYPE_TO_UI_ID);
const SADAQAH_REVIEW_ORDER = Object.keys(SADAQAH_TYPE_TO_UI_ID);

function sortByTypeOrder<T>(
  items: T[],
  getType: (item: T) => string | undefined,
  order: string[],
): T[] {
  const rank = new Map(order.map((key, index) => [key, index]));
  return [...items].sort((a, b) => {
    const aRank = rank.get(getType(a) ?? "") ?? Number.MAX_SAFE_INTEGER;
    const bRank = rank.get(getType(b) ?? "") ?? Number.MAX_SAFE_INTEGER;
    return aRank - bRank;
  });
}

const PRAYER_REVIEW_LABEL_KEY: Record<string, string> = {
  TAHIYYAT_AL_WUDHU: "monthlyGoalPlanner.reviewLabels.tahayyatWudu",
  FIVE_DAILY_PRAYERS: "monthlyGoalPlanner.reviewLabels.fiveDailyPrayers",
  SUNNAH_RAWATIB: "monthlyGoalPlanner.reviewLabels.sunnahRawatib",
  TAHIYYAT_AL_MASJID: "monthlyGoalPlanner.reviewLabels.tahayyatMasjid",
  MISSED_PAST_PRAYERS: "monthlyGoalPlanner.reviewLabels.missedPastPrayers",
  DUHA: "monthlyGoalPlanner.reviewLabels.duha",
  TAWBAH: "monthlyGoalPlanner.reviewLabels.tawba",
  ISTIKHARA: "monthlyGoalPlanner.reviewLabels.istikhara",
  SHUKR: "monthlyGoalPlanner.reviewLabels.shukr",
  QIYAM_AL_LAYL: "monthlyGoalPlanner.reviewLabels.qiyalAlLail",
};

const QURAN_REVIEW_LABEL_KEY: Record<string, string> = {
  LISTENING: "monthlyGoalPlanner.reviewLabels.quranListening",
  RECITATION_SURAH: "monthlyGoalPlanner.reviewLabels.quranRecitationSurah",
  RECITATION_COMPLETION:
    "monthlyGoalPlanner.reviewLabels.quranRecitationCompletion",
  RECITATION_JUZ: "monthlyGoalPlanner.reviewLabels.quranRecitationJuz",
  MEMORIZATION_JUZ: "monthlyGoalPlanner.reviewLabels.quranMemorizationJuz",
  MEMORIZATION_HIZB: "monthlyGoalPlanner.reviewLabels.quranMemorizationHizb",
  MEMORIZATION_SURAH: "monthlyGoalPlanner.reviewLabels.quranMemorizationSurah",
  TAJWEED: "monthlyGoalPlanner.reviewLabels.quranTajweed",
};

const FASTING_REVIEW_LABEL_KEY: Record<string, string> = {
  MISSED_RAMADAN: "monthlyGoalPlanner.reviewLabels.missedFasts",
  PROPHET_DAWOOD: "monthlyGoalPlanner.reviewLabels.dawoodFasts",
  MONDAY_THURSDAY: "monthlyGoalPlanner.reviewLabels.mondayThursdayFasts",
  WHITE_DAYS: "monthlyGoalPlanner.reviewLabels.whiteDaysFasts",
};

const SADAQAH_REVIEW_LABEL_KEY: Record<string, string> = {
  MISSED_ZAKAT: "monthlyGoalPlanner.reviewLabels.missedZakat",
  KAFFARAH: "monthlyGoalPlanner.reviewLabels.kafarahBreakingFasts",
  FIDYA: "monthlyGoalPlanner.reviewLabels.fidya",
  LILLAH: "monthlyGoalPlanner.reviewLabels.lilahDonations",
  VOLUNTEERING: "monthlyGoalPlanner.reviewLabels.volunteeringServices",
  SADAQAH_JARIYAH: "monthlyGoalPlanner.reviewLabels.sadaqahJariyah",
};

function formatPlanDate(isoDate: string): {
  weekday: string;
  detail: string;
} {
  const day = moment(isoDate);
  const weekday = day.format("dddd");
  const gregorian = day.format("MMM D, YYYY");
  let hijriLabel = gregorian;
  try {
    hijriLabel = day.format("iD iMMM, iYYYY");
  } catch {
    // ignore
  }
  return { weekday, detail: `${hijriLabel} / ${gregorian}` };
}

const SUNNAH_REVIEW_SLOT_KEY: Record<string, string> = {
  "before-fajr": "monthlyGoalPlanner.reviewLabels.sunnahSlotBeforeFajr",
  "before-dhuhr": "monthlyGoalPlanner.reviewLabels.sunnahSlotBeforeDhuhr",
  "after-dhuhr": "monthlyGoalPlanner.reviewLabels.sunnahSlotAfterDhuhr",
  "after-maghrib": "monthlyGoalPlanner.reviewLabels.sunnahSlotAfterMaghrib",
  "after-isha": "monthlyGoalPlanner.reviewLabels.sunnahSlotAfterIsha",
};

function getSunnahRawatibRakahCount(
  slot: string,
  cfg: NonNullable<CyclePrayerGoal["sunnahRawatibConfig"]>,
): number {
  switch (slot) {
    case "before-fajr":
      return 2;
    case "before-dhuhr":
      return 4;
    case "after-dhuhr":
      return cfg.afterDhuhrRakahOption === 1 ? 2 : 4;
    case "after-maghrib":
      return 2;
    case "after-isha":
      return 2;
    default:
      return 2;
  }
}

function formatSunnahRawatibReviewLabel(
  slot: string,
  cfg: NonNullable<CyclePrayerGoal["sunnahRawatibConfig"]>,
  t: TFunction,
): string {
  const prayerKey = SUNNAH_REVIEW_SLOT_KEY[slot];
  const prayer = prayerKey ? t(prayerKey) : slot;
  const count = getSunnahRawatibRakahCount(slot, cfg);
  return t("monthlyGoalPlanner.reviewLabels.sunnahRawatibRow", { prayer, count });
}

/** Weekday | Hijri / Gregorian rows — same pattern as Mon/Thu review list */
export function formatFastingReviewRowsFromDates(
  dates: string[],
): ReviewSelectedGoal[] {
  return [...dates]
    .filter(Boolean)
    .sort()
    .map((iso, i) => {
      const { weekday, detail } = formatPlanDate(iso);
      return {
        id: i + 1,
        name: iso,
        label: weekday,
        value: detail,
      };
    });
}

function mapPrayerGoal(
  goal: CyclePrayerGoal,
  t: TFunction,
  index: number,
): ReviewAppliedGoal | null {
  if (!goal.isActive) return null;
  const title = PRAYER_TYPE_TO_REVIEW_TITLE[goal.prayerType];
  if (!title || !PRAYER_TYPE_TO_UI_ID[goal.prayerType]) return null;

  const labelKey = PRAYER_REVIEW_LABEL_KEY[goal.prayerType];
  const label = labelKey ? t(labelKey) : goal.prayerType;
  const selectedGoals: ReviewSelectedGoal[] = [];
  let totalValue = goal.targetCount ?? 0;

  if (goal.prayerType === "FIVE_DAILY_PRAYERS" && goal.fiveDailyConfig) {
    const cfg = goal.fiveDailyConfig;
    const rows: Array<[string, string, number | undefined]> = [
      ["fajr", t("prayerGoals.fajr"), cfg.fajrTarget],
      ["dhuhr", t("prayerGoals.dhuhr"), cfg.dhuhrTarget],
      ["asr", t("prayerGoals.asr"), cfg.asrTarget],
      ["maghrib", t("prayerGoals.maghrib"), cfg.maghribTarget],
      ["isha", t("prayerGoals.isha"), cfg.ishaTarget],
    ];
    rows.forEach(([name, rowLabel, value], i) => {
      selectedGoals.push({
        id: i + 1,
        name,
        label: rowLabel,
        value: value ?? 0,
      });
    });
    totalValue = rows.reduce((sum, [, , v]) => sum + (v ?? 0), 0);
  } else if (goal.prayerType === "SUNNAH_RAWATIB" && goal.sunnahRawatibConfig) {
    const cfg = goal.sunnahRawatibConfig;
    const rows: Array<[string, number | undefined]> = [
      ["before-fajr", cfg.beforeFajrTarget],
      ["before-dhuhr", cfg.beforeDhuhrTarget],
      ["after-dhuhr", cfg.afterDhuhrTarget],
      ["after-maghrib", cfg.afterMaghribTarget],
      ["after-isha", cfg.afterIshaTarget],
    ];
    rows.forEach(([name, value], i) => {
      selectedGoals.push({
        id: i + 1,
        name,
        label: formatSunnahRawatibReviewLabel(name, cfg, t),
        value: value ?? 0,
      });
    });
    totalValue = rows.reduce((sum, [, v]) => sum + (v ?? 0), 0);
  } else if (goal.prayerType === "QIYAM_AL_LAYL" && goal.qiyamConfig) {
    // Header total only — same pattern as Quran listening / tajweed
    totalValue = goal.qiyamConfig.unitTarget ?? goal.targetCount ?? 0;
  } else if (goal.prayerType === "MISSED_PAST_PRAYERS") {
    totalValue = goal.targetDays ?? goal.targetCount ?? 0;
  }

  return {
    id: goal.id ?? index + 1,
    title,
    label,
    totalValue,
    selectedGoals: selectedGoals.length ? selectedGoals : undefined,
    prayerType: goal.prayerType,
    sourcePrayer: goal,
  };
}

/** Remove English glosses like "(The Opening)" from surah labels */
function stripEnglishParenthetical(label: string): string {
  return label.replace(/\s*\([^)]*\)/g, "").replace(/\s{2,}/g, " ").trim();
}

function ensureSurahPrefix(name: string): string {
  const trimmed = stripEnglishParenthetical(name);
  if (!trimmed) return "Surah";
  if (/^surah\b/i.test(trimmed)) return trimmed;
  return `Surah ${trimmed}`;
}

/** e.g. "Surah Al-Baqarah (2 times daily)" */
export function formatSurahRecitationReviewLabel(
  surahName: string,
  times: number,
  frequency: string | null | undefined,
  t: TFunction,
): string {
  const surah = ensureSurahPrefix(surahName);
  const count = Number.isFinite(times) && times > 0 ? times : 1;
  const isWeekly = String(frequency ?? "").toLowerCase() === "weekly";

  if (isWeekly) {
    return count === 1
      ? t("progressLogging.recitationSurahMetaWeeklyOnce", { surah })
      : t("progressLogging.recitationSurahMetaWeeklyTimes", {
          surah,
          count,
        });
  }

  return count === 1
    ? t("progressLogging.recitationSurahMetaDailyOnce", { surah })
    : t("progressLogging.recitationSurahMetaDailyTimes", { surah, count });
}

export function parseJuzRangeReviewName(
  name: string,
): { from: number; to: number } | null {
  const match = String(name).match(/^JUZ-RANGE-(\d+)-(\d+)$/);
  if (!match) return null;
  const from = Number(match[1]);
  const to = Number(match[2]);
  if (!Number.isFinite(from) || !Number.isFinite(to) || from <= 0 || to <= 0) {
    return null;
  }
  return { from, to };
}

export function countJuzInRange(from: number, to: number): number {
  return Math.max(0, to - from + 1);
}

/** Figma review: single row "From Juz X to Juz Y" (no per-juz list). */
export function buildJuzRecitationRangeReviewRow(
  from: number,
  to: number,
  t: TFunction,
): ReviewSelectedGoal {
  return {
    id: 1,
    name: `JUZ-RANGE-${from}-${to}`,
    label: t("monthlyGoalPlanner.reviewLabels.juzRecitationRange", {
      from,
      to,
    }),
    value: "",
  };
}

function getJuzNumbersFromItems(
  items: CycleQuranGoal["goalItems"],
): number[] {
  return (items ?? [])
    .filter((item) => String(item.itemType).toUpperCase() === "JUZ")
    .map((item) => Number(item.itemNumber))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);
}

/** Same primary/subtitle labels as Quran tab juz/hizb goal-setting lists. */
export function resolveJuzOrHizbReviewRow(
  itemType: string,
  itemNumber: number,
  t: TFunction,
  reference?: ReviewQuranReference | null,
): { label: string; value: string } {
  const type = String(itemType).toUpperCase();
  if (type === "HIZB") {
    const opt = reference?.hizb?.find((h) => h.id === itemNumber);
    return {
      label:
        opt?.hizbName ??
        t("progressLogging.hizbRowTitle", { number: itemNumber }),
      value: opt?.verses ?? "",
    };
  }
  const opt = reference?.juz?.find((j) => j.id === itemNumber);
  return {
    label:
      opt?.juzName ??
      t("progressLogging.juzRowTitle", { number: itemNumber }),
    value:
      opt?.verses ??
      (opt?.totalAyahs != null ? `(${opt.totalAyahs} verses)` : ""),
  };
}

function mapQuranGoal(
  goal: CycleQuranGoal,
  t: TFunction,
  index: number,
  quranReference?: ReviewQuranReference | null,
): ReviewAppliedGoal | null {
  if (!goal.isActive) return null;
  const title = QURAN_TYPE_TO_REVIEW_TITLE[goal.quranGoalType];
  if (!title) return null;

  const labelKey = QURAN_REVIEW_LABEL_KEY[goal.quranGoalType];
  const label = labelKey ? t(labelKey) : goal.quranGoalType;
  const items = goal.goalItems ?? [];
  const isSurahRecitation = goal.quranGoalType === "RECITATION_SURAH";
  const isSurahMemorization = goal.quranGoalType === "MEMORIZATION_SURAH";
  const isJuzRecitation = goal.quranGoalType === "RECITATION_JUZ";
  const isJuzOrHizbGoal =
    isJuzRecitation ||
    goal.quranGoalType === "MEMORIZATION_JUZ" ||
    goal.quranGoalType === "MEMORIZATION_HIZB";

  const juzNumbers = isJuzRecitation ? getJuzNumbersFromItems(items) : [];
  const juzRange =
    juzNumbers.length > 0
      ? { from: juzNumbers[0], to: juzNumbers[juzNumbers.length - 1] }
      : null;

  const selectedGoals: ReviewSelectedGoal[] = isJuzRecitation && juzRange
    ? [buildJuzRecitationRangeReviewRow(juzRange.from, juzRange.to, t)]
    : items.map((item, i) => {
    const itemNumber = Number(item.itemNumber);
    const fallbackName = `${item.itemType} ${item.itemNumber}`;
    const surahName = item.surahName ?? fallbackName;

    if (isSurahRecitation) {
      return {
        id: i + 1,
        name: `${item.itemType}-${item.itemNumber}`,
        label: formatSurahRecitationReviewLabel(
          surahName,
          item.targetCount ?? 1,
          goal.frequency,
          t,
        ),
        value: "",
      };
    }

    if (isSurahMemorization) {
      return {
        id: i + 1,
        name: `${item.itemType}-${item.itemNumber}`,
        label: surahName,
        value: "",
      };
    }

    if (
      isJuzOrHizbGoal &&
      Number.isFinite(itemNumber) &&
      itemNumber > 0
    ) {
      const row = resolveJuzOrHizbReviewRow(
        item.itemType,
        itemNumber,
        t,
        quranReference,
      );
      return {
        id: i + 1,
        name: `${item.itemType}-${item.itemNumber}`,
        label: row.label,
        value: row.value,
      };
    }

    return {
      id: i + 1,
      name: `${item.itemType}-${item.itemNumber}`,
      label: surahName,
      value: item.targetCount ?? 1,
    };
  });

  const parsedTarget =
    typeof goal.targetValue === "number"
      ? goal.targetValue
      : Number(goal.targetValue);
  const totalValue =
    isJuzRecitation && juzRange
      ? countJuzInRange(juzRange.from, juzRange.to)
      : Number.isFinite(parsedTarget)
        ? parsedTarget
        : items.reduce((sum, item) => sum + (item.targetCount ?? 0), 0);

  return {
    id: goal.id ?? index + 1,
    title,
    label,
    totalValue,
    selectedGoals: selectedGoals.length ? selectedGoals : undefined,
    quranGoalType: goal.quranGoalType,
    sourceQuran: goal,
  };
}

function mapFastingGoal(
  goal: CycleFastingGoal,
  t: TFunction,
  index: number,
  fastingReference?: ReviewFastingReference | null,
): ReviewAppliedGoal | null {
  if (!goal.isActive) return null;
  const uiId = FASTING_TYPE_TO_UI_ID[goal.fastingType];
  if (!uiId) return null;

  const labelKey = FASTING_REVIEW_LABEL_KEY[goal.fastingType];
  const label = labelKey ? t(labelKey) : goal.fastingType;
  const fromPlans = (goal.fastingPlans ?? [])
    .map((plan) => plan.plannedDate)
    .filter(Boolean);
  const fromDates = (goal.plannedDates ?? []).filter(Boolean);
  let dates = [...new Set([...fromPlans, ...fromDates])];

  // Missed Ramadan often returns targetCount without plan rows — use calendar dates.
  if (
    goal.fastingType === "MISSED_RAMADAN" &&
    dates.length === 0 &&
    (fastingReference?.missedRamadanDates?.length ?? 0) > 0
  ) {
    dates = [...(fastingReference?.missedRamadanDates ?? [])];
  }

  const selectedGoals = formatFastingReviewRowsFromDates(dates);

  return {
    id: goal.id ?? index + 1,
    title: uiId,
    label,
    totalValue: goal.targetCount ?? dates.length,
    selectedGoals: selectedGoals.length ? selectedGoals : undefined,
    fastingType: goal.fastingType,
    sourceFasting: goal,
  };
}

function mapSadaqahGoal(
  goal: CycleSadaqahGoal,
  t: TFunction,
  index: number,
): ReviewAppliedGoal | null {
  if (!goal.isActive) return null;
  const uiId = SADAQAH_TYPE_TO_UI_ID[goal.sadaqahType];
  if (!uiId) return null;

  const labelKey = SADAQAH_REVIEW_LABEL_KEY[goal.sadaqahType];
  const label = labelKey ? t(labelKey) : goal.sadaqahType;
  const selectedGoals: ReviewSelectedGoal[] = [];
  let totalValue = goal.targetAmount ?? 0;

  if (goal.sadaqahType === "KAFFARAH") {
    const meals = goal.kaffarahMealsTarget ?? 0;
    const items = goal.kaffarahItemsTarget ?? 0;
    totalValue = meals + items;
    selectedGoals.push(
      {
        id: 1,
        name: "meals",
        label: t("monthlyGoalPlanner.meals"),
        value: meals,
      },
      {
        id: 2,
        name: "cloths",
        label: t("monthlyGoalPlanner.cloths"),
        value: items,
      },
    );
  } else if (goal.sadaqahType === "VOLUNTEERING") {
    // Backend stores minutes — header chip only (no sub-row)
    totalValue = Math.max(0, Math.round((goal.targetAmount ?? 0) / 60));
  } else if (goal.sadaqahType === "MISSED_ZAKAT") {
    const currency = goal.currencyCode ?? "SAR";
    selectedGoals.push({
      id: 1,
      name: "amount",
      label: t("monthlyGoalPlanner.amount"),
      value: formatReviewCurrencyAmount(currency, goal.targetAmount ?? 0),
    });
    totalValue = goal.targetAmount ?? 0;
  } else if (
    goal.sadaqahType === "LILLAH" ||
    goal.sadaqahType === "SADAQAH_JARIYAH"
  ) {
    // Header amount only (no sub-row) — same pattern as Quran listening
    totalValue = goal.targetAmount ?? 0;
  } else if (goal.sadaqahType === "FIDYA") {
    // Header meals chip only (no sub-row)
    totalValue = goal.targetAmount ?? 0;
  }

  return {
    id: goal.id ?? index + 1,
    title: uiId,
    label,
    totalValue,
    selectedGoals: selectedGoals.length ? selectedGoals : undefined,
    sadaqahType: goal.sadaqahType,
    sourceSadaqah: goal,
  };
}

/**
 * Build Review & Confirm accordion sections from GET api/goal-cycles/:id.
 * Only includes isActive goals; omits empty category sections.
 */
export function mapReviewFromGoalCycle(
  cycle: GoalCycleDetail | null | undefined,
  t: TFunction,
  quranReference?: ReviewQuranReference | null,
  fastingReference?: ReviewFastingReference | null,
): ReviewSection[] {
  if (!cycle) return [];

  const sections: ReviewSection[] = [];

  const prayerGoals = sortByTypeOrder(
    (cycle.prayerGoals ?? [])
      .map((goal, i) => mapPrayerGoal(goal, t, i))
      .filter(Boolean) as ReviewAppliedGoal[],
    (goal) => goal.prayerType,
    PRAYER_REVIEW_ORDER,
  );
  if (prayerGoals.length) {
    sections.push({
      id: 1,
      name: "prayerGoals",
      label: t("monthlyGoalPlanner.tabPrayer"),
      appliedGoals: prayerGoals,
    });
  }

  const quranGoals = sortByTypeOrder(
    (cycle.quranGoals ?? [])
      .map((goal, i) => mapQuranGoal(goal, t, i, quranReference))
      .filter(Boolean) as ReviewAppliedGoal[],
    (goal) => goal.quranGoalType,
    QURAN_REVIEW_ORDER,
  );
  if (quranGoals.length) {
    sections.push({
      id: 2,
      name: "quranGoals",
      label: t("monthlyGoalPlanner.tabQuran"),
      appliedGoals: quranGoals,
    });
  }

  const fastingGoals = sortByTypeOrder(
    (cycle.fastingGoals ?? [])
      .map((goal, i) => mapFastingGoal(goal, t, i, fastingReference))
      .filter(Boolean) as ReviewAppliedGoal[],
    (goal) => goal.fastingType,
    FASTING_REVIEW_ORDER,
  );
  if (fastingGoals.length) {
    sections.push({
      id: 3,
      name: "fastingGoals",
      label: t("monthlyGoalPlanner.tabFasting"),
      appliedGoals: fastingGoals,
    });
  }

  const sadaqahGoals = sortByTypeOrder(
    (cycle.sadaqahGoals ?? [])
      .map((goal, i) => mapSadaqahGoal(goal, t, i))
      .filter(Boolean) as ReviewAppliedGoal[],
    (goal) => goal.sadaqahType,
    SADAQAH_REVIEW_ORDER,
  );
  if (sadaqahGoals.length) {
    sections.push({
      id: 4,
      name: "sadaqahGoals",
      label: t("monthlyGoalPlanner.tabSadaqah"),
      appliedGoals: sadaqahGoals,
    });
  }

  return sections;
}
