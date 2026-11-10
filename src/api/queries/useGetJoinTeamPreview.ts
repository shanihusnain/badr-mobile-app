import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import type {
  ConnectTeamMediaAsset,
  ConnectTeamMember,
  ConnectTeamMetric,
} from "./useGetConnectTeam";

/** Unwrapped `data` from GET api/connect/teams/join/:code */
export type JoinTeamPreviewData = {
  id: string;
  name: string;
  about: string | null;
  banner: ConnectTeamMediaAsset;
  logo: ConnectTeamMediaAsset;
  metrics?: ConnectTeamMetric[];
  memberCount: number;
  members: ConnectTeamMember[];
  chatEnabled?: boolean;
  alreadyMember?: boolean;
};

export const joinTeamPreviewQueryKey = (code: string) =>
  ["connect", "teams", "join", "preview", code.trim().toUpperCase()] as const;

const getJoinTeamPreview = async (
  code: string,
): Promise<JoinTeamPreviewData | null> => {
  const response = await api.get(
    `api/connect/teams/join/${encodeURIComponent(code.trim())}`,
  );
  return response.data?.data ?? null;
};

export const useGetJoinTeamPreview = (code: string | null | undefined) => {
  const normalized = code?.trim() ?? "";

  return useQuery({
    queryKey: joinTeamPreviewQueryKey(normalized),
    queryFn: () => getJoinTeamPreview(normalized),
    enabled: normalized.length > 0,
  });
};
