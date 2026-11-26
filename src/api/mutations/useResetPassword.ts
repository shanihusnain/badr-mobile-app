import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { router } from "expo-router";
import { api } from "../index";
import { clearPendingPasswordReset } from "@/src/utils/pendingPasswordReset";

export type ResetPasswordPayload = {
  email: string;
  code: string;
  newPassword: string;
  confirmNewPassword: string;
  /** Where to go after success. Defaults to login (forgot-password flow). */
  redirectTo?: "login" | "myaccount" | "none";
};

const resetPassword = async (payload: ResetPasswordPayload) => {
  const response = await api.post("api/auth/reset-password", {
    email: payload.email,
    code: payload.code,
    newPassword: payload.newPassword,
    confirmNewPassword: payload.confirmNewPassword,
  });
  return { data: response.data, redirectTo: payload.redirectTo ?? "login" };
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
    mutationKey: ["reset-password"],
    onSuccess: (result) => {
      clearPendingPasswordReset();
      showToast(
        "success",
        result?.data?.message ?? "Password updated successfully",
      );
      if (result.redirectTo === "none") return;
      if (result.redirectTo === "myaccount") {
        router.replace("/(private)/myaccount");
        return;
      }
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 2000);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        console.log("[reset-password] error", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      showToast("error", getApiErrorMessage(error, "Password reset failed"));
    },
  });
};
