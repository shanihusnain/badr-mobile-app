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
import { SADAQAH_TYPE_TO_UI_ID } from "@/src/utils/sadaqahGoalMap";

export type ReviewSelectedGoal = {
  id: number;
  name: string;
  label: string;
  value: string | number;
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
    const rows: Array<[string, string, number | undefined]> = [
      ["before-fajr", t("prayerGoals.beforeFajrHeading"), cfg.beforeFajrTarget],
      [
        "before-dhuhr",
        t("prayerGoals.beforeDhuhrHeading"),
        cfg.beforeDhuhrTarget,
      ],
      ["after-dhuhr", t("prayerGoals.afterDhuhrHeading"), cfg.afterDhuhrTarget],
      [
        "after-maghrib",
        t("prayerGoals.afterMaghribHeading"),
        cfg.afterMaghribTarget,
      ],
      ["after-isha", t("prayerGoals.afterIshaHeading"), cfg.afterIshaTarget],
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
  } else if (goal.prayerType === "QIYAM_AL_LAYL" && goal.qiyamConfig) {
    selectedGoals.push({
      id: 1,
      name: "unit",
      label: t("monthlyGoalPlanner.reviewLabels.qiyalAlLail"),
      value: goal.qiyamConfig.unitTarget ?? 0,
    });
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

function mapQuranGoal(
  goal: CycleQuranGoal,
  t: TFunction,
  index: number,
): ReviewAppliedGoal | null {
  if (!goal.isActive) return null;
  const title = QURAN_TYPE_TO_REVIEW_TITLE[goal.quranGoalType];
  if (!title) return null;

  const labelKey = QURAN_REVIEW_LABEL_KEY[goal.quranGoalType];
  const label = labelKey ? t(labelKey) : goal.quranGoalType;
  const items = goal.goalItems ?? [];
  const selectedGoals: ReviewSelectedGoal[] = items.map((item, i) => ({
    id: i + 1,
    name: `${item.itemType}-${item.itemNumber}`,
    label: item.surahName ?? `${item.itemType} ${item.itemNumber}`,
    value: item.targetCount ?? 1,
  }));

  const parsedTarget =
    typeof goal.targetValue === "number"
      ? goal.targetValue
      : Number(goal.targetValue);
  const totalValue = Number.isFinite(parsedTarget)
    ? parsedTarget
    : items.reduce((sum, item) => sum + (item.targetCount ?? 0), 0);

  if (
    (goal.quranGoalType === "LISTENING" || goal.quranGoalType === "TAJWEED") &&
    selectedGoals.length === 0
  ) {
    selectedGoals.push({
      id: 1,
      name: "hours",
      label: "Hours",
      value: `${totalValue} hrs`,
    });
  }

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
): ReviewAppliedGoal | null {
  if (!goal.isActive) return null;
  const uiId = FASTING_TYPE_TO_UI_ID[goal.fastingType];
  if (!uiId) return null;

  const labelKey = FASTING_REVIEW_LABEL_KEY[goal.fastingType];
  const label = labelKey ? t(labelKey) : goal.fastingType;
  const plans = goal.fastingPlans ?? [];
  const selectedGoals: ReviewSelectedGoal[] = plans.map((plan, i) => {
    const { weekday, detail } = formatPlanDate(plan.plannedDate);
    return {
      id: i + 1,
      name: plan.id,
      label: weekday,
      value: detail,
    };
  });

  if (goal.fastingType === "PROPHET_DAWOOD" && goal.dawoodStartDay) {
    selectedGoals.push({
      id: selectedGoals.length + 1,
      name: "start-day",
      label: "Start day",
      value: String(goal.dawoodStartDay),
    });
  }

  return {
    id: goal.id ?? index + 1,
    title: uiId,
    label,
    totalValue: goal.targetCount ?? plans.length,
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
    // Backend stores minutes
    totalValue = Math.max(0, Math.round((goal.targetAmount ?? 0) / 60));
    selectedGoals.push({
      id: 1,
      name: "hours",
      label: t("monthlyGoalPlanner.hours"),
      value: totalValue,
    });
  } else if (
    goal.sadaqahType === "MISSED_ZAKAT" ||
    goal.sadaqahType === "LILLAH" ||
    goal.sadaqahType === "SADAQAH_JARIYAH"
  ) {
    const currency = goal.currencyCode ?? "SAR";
    selectedGoals.push({
      id: 1,
      name: "amount",
      label: t("monthlyGoalPlanner.amount"),
      value: `${currency} ${goal.targetAmount ?? 0}`,
    });
  } else if (goal.sadaqahType === "FIDYA") {
    selectedGoals.push({
      id: 1,
      name: "meals",
      label: t("monthlyGoalPlanner.meals"),
      value: goal.targetAmount ?? 0,
    });
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
): ReviewSection[] {
  if (!cycle) return [];

  const sections: ReviewSection[] = [];

  const prayerGoals = (cycle.prayerGoals ?? [])
    .map((goal, i) => mapPrayerGoal(goal, t, i))
    .filter(Boolean) as ReviewAppliedGoal[];
  if (prayerGoals.length) {
    sections.push({
      id: 1,
      name: "prayerGoals",
      label: t("monthlyGoalPlanner.tabPrayer"),
      appliedGoals: prayerGoals,
    });
  }

  const quranGoals = (cycle.quranGoals ?? [])
    .map((goal, i) => mapQuranGoal(goal, t, i))
    .filter(Boolean) as ReviewAppliedGoal[];
  if (quranGoals.length) {
    sections.push({
      id: 2,
      name: "quranGoals",
      label: t("monthlyGoalPlanner.tabQuran"),
      appliedGoals: quranGoals,
    });
  }

  const fastingGoals = (cycle.fastingGoals ?? [])
    .map((goal, i) => mapFastingGoal(goal, t, i))
    .filter(Boolean) as ReviewAppliedGoal[];
  if (fastingGoals.length) {
    sections.push({
      id: 3,
      name: "fastingGoals",
      label: t("monthlyGoalPlanner.tabFasting"),
      appliedGoals: fastingGoals,
    });
  }

  const sadaqahGoals = (cycle.sadaqahGoals ?? [])
    .map((goal, i) => mapSadaqahGoal(goal, t, i))
    .filter(Boolean) as ReviewAppliedGoal[];
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
