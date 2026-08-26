import moment from "moment-hijri";
import type {
  FiveDailyPrayerSlot,
  FiveDailyPrayerSlotKey,
  PrayerGoalFrameData,
  PrayerGoalFrameDay,
  SunnahRawatibSlotConfig,
} from "@/src/api/queries/useGetPrayerGoalFrame";
import type { TahiyatUlWudhuDayProgress } from "@/components/molecules/TahiyatUlWudhuWeeklyProgressDashboard";
import type { DayProgress } from "@/components/molecules/WeeklyProgressDashboard";
import type { PrayerStatus } from "@/components/molecules/PrayerProgressTrackerRing";
import type {
  SunnahPrayerConfig,
  SunnahPrayerId,
} from "@/components/molecules/SunnahRawatibDayRing";
import type { SunnahRawatibDayProgress } from "@/components/molecules/SunnahRawatibWeeklyProgressDashboard";

const FIVE_DAILY_SLOT_ORDER: FiveDailyPrayerSlotKey[] = [
  "FAJR",
  "DHUHR",
  "ASR",
  "MAGHRIB",
  "ISHA",
];

export function formatPrayerFrameWeekRange(weekStart: string, weekEnd: string) {
  const start = moment(weekStart, "YYYY-MM-DD");
  const end = moment(weekEnd, "YYYY-MM-DD");
  if (!start.isValid() || !end.isValid()) return "";
  if (start.month() === end.month()) {
    return `${start.format("MMM D")} — ${end.format("D")}`;
  }
  return `${start.format("MMM D")} — ${end.format("MMM D")}`;
}

export function mapPrayerFrameWeekDays(
  frame: PrayerGoalFrameData,
): TahiyatUlWudhuDayProgress[] {
  return frame.week.days.map((day) => {
    const count = day.count ?? day.totalLogged ?? 0;
    return {
      day: day.dayLabel,
      prayersLogged: count,
      isLogged: !day.isFuture && count > 0,
      isBestDay: Boolean(day.isBestDay),
      isMenstruation: Boolean(day.isMenstruationDay),
      isFuture: day.isFuture || Boolean(day.isFutureDay),
      isToday: day.isToday,
      date: day.date,
    };
  });
}

function clampSlotCount(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(5, Math.round(value)));
}

function mapFiveDailySlotToStatus(
  slot: FiveDailyPrayerSlot | undefined,
): PrayerStatus {
  if (!slot) return "none";
  if (slot.isMenstruationSlot) return "menstruation";
  if (!slot.logged) return "none";
  if (slot.wasQadha) return "missed";
  if (slot.wasCongregational) return "congregation";
  if (slot.prayedOnTime) return "onTime";
  return "missed";
}

function mapFiveDailyStatusesFromCounts(
  day: PrayerGoalFrameDay,
): PrayerStatus[] {
  if (day.allFiveOnTime) {
    return ["onTime", "onTime", "onTime", "onTime", "onTime"];
  }

  const onTime = clampSlotCount(day.slotsOnTime);
  const qadha = Math.min(5 - onTime, clampSlotCount(day.slotsQadha));
  const statuses: PrayerStatus[] = [];
  for (let i = 0; i < onTime; i += 1) statuses.push("onTime");
  for (let i = 0; i < qadha; i += 1) statuses.push("missed");
  while (statuses.length < 5) statuses.push("none");
  return statuses;
}

/**
 * Five Daily frame week: always 5 arcs from FAJR→ISHA slots.
 * Colors (Figma):
 * - menstruation → red
 * - qadha → orange (missed)
 * - congregational → teal
 * - on-time → white today / green past (ring chooses via isToday)
 * - empty → dim arc
 */
export function mapFiveDailyFrameWeekDays(
  frame: PrayerGoalFrameData,
): DayProgress[] {
  return frame.week.days.map((day) => {
    const isFuture = Boolean(day.isFuture || day.isFutureDay);
    const isToday = Boolean(day.isToday);
    const isMenstruating = Boolean(day.isMenstruationDay);

    if (isFuture) {
      return {
        day: day.dayLabel,
        date: day.date,
        statuses: ["none", "none", "none", "none", "none"],
        isToday: false,
        isFuture: true,
        isMenstruating: false,
      };
    }

    if (day.slots) {
      const statuses = FIVE_DAILY_SLOT_ORDER.map((key) =>
        mapFiveDailySlotToStatus(day.slots?.[key]),
      );
      const anyLogged = statuses.some(
        (s) => s !== "none" && s !== "menstruation",
      );

      return {
        day: day.dayLabel,
        date: day.date,
        statuses:
          isMenstruating && !anyLogged
            ? Array<PrayerStatus>(5).fill("menstruation")
            : statuses,
        isToday,
        isFuture: false,
        isMenstruating:
          isMenstruating || statuses.every((s) => s === "menstruation"),
      };
    }

    if (isMenstruating) {
      return {
        day: day.dayLabel,
        date: day.date,
        statuses: Array<PrayerStatus>(5).fill("menstruation"),
        isToday,
        isFuture: false,
        isMenstruating: true,
      };
    }

    return {
      day: day.dayLabel,
      date: day.date,
      statuses: mapFiveDailyStatusesFromCounts(day),
      isToday,
      isFuture: false,
      isMenstruating: false,
    };
  });
}

function sunnahPrayersPerDayToWeight(prayersPerDay: number): 1 | 2 {
  return prayersPerDay === 2 ? 2 : 1;
}

/** After Dhuhr: 1 or 2 prayers/day from frame slotConfig. */
export function getSunnahAfterDhuhrPrayersPerDay(
  slotConfig?: SunnahRawatibSlotConfig | null,
): 1 | 2 {
  const raw =
    slotConfig?.afterDhuhrPrayersPerDay ?? slotConfig?.afterDhuhrRakahOption;
  return raw === 2 ? 2 : 1;
}

/**
 * Before Asr: 0 (off), 1, or 2 prayers/day from frame slotConfig.
 */
export function getSunnahBeforeAsrPrayersPerDay(
  slotConfig?: SunnahRawatibSlotConfig | null,
): 0 | 1 | 2 {
  if (slotConfig?.beforeAsrPrayersPerDay != null) {
    const v = slotConfig.beforeAsrPrayersPerDay;
    if (v <= 0) return 0;
    if (v >= 2) return 2;
    return 1;
  }
  // Legacy: enabled flag + rakah option
  if (slotConfig?.beforeAsrEnabled === false) return 0;
  if (slotConfig?.beforeAsrEnabled || slotConfig?.beforeAsrRakahOption != null) {
    return slotConfig.beforeAsrRakahOption === 2 ? 2 : 1;
  }
  return 0;
}

/**
 * Arc set for Sunnah Rawatib day rings from frame `slotConfig`.
 * `weight` = prayers/day (1 or 2) → proportional arc length + fill target.
 * Before Asr omitted when prayers/day is 0.
 * Order clockwise from ~1 o'clock: Before Fajr → After Isha.
 */
export function buildSunnahGoalFromSlotConfig(
  slotConfig?: SunnahRawatibSlotConfig | null,
): SunnahPrayerConfig[] {
  const afterDhuhr = getSunnahAfterDhuhrPrayersPerDay(slotConfig);
  const beforeAsr = getSunnahBeforeAsrPrayersPerDay(slotConfig);

  const goal: SunnahPrayerConfig[] = [
    { id: "before_fajr", weight: 1 },
    // Always two prayers/day in the monthly goal.
    { id: "before_dhuhr", weight: 2 },
    {
      id: "after_dhuhr",
      weight: sunnahPrayersPerDayToWeight(afterDhuhr),
    },
  ];

  if (beforeAsr > 0) {
    goal.push({
      id: "before_asr",
      weight: sunnahPrayersPerDayToWeight(beforeAsr),
    });
  }

  goal.push(
    { id: "after_maghrib", weight: 1 },
    { id: "after_isha", weight: 1 },
  );

  return goal;
}

const SUNNAH_UI_TO_API_SLOT: Record<SunnahPrayerId, string> = {
  before_fajr: "BEFORE_FAJR",
  before_dhuhr: "BEFORE_DHUHR",
  after_dhuhr: "AFTER_DHUHR",
  before_asr: "BEFORE_ASR",
  after_maghrib: "AFTER_MAGHRIB",
  after_isha: "AFTER_ISHA",
};

function readSunnahSlotUnits(
  slots: PrayerGoalFrameDay["slots"],
  prayerId: SunnahPrayerId,
): number | undefined {
  if (!slots) return undefined;
  const apiKey = SUNNAH_UI_TO_API_SLOT[prayerId];
  const raw = (slots as Record<string, unknown>)[apiKey];
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.max(0, raw);
  }
  return undefined;
}

/**
 * Map frame day `slots` → ring `logged` units (1 unit = one 2-rak'ah prayer).
 * - Future: empty → dim arcs
 * - Today: filled slots green/partial; missing → bright white (upcoming)
 * - Past with no activity: empty → dim (not missed)
 * - Past with activity: missing slots → 0 (yellow / missed)
 */
function mapSunnahLoggedFromDay(
  day: PrayerGoalFrameDay,
  goal: SunnahPrayerConfig[],
): Partial<Record<SunnahPrayerId, number>> {
  const isFuture = Boolean(day.isFuture || day.isFutureDay);
  if (isFuture) return {};

  const slotEntries = day.slots ?? {};
  const hasActivity =
    (day.count ?? day.totalLogged ?? 0) > 0 ||
    Object.keys(slotEntries).length > 0;

  const logged: Partial<Record<SunnahPrayerId, number>> = {};

  for (const prayer of goal) {
    const units = readSunnahSlotUnits(day.slots, prayer.id);
    if (units !== undefined) {
      logged[prayer.id] = Math.min(prayer.weight, units);
    } else if (!day.isToday && hasActivity) {
      logged[prayer.id] = 0;
    }
  }

  return logged;
}

/**
 * Map frame week days for Sunnah Rawatib rings.
 * Arc geometry from `slotConfig`; fills from day.slots unit counts.
 * Day total prefers `count` / `totalLogged`.
 */
export function mapSunnahFrameWeekDays(
  frame: PrayerGoalFrameData,
): SunnahRawatibDayProgress[] {
  const goal = buildSunnahGoalFromSlotConfig(frame.slotConfig);

  return frame.week.days.map((day) => {
    const count = day.count ?? day.totalLogged ?? 0;
    const isFuture = Boolean(day.isFuture || day.isFutureDay);

    return {
      day: day.dayLabel,
      date: day.date,
      isToday: Boolean(day.isToday),
      isFuture,
      count,
      data: {
        goal,
        logged: mapSunnahLoggedFromDay(day, goal),
        isMenstruation: Boolean(day.isMenstruationDay),
        isToday: Boolean(day.isToday),
      },
    };
  });
}

export function getPrayerFrameTodayIndex(frame: PrayerGoalFrameData): number {
  const todayIndex = frame.week.days.findIndex((day) => day.isToday);
  return todayIndex >= 0 ? todayIndex : frame.week.days.length - 1;
}

export function getPrayerFrameWeekFraction(frame: PrayerGoalFrameData): string {
  return `${frame.cycle.weekNumber}/${frame.cycle.totalWeeks}`;
}

export type PrayerGoalFrameStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type PrayerFrameBadge = {
  text: string;
  type: "in-progress" | "completed" | "not-started";
};

export function normalizePrayerGoalFrameStatus(
  status: string | undefined | null,
): PrayerGoalFrameStatus {
  const normalized = (status ?? "NOT_STARTED").toUpperCase().replace(/-/g, "_");
  if (normalized === "IN_PROGRESS") return "IN_PROGRESS";
  if (normalized === "COMPLETED") return "COMPLETED";
  return "NOT_STARTED";
}

type PrayerFrameTranslate = (
  key: string,
  options?: Record<string, string | number>,
) => string;

export function getPrayerFrameAchievementLabel(
  frame: PrayerGoalFrameData,
  t: PrayerFrameTranslate,
): PrayerFrameBadge {
  const status = normalizePrayerGoalFrameStatus(frame.goal.status);
  const pct = frame.goal.achievementPct ?? 0;
  const completed = frame.goal.completedCount ?? 0;

  if (status === "COMPLETED" || pct >= 100) {
    return {
      text: t("progressLogging.fullyAchieved"),
      type: "completed",
    };
  }

  if (completed > 0 || pct > 0) {
    return {
      text: t("progressLogging.inProgress"),
      type: "in-progress",
    };
  }

  return {
    text: t("progressLogging.notStarted"),
    type: "not-started",
  };
}

/**
 * Show VIEW INSIGHTS when:
 * 1) the goal ring is at 100% (goal completed), or
 * 2) today is on/after the last day of the 28-day cycle.
 */
export function prayerFrameShowsInsights(frame: PrayerGoalFrameData): boolean {
  const pct = frame.goal.achievementPct ?? 0;
  if (pct >= 100) return true;

  const status = normalizePrayerGoalFrameStatus(frame.goal.status);
  if (status === "COMPLETED") return true;

  const cycleEnd = frame.cycle?.cycleEnd;
  if (cycleEnd) {
    const today = moment().format("YYYY-MM-DD");
    const end = moment(cycleEnd).format("YYYY-MM-DD");
    if (end && today >= end) return true;
  }

  return false;
}

/** Compact ring inner label, e.g. "25 prayers" — pair with weeklyProgress_goalLabel i18n. */
export function getPrayerFrameRingGoalCountLabel(
  frame: PrayerGoalFrameData,
  unitLabel: string,
): string {
  const count = frame.goal.targetCount ?? 0;
  return `${count} ${unitLabel}`;
}
