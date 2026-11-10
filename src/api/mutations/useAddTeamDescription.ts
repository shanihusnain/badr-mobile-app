import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { CONNECT_HOME_QUERY_KEY } from "@/src/api/queries/useConnectHomeData";
import { connectTeamQueryKey } from "@/src/api/queries/useGetConnectTeam";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";

export type UpdateConnectTeamAboutPayload = {
  teamId: string;
  about: string;
};

const updateConnectTeamAbout = async ({
  teamId,
  about,
}: UpdateConnectTeamAboutPayload) => {
  const response = await api.patch(`api/connect/teams/${teamId}`, { about });
  return response.data;
};

export const useAddTeamDescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateConnectTeamAbout,
    onSuccess: async (data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: connectTeamQueryKey(variables.teamId),
        }),
        queryClient.invalidateQueries({ queryKey: CONNECT_HOME_QUERY_KEY }),
      ]);
      showToast("success", data?.message ?? "Team description updated");
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to update team description"),
      );
    },
  });
};
