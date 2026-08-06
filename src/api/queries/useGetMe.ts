import { useQuery } from "@tanstack/react-query";
import { api } from "../index";

export type UserMeResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    id: string;
    email: string;
    menstruationPeriodId?: string | null;
    [key: string]: any;
  };
};

const getMe = async (): Promise<UserMeResponse> => {
  const response = await api.get("api/users/me");
  return response.data;
};

export const useGetMe = () => {
  return useQuery({
    queryKey: ["getMe"],
    queryFn: getMe,
    staleTime: 0,          // Always treat data as stale so it refetches on mount
    refetchOnMount: true,
  });
};
