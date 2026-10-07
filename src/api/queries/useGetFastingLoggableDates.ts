import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolveFastingType } from "@/src/utils/fastingGoalMap";

export type FastingLoggableDatesMode =
  | "PLANNED_DATE"
  | "EARLIER_THAN_PLANNED"
  | "MAKE_UP"
  | "ANY_DATE"
  | string;

export type FastingLoggableDatesData = {
  mode: FastingLoggableDatesMode;
  dates: string[];
  plannedDates: string[];
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

export const getFastingLoggableDates = async (
  fastingType: string,
  mode?: FastingLoggableDatesMode,
): Promise<FastingLoggableDatesData | null> => {
  const response = await api.get(
    `api/goal-cycles/current/fasting-goals/${fastingType}/loggable-dates`,
    {
      params:
        mode && mode !== "PLANNED_DATE" ? { mode } : undefined,
    },
  );
  const data = response.data?.data;
  if (!data) return null;

  return {
    mode: data.mode ?? mode ?? "PLANNED_DATE",
    dates: Array.isArray(data.dates) ? data.dates : [],
    plannedDates: Array.isArray(data.plannedDates) ? data.plannedDates : [],
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
