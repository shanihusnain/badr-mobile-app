import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { useMutation } from "@tanstack/react-query";
import { api } from "../index";

/** Full profile update (create-account) and partial updates (e.g. change email). */
export type UpdateProfilePayload = {
  userId?: string;
  username?: string;
  email?: string;
  gender?: "MALE" | "FEMALE";
  dob?: string;
  country?: string;
  preferredDateView?: "GREGORIAN" | "HIJRI";
  weekendDays?: Array<"FRIDAY" | "SATURDAY" | "SUNDAY">;
};

export type UpdateProfileUser = {
  email?: string;
  [key: string]: unknown;
};

export type UpdateProfileResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data?: {
    user?: UpdateProfileUser;
    [key: string]: unknown;
  };
};

const updateProfile = async (
  payload: UpdateProfilePayload,
): Promise<UpdateProfileResponse> => {
  const body = { ...payload };
  if (typeof body.email === "string") {
    body.email = body.email.trim().toLowerCase();
  }
  const response = await api.put("api/users/profile", body);
  return response.data;
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: updateProfile,
    mutationKey: ["updateProfile"],
    onSuccess: (data) => {
      showToast("success", data?.message ?? "Profile updated successfully");
    },
    onError: (error) => {
      showToast("error", getApiErrorMessage(error, "Failed to update profile"));
    },
  });
};
