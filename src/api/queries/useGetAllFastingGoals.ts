import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import type { FastingGoalApiItem } from "@/src/utils/fastingGoalMap";

export type AllFastingGoalsResponse = {
  cycleId?: string;
  goals: FastingGoalApiItem[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/**
 * Normalize GET api/goal-cycles/current/fasting-goals
 * Expected: { data: { cycleId, goals: [...] } }
 */
export function normalizeAllFastingGoalsResponse(
  axiosData: unknown,
): AllFastingGoalsResponse {
  const root = asRecord(axiosData);
  const payload = asRecord(root?.data) ?? root;

  if (!payload) return { goals: [] };

  if (Array.isArray(payload.goals)) {
    return {
      cycleId:
        typeof payload.cycleId === "string" ? payload.cycleId : undefined,
      goals: payload.goals as FastingGoalApiItem[],
    };
  }

  // Rare: bare goals array under data
  if (Array.isArray(root?.data)) {
    return { goals: root.data as FastingGoalApiItem[] };
  }

  return { goals: [] };
}

const getAllFastingGoals = async (): Promise<AllFastingGoalsResponse> => {
  const response = await api.get("api/goal-cycles/current/fasting-goals");
  return normalizeAllFastingGoalsResponse(response.data);
};

export const useGetAllFastingGoals = ({ enabled }: { enabled: boolean }) => {
  return useQuery({
    queryKey: ["all-fasting-goals"],
    queryFn: getAllFastingGoals,
    enabled,
  });
};
