import { useQuery } from "@tanstack/react-query";
import { api } from "../index";

export type GoalCycle = {
  id: string;
  startDate: string;
  endDate: string;
  // include other necessary fields if known, otherwise we only need dates
  [key: string]: any;
};

export type GoalCycleResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: GoalCycle;
};

const getGoalCycle = async (id: string): Promise<GoalCycleResponse> => {
  const response = await api.get(`api/goal-cycles/${id}`);
  return response.data;
};

export const useGetGoalCycle = (id?: string | null) => {
  return useQuery({
    queryKey: ["goalCycle", id],
    queryFn: () => getGoalCycle(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
