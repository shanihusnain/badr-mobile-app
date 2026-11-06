import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import type { DashboardApiTab } from "@/src/api/queries/useGetDataForDashboardCustomisation";

type RemoveHomeDashboardWidgetParams = {
  key: string;
  tab: DashboardApiTab | string;
};

const removeHomeDashboardWidget = async ({
  key,
  tab,
}: RemoveHomeDashboardWidgetParams) => {
  const response = await api.delete(`api/home/dashboard/widgets/${key}`, {
    params: { tab },
  });
  return response.data;
};

export const useRemoveHomeDashboardWidget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeHomeDashboardWidget,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["home", "dashboard", "customize"],
      });
      queryClient.invalidateQueries({ queryKey: ["home", "dashboard"] });
    },
  });
};
