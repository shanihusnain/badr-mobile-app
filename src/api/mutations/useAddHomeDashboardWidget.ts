import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import type { DashboardApiTab } from "@/src/api/queries/useGetDataForDashboardCustomisation";

type AddHomeDashboardWidgetParams = {
  key: string;
  tab: DashboardApiTab | string;
};

const addHomeDashboardWidget = async ({
  key,
  tab,
}: AddHomeDashboardWidgetParams) => {
  const response = await api.post(
    `api/home/dashboard/widgets/${key}`,
    {},
    {
      params: { tab },
    },
  );
  return response.data;
};

export const useAddHomeDashboardWidget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addHomeDashboardWidget,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["home", "dashboard", "customize"],
      });
      queryClient.invalidateQueries({ queryKey: ["home", "dashboard"] });
    },
  });
};
