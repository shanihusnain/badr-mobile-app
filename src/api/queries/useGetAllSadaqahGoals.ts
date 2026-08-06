import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import type { SadaqahGoalApiItem } from "@/src/utils/sadaqahGoalMap";

export type AllSadaqahGoalsResponse = {
  cycleId?: string;
  goals: SadaqahGoalApiItem[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/**
 * Normalize GET api/goal-cycles/current/sadaqah-goals
 * Expected: { data: { cycleId, goals: [...] } }
 */
export function normalizeAllSadaqahGoalsResponse(
  axiosData: unknown,
): AllSadaqahGoalsResponse {
  const root = asRecord(axiosData);
  const payload = asRecord(root?.data) ?? root;

  if (!payload) return { goals: [] };

  if (Array.isArray(payload.goals)) {
    return {
      cycleId:
        typeof payload.cycleId === "string" ? payload.cycleId : undefined,
      goals: payload.goals as SadaqahGoalApiItem[],
    };
  }

  if (Array.isArray(root?.data)) {
    return { goals: root.data as SadaqahGoalApiItem[] };
  }

  return { goals: [] };
}

const getAllSadaqahGoals = async (): Promise<AllSadaqahGoalsResponse> => {
  const response = await api.get("api/goal-cycles/current/sadaqah-goals");
  return normalizeAllSadaqahGoalsResponse(response.data);
};

export const useGetAllSadaqahGoals = ({ enabled }: { enabled: boolean }) => {
  return useQuery({
    queryKey: ["all-sadaqah-goals"],
    queryFn: getAllSadaqahGoals,
    enabled,
  });
};
