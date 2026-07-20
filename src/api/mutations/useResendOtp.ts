import { useMutation } from "@tanstack/react-query";
import { api } from "../index";
import { showToast } from "@/src/config/toastConfig";

const resendOtp = async (email: string) => {
  const response = await api.post("api/auth/resend-otp", {
    email,
  });
  return response.data;
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: resendOtp,
    mutationKey: ["resend-otp"],
    onSuccess: (data: any) => {
      showToast("success", data?.message ?? "OTP resent");
    },
    onError: (error: any) => {
      showToast("error", error.response?.data?.message);
    },
  });
};
