import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { CONNECT_HOME_QUERY_KEY } from "@/src/api/queries/useConnectHomeData";
import {
  connectTeamQueryKey,
  type ConnectTeamDetail,
  type ConnectTeamMediaAsset,
  type ConnectTeamMe,
  type ConnectTeamMember,
  type ConnectTeamMetric,
  type ConnectTeamReferral,
} from "@/src/api/queries/useGetConnectTeam";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";

/** Unwrapped `data` from POST api/connect/teams/join */
export type JoinTeamResponseData = {
  id: string;
  name: string;
  about: string | null;
  banner: ConnectTeamMediaAsset;
  logo: ConnectTeamMediaAsset;
  metrics: ConnectTeamMetric[];
  memberCount: number;
  members: ConnectTeamMember[];
  chatEnabled: boolean;
  inviteCode: string;
  inviteShareText: string;
  me: ConnectTeamMe;
  referral?: ConnectTeamReferral;
};

export type JoinTeamWithCodeResponse = {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: JoinTeamResponseData | null;
};

const joinTeamWithCode = async (
  code: string,
): Promise<JoinTeamWithCodeResponse> => {
  const response = await api.post(`api/connect/teams/join`, {
    code: code.trim(),
  });
  return response.data;
};

export const useJoinTeamWithCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinTeamWithCode,
    onSuccess: async (response) => {
      const team = response.data;
      if (team?.id) {
        queryClient.setQueryData(
          connectTeamQueryKey(team.id),
          team as ConnectTeamDetail,
        );
        await queryClient.invalidateQueries({
          queryKey: connectTeamQueryKey(team.id),
        });
      }
      await queryClient.invalidateQueries({ queryKey: CONNECT_HOME_QUERY_KEY });
      showToast("success", response.message ?? "Joined team");
    },
    onError: (error) => {
      showToast("error", getApiErrorMessage(error, "Failed to join team"));
    },
  });
};
