import moment from "moment-hijri";
import { Colors } from "@/constants/theme";

export type FastingLegendType =
  | "MISSED_RAMADAN"
  | "MONDAY_THURSDAY"
  | "WHITE_DAYS"
  | "PROPHET_DAWOOD";

export type FastingCalendarPreviewCycle = {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  totalDays: number;
};

export type FastingCalendarPreviewHijri = {
  day: number;
  month: number;
  year: number;
  formatted: string;
};

export type FastingCalendarPreviewPlannedFast = {
  id: string;
  fastingGoalId: string;
  fastingType: string;
  status: string;
};

export type FastingCalendarPreviewDay = {
  date: string;
  hijriDate: FastingCalendarPreviewHijri;
  isMondayOrThursday: boolean;
  isWhiteDay: boolean;
  /** Backend now sends a single flag (older builds used isDawoodDay1 / isDawoodDay2). */
  isDawoodDay: boolean;
  activePotentials: string[];
  plannedFasts: FastingCalendarPreviewPlannedFast[];
  hasConflict: boolean;
  conflictReason: string | null;
};

export type FastingCalendarPreviewData = {
  cycle: FastingCalendarPreviewCycle;
  days: FastingCalendarPreviewDay[];
};

export type FastingLegendItem = {
  type: FastingLegendType;
  label: string;
  color: string;
};

/** Normalized view used by fasting calendar UIs. */
export type FastingCalendarWindow = {
  startDate: string;
  endDate: string;
  currentDate: string;
  rangeLabel: string;
  islamicRangeLabel: string;
  days: FastingCalendarPreviewDay[];
  /** Unique fasting types present in any day's activePotentials */
  activePotentialTypes: FastingLegendType[];
  /** Unique fasting types present in any plannedFasts entry */
  plannedTypes: FastingLegendType[];
  /** Legend types to render (union of active + planned) */
  legendTypes: FastingLegendType[];
  legendItems: FastingLegendItem[];
  /** Calendar date sets from day flags */
  monThuDates: string[];
  whiteDayDates: string[];
  dawoodDates: string[];
  /** Dates where type appears in activePotentials */
  activeMonThuDates: string[];
  activeWhiteDayDates: string[];
  activeDawoodDates: string[];
  /** Dates from plannedFasts by type */
  missedRamadanDates: string[];
  monThuPlannedDates: string[];
  whiteDaysPlannedDates: string[];
  dawoodPlannedDates: string[];
  conflictDates: string[];
};

const HIJRI_MONTHS_SHORT = [
  "Muh.",
  "Saf.",
  "Rab. I",
  "Rab. II",
  "Jum. I",
  "Jum. II",
  "Raj.",
  "Sha.",
  "Ram.",
  "Shaw.",
  "Dhul Q.",
  "Dhul H.",
] as const;

const LEGEND_ORDER: FastingLegendType[] = [
  "MISSED_RAMADAN",
  "MONDAY_THURSDAY",
  "WHITE_DAYS",
  "PROPHET_DAWOOD",
];

export const FASTING_LEGEND_META: Record<
  FastingLegendType,
  { label: string; color: string }
> = {
  MISSED_RAMADAN: {
    label: "MISSED RAMADAN FASTS",
    color: Colors.light.ringRamadan,
  },
  MONDAY_THURSDAY: {
    label: "MONDAYS & THURSDAYS",
    color: Colors.light.ringMonThu,
  },
  WHITE_DAYS: {
    label: "WHITE DAYS",
    color: Colors.light.white,
  },
  PROPHET_DAWOOD: {
    label: "PROPHET DAWOOD FASTS",
    color: Colors.light.ringDawood,
  },
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asFastingType(value: unknown): FastingLegendType | null {
  if (
    value === "MISSED_RAMADAN" ||
    value === "MONDAY_THURSDAY" ||
    value === "WHITE_DAYS" ||
    value === "PROPHET_DAWOOD"
  ) {
    return value;
  }
  return null;
}

/** Accept current API shape and older isDawoodDay1/2 payloads. */
export function normalizeFastingCalendarPreviewDay(
  raw: unknown,
): FastingCalendarPreviewDay | null {
  const day = asRecord(raw);
  if (!day || typeof day.date !== "string") return null;

  const hijriRaw = asRecord(day.hijriDate);
  const hijri: FastingCalendarPreviewHijri = {
    day: typeof hijriRaw?.day === "number" ? hijriRaw.day : 0,
    month: typeof hijriRaw?.month === "number" ? hijriRaw.month : 0,
    year: typeof hijriRaw?.year === "number" ? hijriRaw.year : 0,
    formatted:
      typeof hijriRaw?.formatted === "string" ? hijriRaw.formatted : "",
  };

  const plannedFasts = Array.isArray(day.plannedFasts)
    ? day.plannedFasts
        .map((item) => {
          const plan = asRecord(item);
          if (!plan) return null;
          return {
            id: typeof plan.id === "string" ? plan.id : "",
            fastingGoalId:
              typeof plan.fastingGoalId === "string" ? plan.fastingGoalId : "",
            fastingType:
              typeof plan.fastingType === "string" ? plan.fastingType : "",
            status: typeof plan.status === "string" ? plan.status : "",
          } satisfies FastingCalendarPreviewPlannedFast;
        })
        .filter(Boolean) as FastingCalendarPreviewPlannedFast[]
    : [];

  const activePotentials = Array.isArray(day.activePotentials)
    ? day.activePotentials.filter((v): v is string => typeof v === "string")
    : [];

  return {
    date: day.date,
    hijriDate: hijri,
    isMondayOrThursday: Boolean(day.isMondayOrThursday),
    isWhiteDay: Boolean(day.isWhiteDay),
    isDawoodDay: Boolean(
      day.isDawoodDay ?? day.isDawoodDay1 ?? day.isDawoodDay2,
    ),
    activePotentials,
    plannedFasts,
    hasConflict: Boolean(day.hasConflict),
    conflictReason:
      typeof day.conflictReason === "string" ? day.conflictReason : null,
  };
}

function buildGregorianRangeLabel(startDate: string, endDate: string): string {
  const start = moment(startDate, "YYYY-MM-DD");
  const end = moment(endDate, "YYYY-MM-DD");
  if (start.year() === end.year()) {
    return `${start.format("MMM D")} - ${end.format("MMM D")}, ${start.year()}`;
  }
  return `${start.format("MMM D, YYYY")} - ${end.format("MMM D, YYYY")}`;
}

function buildIslamicRangeLabel(
  days: FastingCalendarPreviewDay[],
  startDate: string,
  endDate: string,
): string {
  const first = days[0]?.hijriDate;
  const last = days[days.length - 1]?.hijriDate;

  if (first && last && first.month && last.month) {
    const startMonth = HIJRI_MONTHS_SHORT[Math.max(0, first.month - 1)] ?? "";
    const endMonth = HIJRI_MONTHS_SHORT[Math.max(0, last.month - 1)] ?? "";
    if (first.month === last.month && first.year === last.year) {
      return `${startMonth} ${first.year}`;
    }
    if (first.year === last.year) {
      return `${startMonth} - ${endMonth} ${first.year}`;
    }
    return `${startMonth} ${first.year} - ${endMonth} ${last.year}`;
  }

  const start = moment(startDate, "YYYY-MM-DD");
  const end = moment(endDate, "YYYY-MM-DD");
  const startMonth = HIJRI_MONTHS_SHORT[start.iMonth()];
  const endMonth = HIJRI_MONTHS_SHORT[end.iMonth()];
  if (start.iMonth() === end.iMonth() && start.iYear() === end.iYear()) {
    return `${startMonth} ${start.iYear()}`;
  }
  if (start.iYear() === end.iYear()) {
    return `${startMonth} - ${endMonth} ${start.iYear()}`;
  }
  return `${startMonth} ${start.iYear()} - ${endMonth} ${end.iYear()}`;
}

function plannedDatesForType(
  days: FastingCalendarPreviewDay[],
  fastingType: FastingLegendType,
): string[] {
  return days
    .filter((day) =>
      day.plannedFasts.some((plan) => plan.fastingType === fastingType),
    )
    .map((day) => day.date);
}

function activeDatesForType(
  days: FastingCalendarPreviewDay[],
  fastingType: FastingLegendType,
): string[] {
  return days
    .filter((day) => day.activePotentials.includes(fastingType))
    .map((day) => day.date);
}

function uniqueTypesFrom(
  values: Iterable<string | null | undefined>,
): FastingLegendType[] {
  const set = new Set<FastingLegendType>();
  for (const value of values) {
    const type = asFastingType(value);
    if (type) set.add(type);
  }
  return LEGEND_ORDER.filter((type) => set.has(type));
}

export function getFastingLegendItems(
  types: FastingLegendType[],
  options?: { forceInclude?: FastingLegendType[] },
): FastingLegendItem[] {
  const set = new Set<FastingLegendType>(types);
  for (const type of options?.forceInclude ?? []) set.add(type);
  return LEGEND_ORDER.filter((type) => set.has(type)).map((type) => ({
    type,
    label: FASTING_LEGEND_META[type].label,
    color: FASTING_LEGEND_META[type].color,
  }));
}

/**
 * Dates where the current fasting goal overlaps another goal in this cycle.
 * Used to brighten only colliding selected days.
 */
export function getFastingCollisionDates(
  calendarWindow: FastingCalendarWindow | null | undefined,
  currentType: FastingLegendType,
): string[] {
  if (!calendarWindow) return [];

  const activeGoals = new Set<FastingLegendType>([
    ...calendarWindow.plannedTypes,
    ...calendarWindow.activePotentialTypes,
  ]);

  const dates = new Set<string>(calendarWindow.conflictDates ?? []);

  if (currentType !== "WHITE_DAYS" && activeGoals.has("WHITE_DAYS")) {
    for (const date of calendarWindow.whiteDayDates) dates.add(date);
  }
  if (currentType !== "MONDAY_THURSDAY" && activeGoals.has("MONDAY_THURSDAY")) {
    for (const date of calendarWindow.monThuDates) dates.add(date);
  }
  if (currentType !== "MISSED_RAMADAN" && activeGoals.has("MISSED_RAMADAN")) {
    for (const date of calendarWindow.missedRamadanDates) dates.add(date);
  }
  if (currentType !== "PROPHET_DAWOOD" && activeGoals.has("PROPHET_DAWOOD")) {
    const dawood =
      calendarWindow.dawoodPlannedDates.length > 0
        ? calendarWindow.dawoodPlannedDates
        : calendarWindow.dawoodDates;
    for (const date of dawood) dates.add(date);
  }

  return Array.from(dates);
}

export function getSelectableMonThuDates(
  calendarWindow?: FastingCalendarWindow | null,
): string[] {
  if (!calendarWindow) return [];
  const blocked = new Set([
    ...calendarWindow.missedRamadanDates,
    ...calendarWindow.whiteDaysPlannedDates,
    ...calendarWindow.dawoodPlannedDates,
  ]);
  return calendarWindow.monThuDates.filter((date) => !blocked.has(date));
}

export function buildFastingCalendarWindow(
  preview: FastingCalendarPreviewData | null | undefined,
): FastingCalendarWindow | null {
  if (!preview?.cycle?.startDate || !preview?.cycle?.endDate) return null;

  const { cycle } = preview;
  const days = (preview.days ?? [])
    .map(normalizeFastingCalendarPreviewDay)
    .filter(Boolean) as FastingCalendarPreviewDay[];

  const startDate = cycle.startDate;
  const endDate = cycle.endDate;

  const activePotentialTypes = uniqueTypesFrom(
    days.flatMap((day) => day.activePotentials),
  );
  const plannedTypes = uniqueTypesFrom(
    days.flatMap((day) => day.plannedFasts.map((plan) => plan.fastingType)),
  );
  const legendTypes = uniqueTypesFrom([
    ...activePotentialTypes,
    ...plannedTypes,
  ]);

  return {
    startDate,
    endDate,
    currentDate: moment(startDate, "YYYY-MM-DD")
      .startOf("month")
      .format("YYYY-MM-DD"),
    rangeLabel: buildGregorianRangeLabel(startDate, endDate),
    islamicRangeLabel: buildIslamicRangeLabel(days, startDate, endDate),
    days,
    activePotentialTypes,
    plannedTypes,
    legendTypes,
    legendItems: getFastingLegendItems(legendTypes),
    monThuDates: days.filter((d) => d.isMondayOrThursday).map((d) => d.date),
    whiteDayDates: days.filter((d) => d.isWhiteDay).map((d) => d.date),
    dawoodDates: days.filter((d) => d.isDawoodDay).map((d) => d.date),
    activeMonThuDates: activeDatesForType(days, "MONDAY_THURSDAY"),
    activeWhiteDayDates: activeDatesForType(days, "WHITE_DAYS"),
    activeDawoodDates: activeDatesForType(days, "PROPHET_DAWOOD"),
    missedRamadanDates: plannedDatesForType(days, "MISSED_RAMADAN"),
    monThuPlannedDates: plannedDatesForType(days, "MONDAY_THURSDAY"),
    whiteDaysPlannedDates: plannedDatesForType(days, "WHITE_DAYS"),
    dawoodPlannedDates: plannedDatesForType(days, "PROPHET_DAWOOD"),
    conflictDates: days.filter((d) => d.hasConflict).map((d) => d.date),
  };
}
