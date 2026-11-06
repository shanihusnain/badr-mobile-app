import { useQuery } from "@tanstack/react-query";
import { api } from "..";

/** `data.referral` from GET api/connect/home */
export type ConnectHomeReferral = {
  code: string;
  shareText: string;
  referredCount: number;
  monthsEarned: number;
};

/**
 * Team card shape is not fully specified by backend yet.
 * Empty `teams: []` means the user has no teams.
 */
export type ConnectHomeTeam = Record<string, unknown>;

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
  });
};
