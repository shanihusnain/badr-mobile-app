import type { ImageSourcePropType } from "react-native";
import {
  tahiyyatalwudhubottomsheetimage,
  missedpastprayerbottomsheetimage,
  tahiyyatalmasjidbottomsheetimage,
  sunnahrawatibbottomsheetimage,
  duhaprayerbottomsheetimage,
  tawbahprayerbottomsheetimage,
  istikharaprayerbottomsheetimage,
  shukarprayerbottomsheetimage,
  fivedailyprayerbottomsheetimage,
  qiyamallaylbottomsheetimage,
} from "@/assets/images";

/** Backend prayerType enum → local UI id (goalsData keys, selection panels) */
export const PRAYER_TYPE_TO_UI_ID: Record<string, string> = {
  TAHIYYAT_AL_WUDHU: "tahayyat-ul-wudhu",
  FIVE_DAILY_PRAYERS: "fiveDailyPrayers",
  SUNNAH_RAWATIB: "sunnahRawatib",
  TAHIYYAT_AL_MASJID: "thayyat-ul-masjid",
  MISSED_PAST_PRAYERS: "missedPastPrayers",
  DUHA: "duhaPrayer",
  TAWBAH: "tawbaPrayer",
  ISTIKHARA: "istikharah",
  SHUKR: "shukrPrayer",
  QIYAM_AL_LAYL: "qiyamalLail",
};

export const UI_ID_TO_PRAYER_TYPE: Record<string, string> = Object.fromEntries(
  Object.entries(PRAYER_TYPE_TO_UI_ID).map(([prayerType, uiId]) => [
    uiId,
    prayerType,
  ]),
);

/** Progress logging screen goal ids → backend prayerType enum */
export const GOAL_ID_TO_PRAYER_TYPE: Record<string, string> = {
  "prayer-tahiyyat": "TAHIYYAT_AL_WUDHU",
  "prayer-tahiyyatMasjid": "TAHIYYAT_AL_MASJID",
  "prayer-tawbah": "TAWBAH",
  "prayer-istikhara": "ISTIKHARA",
  "prayer-shukr": "SHUKR",
  "prayer-sunnah": "SUNNAH_RAWATIB",
  "prayer-duha": "DUHA",
  "prayer-qiyam": "QIYAM_AL_LAYL",
  "prayer-missed": "MISSED_PAST_PRAYERS",
  "prayer-fiveDailyPrayers": "FIVE_DAILY_PRAYERS",
};

/** Accept either API enum or local UI id */
export function resolvePrayerType(goalKey: string): string {
  if (PRAYER_TYPE_TO_UI_ID[goalKey]) return goalKey;
  if (GOAL_ID_TO_PRAYER_TYPE[goalKey]) return GOAL_ID_TO_PRAYER_TYPE[goalKey];
  return UI_ID_TO_PRAYER_TYPE[goalKey] ?? goalKey;
}

export function resolvePrayerTypeFromGoalId(goalId: string): string | null {
  return GOAL_ID_TO_PRAYER_TYPE[goalId] ?? null;
}

export function resolvePrayerUiId(goalKey: string): string {
  if (UI_ID_TO_PRAYER_TYPE[goalKey]) return goalKey;
  return PRAYER_TYPE_TO_UI_ID[goalKey] ?? goalKey;
}

export function isPrayerGoalKey(goalKey: string): boolean {
  return !!PRAYER_TYPE_TO_UI_ID[goalKey] || !!UI_ID_TO_PRAYER_TYPE[goalKey];
}

const PRAYER_TYPE_IMAGES: Record<string, ImageSourcePropType> = {
  TAHIYYAT_AL_WUDHU: tahiyyatalwudhubottomsheetimage,
  FIVE_DAILY_PRAYERS: fivedailyprayerbottomsheetimage,
  SUNNAH_RAWATIB: sunnahrawatibbottomsheetimage,
  TAHIYYAT_AL_MASJID: tahiyyatalmasjidbottomsheetimage,
  MISSED_PAST_PRAYERS: missedpastprayerbottomsheetimage,
  DUHA: duhaprayerbottomsheetimage,
  TAWBAH: tawbahprayerbottomsheetimage,
  ISTIKHARA: istikharaprayerbottomsheetimage,
  SHUKR: shukarprayerbottomsheetimage,
  QIYAM_AL_LAYL: qiyamallaylbottomsheetimage,
};

export type PrayerTargetBucket = {
  targetCount?: number;
  completedCount?: number;
  targetDays?: number;
  targetPerNight?: number;
  unitTarget?: number;
  witrTarget?: number;
};

export type PrayerGoalApiItem = {
  prayerType: string;
  isActive: boolean;
  title?: string;
  description?: string;
  summaryDescription?: string;
  targets?: Record<string, PrayerTargetBucket | number | boolean> & {
    completedCount?: number;
    targetCount?: number;
    targetDays?: number;
    targetPerNight?: number;
    unitTarget?: number;
    witrTarget?: number;
  };
  congregationalTracking?: boolean;
  menstruationApplied?: boolean;
  afterDhuhrRakahOption?: number;
  beforeAsrEnabled?: boolean;
  beforeAsrRakahOption?: number;
  isFlexible?: boolean;
  trackTahajjud?: boolean;
  qiyamConfig?: {
    isFlexible?: boolean;
    unitTarget?: number;
    trackTahajjud?: boolean;
  };
};

export type PrayerGoalListItem = PrayerGoalApiItem & {
  id: string;
  isSelected: boolean;
  image?: ImageSourcePropType;
};

function asBucket(value: unknown): PrayerTargetBucket {
  if (typeof value === "number") return { targetCount: value };
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    const targetCount =
      typeof o.targetCount === "number"
        ? o.targetCount
        : typeof o.target === "number"
          ? o.target
          : typeof o.value === "number"
            ? o.value
            : undefined;
    return {
      targetCount,
      completedCount:
        typeof o.completedCount === "number" ? o.completedCount : undefined,
      targetDays: typeof o.targetDays === "number" ? o.targetDays : undefined,
    };
  }
  return {};
}

function pickSavedNumber(
  value: number | undefined,
  fallback: number,
): number {
  return typeof value === "number" && value > 0 ? value : fallback;
}

export function hasConfiguredTargets(
  goal: { targets?: PrayerGoalApiItem["targets"] } | undefined,
): boolean {
  if (!goal?.targets) return false;

  const {
    targetCount,
    targetDays,
    unitTarget,
    targetPerNight,
    witrTarget,
    completedCount,
    ...rest
  } = goal.targets;

  if (
    (typeof targetCount === "number" && targetCount > 0) ||
    (typeof targetDays === "number" && targetDays > 0) ||
    (typeof unitTarget === "number" && unitTarget > 0) ||
    (typeof targetPerNight === "number" && targetPerNight > 0) ||
    (typeof witrTarget === "number" && witrTarget > 0) ||
    (typeof completedCount === "number" && completedCount > 0)
  ) {
    return true;
  }

  return Object.values(rest).some((value) => {
    const bucket = asBucket(value);
    return (
      (bucket.targetCount ?? 0) > 0 ||
      (bucket.completedCount ?? 0) > 0 ||
      (bucket.targetDays ?? 0) > 0
    );
  });
}

export function getSimpleTargetCount(
  goal: PrayerGoalApiItem | undefined,
  fallback: number,
): number {
  if (!hasConfiguredTargets(goal)) return fallback;
  return pickSavedNumber(goal?.targets?.targetCount, fallback);
}

export function getMissedTargetDays(
  goal: PrayerGoalApiItem | undefined,
  fallback: number,
): number {
  if (!hasConfiguredTargets(goal)) return fallback;
  return pickSavedNumber(goal?.targets?.targetDays, fallback);
}

export function getFiveDailyInitial(goal: PrayerGoalApiItem | undefined) {
  if (!hasConfiguredTargets(goal)) return undefined;

  const targets = goal?.targets ?? {};
  return {
    fajr: pickSavedNumber(asBucket(targets.fajr).targetCount, 28),
    dhuhr: pickSavedNumber(asBucket(targets.dhuhr).targetCount, 28),
    asr: pickSavedNumber(asBucket(targets.asr).targetCount, 28),
    maghrib: pickSavedNumber(asBucket(targets.maghrib).targetCount, 28),
    isha: pickSavedNumber(asBucket(targets.isha).targetCount, 28),
    jumuah: asBucket(targets.jumuah).targetCount ?? 0,
    congregationalTracking: Boolean(goal?.congregationalTracking),
  };
}

export function getSunnahInitial(goal: PrayerGoalApiItem | undefined) {
  if (!hasConfiguredTargets(goal)) return undefined;

  const targets = goal?.targets ?? {};
  return {
    beforeFajr: pickSavedNumber(asBucket(targets.beforeFajr).targetCount, 28),
    beforeDhuhr: pickSavedNumber(asBucket(targets.beforeDhuhr).targetCount, 56),
    afterDhuhr: pickSavedNumber(asBucket(targets.afterDhuhr).targetCount, 56),
    beforeAsr: pickSavedNumber(asBucket(targets.beforeAsr).targetCount, 56),
    afterMaghrib: pickSavedNumber(
      asBucket(targets.afterMaghrib).targetCount,
      28,
    ),
    afterIsha: pickSavedNumber(asBucket(targets.afterIsha).targetCount, 28),
    afterDhuhrRakahOption: goal?.afterDhuhrRakahOption === 1 ? 1 : 2,
    beforeAsrEnabled: goal?.beforeAsrEnabled ?? true,
    beforeAsrRakahOption: goal?.beforeAsrRakahOption === 1 ? 1 : 2,
  };
}

const QIYAM_DEFAULT_UNIT_TARGET = 1;

type QiyamInitialSource = {
  isFlexible?: boolean;
  trackTahajjud?: boolean;
  targets?: PrayerGoalApiItem["targets"];
  qiyamConfig?: PrayerGoalApiItem["qiyamConfig"];
};

function getQiyamUnitTarget(goal: QiyamInitialSource | undefined): number | undefined {
  const fromConfig = goal?.qiyamConfig?.unitTarget;
  if (typeof fromConfig === "number" && fromConfig > 0) return fromConfig;

  const isFlexible = Boolean(goal?.qiyamConfig?.isFlexible ?? goal?.isFlexible);
  return isFlexible
    ? goal?.targets?.unitTarget
    : goal?.targets?.targetPerNight ?? goal?.targets?.unitTarget;
}

function getQiyamTrackTahajjud(
  goal: QiyamInitialSource | undefined,
): boolean | undefined {
  if (typeof goal?.qiyamConfig?.trackTahajjud === "boolean") {
    return goal.qiyamConfig.trackTahajjud;
  }
  if (typeof goal?.trackTahajjud === "boolean") {
    return goal.trackTahajjud;
  }
  return undefined;
}

/** Backend seeds `{ unitTarget: 2, trackTahajjud: false }` before the user saves. */
function isUnsavedQiyamDefaults(goal: QiyamInitialSource | undefined): boolean {
  if (!goal) return true;
  if (!hasConfiguredTargets(goal) && goal.qiyamConfig == null) return true;

  const isFlexible = Boolean(goal.qiyamConfig?.isFlexible ?? goal.isFlexible);
  if (isFlexible) return false;

  const unitTarget = getQiyamUnitTarget(goal);
  const trackTahajjud = getQiyamTrackTahajjud(goal);
  if (trackTahajjud === true) return false;
  if (typeof unitTarget === "number" && unitTarget > 0 && unitTarget !== 2) {
    return false;
  }
  return true;
}

export function getQiyamInitial(goal: QiyamInitialSource | undefined) {
  if (isUnsavedQiyamDefaults(goal)) {
    return {
      isFlexible: false,
      unitTarget: QIYAM_DEFAULT_UNIT_TARGET,
      witrTarget: 0,
      trackTahajjud: true,
    };
  }

  const isFlexible = Boolean(goal?.qiyamConfig?.isFlexible ?? goal?.isFlexible);

  return {
    isFlexible,
    unitTarget: pickSavedNumber(
      getQiyamUnitTarget(goal),
      QIYAM_DEFAULT_UNIT_TARGET,
    ),
    witrTarget: goal?.targets?.witrTarget ?? 0,
    trackTahajjud: getQiyamTrackTahajjud(goal) ?? true,
  };
}

export function mapPrayerGoalsFromApi(
  goals: PrayerGoalApiItem[] | undefined | null,
): PrayerGoalListItem[] {
  if (!Array.isArray(goals)) return [];

  return goals
    .map((goal) => {
      const id = PRAYER_TYPE_TO_UI_ID[goal.prayerType];
      if (!id) return null;

      return {
        ...goal,
        id,
        isSelected: Boolean(goal.isActive),
        image: PRAYER_TYPE_IMAGES[goal.prayerType],
      };
    })
    .filter(Boolean) as PrayerGoalListItem[];
}
