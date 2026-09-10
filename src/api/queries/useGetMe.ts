import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export type MeUser = {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  country?: string | null;
  timezone?: string | null;
  locale?: string | null;
  role?: string;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string | null;
  fcmToken?: string | null;
  emailVerified?: boolean;
  isActive?: boolean;
  referralCodeId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  menstruationPeriodId?: string | null;
  goalCycleId?: string | null;
  hasSelectedAllGoals?: boolean;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Normalize GET api/users/me → user payload */
export function normalizeMeResponse(axiosData: unknown): MeUser | null {
  const root = asRecord(axiosData);
  const payload = asRecord(root?.data) ?? root;
  if (!payload || typeof payload.id !== "string") return null;
  return payload as unknown as MeUser;
}

const getMe = async (): Promise<MeUser | null> => {
  const response = await api.get("api/users/me");
  return normalizeMeResponse(response.data);
};

export const useGetMe = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: options?.enabled ?? true,
  });
};
