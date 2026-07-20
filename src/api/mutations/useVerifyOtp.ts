import { useMutation } from "@tanstack/react-query";
import { api } from "../index";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

export type VerifyOtpPayload = {
  otp: string;
  email: string;
};

const verifyOtp = async ({ otp, email }: VerifyOtpPayload) => {
  const response = await api.post("api/auth/verify-email", {
    code: otp,
    email,
  });

  return response.data;
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data: any) => {
      showToast("success", data?.message ?? "Email verified");
    },
    onError: (error: any) => {
      showToast("error", getApiErrorMessage(error, "Verification failed"));
    },
  });
};
