import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import { CONNECT_HOME_QUERY_KEY } from "@/src/api/queries/useConnectHomeData";

export type CreateConnectTeamBody = {
  name: string;
  bannerKey: string;
  logoKey: string;
  metrics: string[];
};

export type CreateConnectTeamResponse = {
  id?: string;
  name?: string;
  bannerUrl?: string;
  logoUrl?: string;
  [key: string]: unknown;
};

const createConnectTeam = async (
  body: CreateConnectTeamBody,
): Promise<CreateConnectTeamResponse | null> => {
  const response = await api.post("api/connect/teams", body);
  return response.data?.data ?? response.data ?? null;
};

export const useCreateConnectTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConnectTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONNECT_HOME_QUERY_KEY });
    },
  });
};
