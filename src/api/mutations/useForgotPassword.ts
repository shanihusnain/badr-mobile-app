import { useMutation } from "@tanstack/react-query";
import { api } from "../index";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

const forgotPassword = async (email: string) => {
  const response = await api.post("api/auth/forgot-password", { email });
  return response.data;
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data: { message?: string }) => {
      showToast("success", data?.message ?? "OTP sent successfully");
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to send reset instructions"),
      );
    },
  });
};
