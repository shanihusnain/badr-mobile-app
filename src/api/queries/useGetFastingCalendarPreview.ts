import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import {
  normalizeFastingCalendarPreviewDay,
  type FastingCalendarPreviewData,
} from "@/src/utils/fastingCalendarPreview";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function normalizeFastingCalendarPreviewResponse(
  axiosData: unknown,
): FastingCalendarPreviewData | null {
  const root = asRecord(axiosData);
  const payload = asRecord(root?.data) ?? root;
  if (!payload) return null;

  const cycle = asRecord(payload.cycle);
  if (!cycle || typeof cycle.startDate !== "string") return null;

  const days = Array.isArray(payload.days)
    ? payload.days
        .map(normalizeFastingCalendarPreviewDay)
        .filter(Boolean)
    : [];

  return {
    cycle: {
      id: typeof cycle.id === "string" ? cycle.id : "",
      startDate: cycle.startDate,
      endDate: typeof cycle.endDate === "string" ? cycle.endDate : cycle.startDate,
      status: typeof cycle.status === "string" ? cycle.status : "",
      totalDays: typeof cycle.totalDays === "number" ? cycle.totalDays : 28,
    },
    days: days as FastingCalendarPreviewData["days"],
  };
}

const getFastingCalendarPreview =
  async (): Promise<FastingCalendarPreviewData | null> => {
    const response = await api.get(
      "api/goal-cycles/current/fasting-goals/calendar-preview",
    );
    return normalizeFastingCalendarPreviewResponse(response.data);
  };

export const useGetFastingCalendarPreview = ({
  enabled,
}: {
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ["fasting-calendar-preview"],
    queryFn: getFastingCalendarPreview,
    enabled,
  });
};
