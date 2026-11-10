import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export type ConnectTeamMediaAsset = {
  key: string;
  url: string;
};

export type ConnectTeamMetric = {
  metric: string;
  label: string;
  category: string;
  categoryLabel: string;
};

export type ConnectTeamMember = {
  userId: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  role: string;
  isAdmin: boolean;
  isMe: boolean;
};

export type ConnectTeamMe = {
  role: string;
  isAdmin: boolean;
  displayMetric: string;
  displayPeriod: "DAILY" | "WEEKLY" | "MONTHLY" | string;
  notificationSetting: string;
};

export type ConnectTeamReferral = {
  code: string;
  shareText: string;
  referredCount: number;
  monthsEarned: number;
};

/** Unwrapped `data` from GET api/connect/teams/:teamId */
export type ConnectTeamDetail = {
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
  referral: ConnectTeamReferral;
};

export const connectTeamQueryKey = (teamId: string) =>
  ["connect", "teams", teamId] as const;

const getConnectTeam = async (
  teamId: string,
): Promise<ConnectTeamDetail | null> => {
  const response = await api.get(`api/connect/teams/${teamId}`);
  return response.data?.data ?? null;
};

export const useGetConnectTeam = (teamId: string | null | undefined) => {
  return useQuery({
    queryKey: connectTeamQueryKey(teamId ?? ""),
    queryFn: () => getConnectTeam(teamId!),
    enabled: Boolean(teamId),
  });
};
