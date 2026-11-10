import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { CONNECT_HOME_QUERY_KEY } from "@/src/api/queries/useConnectHomeData";
import { connectTeamQueryKey } from "@/src/api/queries/useGetConnectTeam";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";

export type UpdateConnectTeamMeBody = {
  displayMetric: string;
  displayPeriod: "DAILY" | "WEEKLY" | "MONTHLY" | string;
};

export type UpdateConnectTeamMePayload = {
  teamId: string;
  body: UpdateConnectTeamMeBody;
};

const updateConnectTeamMe = async ({
  teamId,
  body,
}: UpdateConnectTeamMePayload) => {
  const response = await api.patch(`api/connect/teams/${teamId}/me`, body);
  return response.data;
};

export const useUpdateConnectTeamMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateConnectTeamMe,
    onSuccess: async (data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CONNECT_HOME_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: connectTeamQueryKey(variables.teamId),
        }),
      ]);
      showToast("success", data?.message ?? "Display rank updated");
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to update display rank"),
      );
    },
  });
};
