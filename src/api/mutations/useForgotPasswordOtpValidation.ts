import { useMutation } from "@tanstack/react-query";
import { api } from "../index";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

const forgotPasswordOtpValidation = async (email: string, otp: string) => {
  const response = await api.post("api/auth/verify-otp", {
    email,
    code: otp,
  });
  return response.data;
};

export const useForgotPasswordOtpValidation = () => {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      forgotPasswordOtpValidation(email, otp),
    mutationKey: ["forgot-password-otp-validation"],
    onSuccess: (data: { message?: string }) => {
      showToast("success", data?.message ?? "OTP verified");
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Invalid OTP. Please try again."),
      );
    },
  });
};
