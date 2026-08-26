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

/** Prefer calendar date so past empty days are never treated as future. */
function resolveIsFutureDay(day: PrayerGoalFrameDay): boolean {
  if (day.isToday) return false;
  if (day.date) {
    const date = moment(day.date, "YYYY-MM-DD");
    if (date.isValid()) return date.isAfter(moment(), "day");
  }
  return Boolean(day.isFuture || day.isFutureDay);
}

export function mapPrayerFrameWeekDays(
  frame: PrayerGoalFrameData,
): TahiyatUlWudhuDayProgress[] {
  return frame.week.days.map((day) => {
    const count = day.count ?? day.totalLogged ?? 0;
    const isFuture = resolveIsFutureDay(day);
    return {
      day: day.dayLabel,
      prayersLogged: count,
      isLogged: !isFuture && count > 0,
      isBestDay: Boolean(day.isBestDay),
      isMenstruation: Boolean(day.isMenstruationDay),
      isFuture,
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
    const isFuture = resolveIsFutureDay(day);
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

function sunnahRakahOptionToWeight(option: number | undefined): 1 | 2 {
  return option === 1 ? 1 : 2;
}

/**
 * Arc set + lengths for Sunnah Rawatib day rings from frame `slotConfig`.
 * Fixed slots always included; Before Asr only when enabled; dual-option
 * slots use weight 1 (2 rak'ahs) or 2 (4 rak'ahs).
 */
export function buildSunnahGoalFromSlotConfig(
  slotConfig?: SunnahRawatibSlotConfig | null,
): SunnahPrayerConfig[] {
  const goal: SunnahPrayerConfig[] = [
    { id: "before_fajr", weight: 1 },
    { id: "before_dhuhr", weight: 2 },
    {
      id: "after_dhuhr",
      weight: sunnahRakahOptionToWeight(slotConfig?.afterDhuhrRakahOption),
    },
  ];

  if (slotConfig?.beforeAsrEnabled) {
    goal.push({
      id: "before_asr",
      weight: sunnahRakahOptionToWeight(slotConfig?.beforeAsrRakahOption),
    });
  }

  goal.push(
    { id: "after_maghrib", weight: 1 },
    { id: "after_isha", weight: 1 },
  );

  return goal;
}

/**
 * Map frame week days for Sunnah Rawatib rings.
 * Arc geometry from `slotConfig`; per-slot fills empty until day.slots exist.
 * Day total prefers `count` / `totalLogged`.
 */
export function mapSunnahFrameWeekDays(
  frame: PrayerGoalFrameData,
): SunnahRawatibDayProgress[] {
  const goal = buildSunnahGoalFromSlotConfig(frame.slotConfig);

  return frame.week.days.map((day) => {
    const count = day.count ?? day.totalLogged ?? 0;
    const isFuture = resolveIsFutureDay(day);

    return {
      day: day.dayLabel,
      date: day.date,
      isToday: Boolean(day.isToday),
      isFuture,
      count,
      data: {
        goal,
        logged: {} as Partial<Record<SunnahPrayerId, number>>,
        isMenstruation: Boolean(day.isMenstruationDay),
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
