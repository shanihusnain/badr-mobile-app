import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export type ConnectTeamLeaderboardMetric = {
  metric: string;
  label: string;
  category?: string;
  categoryLabel?: string;
};

export type ConnectTeamLeaderboardMember = {
  userId: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  rank: number;
  ordinal: string;
  score: number;
  isMe?: boolean;
  isAdmin?: boolean;
};

/** Unwrapped `data` from GET api/connect/teams/:teamId/leaderboard */
export type ConnectTeamLeaderboardData = {
  metric: ConnectTeamLeaderboardMetric;
  period: "DAILY" | "WEEKLY" | "MONTHLY" | string;
  periodLabel?: string;
  total: number;
  totalLabel?: string;
  lastUpdated?: string;
  range?: {
    from: string;
    to?: string;
  };
  metrics: ConnectTeamLeaderboardMetric[];
  members: ConnectTeamLeaderboardMember[];
};

export type ConnectTeamLeaderboardParams = {
  teamId: string;
  metric?: string | null;
  period?: string | null;
};

export const connectTeamLeaderboardQueryKey = ({
  teamId,
  metric,
  period,
}: ConnectTeamLeaderboardParams) =>
  ["connect", "teams", teamId, "leaderboard", metric ?? null, period ?? null] as const;

const getConnectTeamLeaderboard = async ({
  teamId,
  metric,
  period,
}: ConnectTeamLeaderboardParams): Promise<ConnectTeamLeaderboardData | null> => {
  const response = await api.get(`api/connect/teams/${teamId}/leaderboard`, {
    params: {
      ...(metric ? { metric } : null),
      ...(period ? { period } : null),
    },
  });
  return response.data?.data ?? null;
};

export const useGetConnectTeamLeaderboard = (
  params: ConnectTeamLeaderboardParams | null,
) => {
  return useQuery({
    queryKey: connectTeamLeaderboardQueryKey(
      params ?? { teamId: "", metric: null, period: null },
    ),
    queryFn: () => getConnectTeamLeaderboard(params!),
    enabled: Boolean(params?.teamId),
  });
};
