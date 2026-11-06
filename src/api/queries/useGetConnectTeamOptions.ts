import { useQuery } from "@tanstack/react-query";
import { api } from "..";

/** Media asset from GET api/connect/teams/options */
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

export type ConnectTeamMetricCategory = {
  category: string;
  label: string;
  metrics: ConnectTeamMetric[];
};

export type ConnectTeamPeriod = {
  period: string;
  option: string;
  tab: string;
  chip: string;
};

/** Unwrapped `data` from GET api/connect/teams/options */
export type ConnectTeamOptionsData = {
  banners: ConnectTeamMediaAsset[];
  logos: ConnectTeamMediaAsset[];
  maxMetricsPerCategory: number;
  metricCategories: ConnectTeamMetricCategory[];
  periods: ConnectTeamPeriod[];
};

export const CONNECT_TEAM_OPTIONS_QUERY_KEY = [
  "connect",
  "teams",
  "options",
] as const;

const getConnectTeamOptions =
  async (): Promise<ConnectTeamOptionsData | null> => {
    const response = await api.get("api/connect/teams/options");
    return response.data?.data ?? null;
  };

export const useGetConnectTeamOptions = () => {
  return useQuery({
    queryKey: CONNECT_TEAM_OPTIONS_QUERY_KEY,
    queryFn: getConnectTeamOptions,
  });
};
