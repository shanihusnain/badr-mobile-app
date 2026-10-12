import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolveFastingType } from "@/src/utils/fastingGoalMap";

export type FastingGoalFastTimesData = {
  date: string;
  /** HH:mm 24h — typically Fajr */
  startTime: string;
  /** HH:mm 24h — typically Maghrib */
  endTime: string;
};

export const fastingGoalFastTimesQueryKey = (
  fastingType: string,
  date: string,
) => ["fasting-goal-fast-times", fastingType, date] as const;

function toHhMm(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  // Accept "HH:mm" or "HH:mm:ss"
  const match = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return "";
  const hour = Math.min(23, Math.max(0, Number.parseInt(match[1], 10) || 0));
  const minute = Math.min(59, Math.max(0, Number.parseInt(match[2], 10) || 0));
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export const getFastingGoalFastTimes = async (
  fastingType: string,
  date: string,
): Promise<FastingGoalFastTimesData | null> => {
  const response = await api.get(
    `api/goal-cycles/current/fasting-goals/${fastingType}/fast-times`,
    { params: { date } },
  );
  const data = response.data?.data;
  if (!data) return null;

  const startTime = toHhMm(data.startTime);
  const endTime = toHhMm(data.endTime);
  if (!startTime || !endTime) return null;

  return {
    date: String(data.date ?? date).slice(0, 10),
    startTime,
    endTime,
  };
};

/**
 * Fajr / Maghrib (or equivalent) for a fasting log date.
 * Used to prefill start/end time pickers; user can still edit.
 */
export const useGetFastingGoalFastTimes = (
  fastingTypeInput: string | null | undefined,
  date: string | null | undefined,
  options?: { enabled?: boolean },
) => {
  const fastingType = fastingTypeInput
    ? resolveFastingType(fastingTypeInput)
    : "";
  const normalizedDate = date ? String(date).slice(0, 10) : "";
  const enabled =
    !!fastingType &&
    !!normalizedDate &&
    (options?.enabled ?? true);

  return useQuery({
    queryKey: fastingGoalFastTimesQueryKey(fastingType, normalizedDate),
    queryFn: () => getFastingGoalFastTimes(fastingType, normalizedDate),
    enabled,
  });
};
