import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolveFastingType } from "@/src/utils/fastingGoalMap";

export type FastingLoggableDatesMode =
  | "PLANNED_DATE"
  | "EARLIER_THAN_PLANNED"
  | "MAKE_UP"
  | "ANY_DATE"
  | string;

/** One day from `…/fasting-goals/{type}/loggable-dates`. */
export type FastingLoggableDateEntry = {
  date: string;
  enabled: boolean;
  isBookedForAnotherGoal: boolean;
  alreadyLoggedFastingGoal: boolean;
  description: string;
};

export type FastingLoggableDatesData = {
  mode: FastingLoggableDatesMode;
  dates: FastingLoggableDateEntry[];
  plannedDates: string[];
  unavailableDates: string[];
};

export const fastingLoggableDatesQueryKey = (
  fastingType: string,
  mode?: string,
) =>
  [
    "fasting-loggable-dates",
    fastingType,
    mode ?? "PLANNED_DATE",
  ] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toDateString(value: unknown): string {
  if (typeof value === "string") return value.slice(0, 10);
  if (value == null) return "";
  return String(value).slice(0, 10);
}

function parseLoggableDateEntry(value: unknown): FastingLoggableDateEntry | null {
  if (typeof value === "string") {
    const date = toDateString(value);
    if (!date) return null;
    return {
      date,
      enabled: true,
      isBookedForAnotherGoal: false,
      alreadyLoggedFastingGoal: false,
      description: "",
    };
  }

  const row = asRecord(value);
  if (!row) return null;
  const date = toDateString(row.date);
  if (!date) return null;

  return {
    date,
    enabled: row.enabled !== false,
    isBookedForAnotherGoal: row.isBookedForAnotherGoal === true,
    alreadyLoggedFastingGoal: row.alreadyLoggedFastingGoal === true,
    description:
      typeof row.description === "string" ? row.description.trim() : "",
  };
}

function parseLoggableDateEntries(value: unknown): FastingLoggableDateEntry[] {
  if (!Array.isArray(value)) return [];
  const parsed = value
    .map(parseLoggableDateEntry)
    .filter((entry): entry is FastingLoggableDateEntry => entry != null);
  // Stable chronological order for the chevron stepper.
  return [...parsed].sort((a, b) => a.date.localeCompare(b.date));
}

function parseDateStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .map((entry) => {
          if (typeof entry === "string") return toDateString(entry);
          const row = asRecord(entry);
          return toDateString(row?.date);
        })
        .filter(Boolean),
    ),
  ].sort();
}

/** Date strings only (e.g. length checks / legacy callers). */
export function getLoggableDateStrings(
  data: FastingLoggableDatesData | null | undefined,
): string[] {
  return (data?.dates ?? []).map((entry) => entry.date);
}

export const getFastingLoggableDates = async (
  fastingType: string,
  mode?: FastingLoggableDatesMode,
): Promise<FastingLoggableDatesData | null> => {
  const response = await api.get(
    `api/goal-cycles/current/fasting-goals/${fastingType}/loggable-dates`,
    {
      params: mode && mode !== "PLANNED_DATE" ? { mode } : undefined,
    },
  );
  const data = response.data?.data;
  if (!data) return null;

  return {
    mode: data.mode ?? mode ?? "PLANNED_DATE",
    dates: parseLoggableDateEntries(data.dates),
    plannedDates: parseDateStringList(data.plannedDates),
    unavailableDates: parseDateStringList(data.unavailableDates),
  };
};

export const useGetFastingLoggableDates = (
  fastingTypeInput: string | null | undefined,
  options?: { enabled?: boolean; mode?: FastingLoggableDatesMode },
) => {
  const fastingType = fastingTypeInput
    ? resolveFastingType(fastingTypeInput)
    : "";
  const mode = options?.mode ?? "PLANNED_DATE";
  const enabled = !!fastingType && (options?.enabled ?? true);

  return useQuery({
    queryKey: fastingLoggableDatesQueryKey(fastingType, mode),
    queryFn: () => getFastingLoggableDates(fastingType, mode),
    enabled,
  });
};
