import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { router } from "expo-router";
import { api } from "../index";

export type ResetPasswordPayload = {
  email: string;
  code: string;
  newPassword: string;
  confirmNewPassword: string;
};

const resetPassword = async (payload: ResetPasswordPayload) => {
  console.log("[reset-password] payload", payload);
  try {
    const response = await api.post("api/auth/reset-password", {
      email: payload.email,
      code: payload.code,
      newPassword: payload.newPassword,
      confirmNewPassword: payload.confirmNewPassword,
    });
    console.log("[reset-password] response", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("[reset-password] error", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.log("[reset-password] error", error);
    }
    throw error; // must rethrow or React Query treats this as success
  }
};

export const useResetPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetPassword,
    mutationKey: ["reset-password"],
    onSuccess: (data: any) => {
      showToast("success", data?.message ?? "Password updated successfully");
      router.replace("/(auth)/login");
    },
    onError: (error) => {
      showToast("error", getApiErrorMessage(error, "Password reset failed"));
    },
  });
};
