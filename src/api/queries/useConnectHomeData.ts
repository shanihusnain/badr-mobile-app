import { useQuery } from "@tanstack/react-query";
import { api } from "..";

/** `data.referral` from GET api/connect/home */
export type ConnectHomeReferral = {
  code: string;
  shareText: string;
  referredCount: number;
  monthsEarned: number;
};

export type ConnectHomeMediaAsset = {
  key: string;
  url: string;
};

export type ConnectHomeTeamMetric = {
  metric: string;
  label: string;
  category: string;
  categoryLabel: string;
};

export type ConnectHomeTeamRank = {
  position: number;
  ordinal: string;
  of: number;
  metric: ConnectHomeTeamMetric;
  period: "DAILY" | "WEEKLY" | "MONTHLY" | string;
  chipLabel: string;
};

/** Team card from GET api/connect/home — empty `teams: []` means no teams. */
export type ConnectHomeTeam = {
  id: string;
  name: string;
  logo: ConnectHomeMediaAsset;
  isAdmin: boolean;
  rank: ConnectHomeTeamRank;
};

/**
 * Learn-more item shape is not fully specified by backend yet.
 * Empty `learnMore: []` means hide the section.
 */
export type ConnectHomeLearnMoreItem = Record<string, unknown>;

/** Unwrapped `data` from GET api/connect/home */
export type ConnectHomeData = {
  referral: ConnectHomeReferral;
  teams: ConnectHomeTeam[];
  visibleTeamCount: number;
  learnMore: ConnectHomeLearnMoreItem[];
};

export const CONNECT_HOME_QUERY_KEY = ["connect-home-data"] as const;

const getHomeData = async (): Promise<ConnectHomeData | null> => {
  const response = await api.get("api/connect/home");
  return response.data?.data ?? null;
};

export const useConnectHomeData = () => {
  return useQuery({
    queryKey: CONNECT_HOME_QUERY_KEY,
    queryFn: getHomeData,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};
