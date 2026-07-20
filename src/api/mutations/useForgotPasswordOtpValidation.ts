import { useMutation } from "@tanstack/react-query";
import { api } from "../index";
import { showToast } from "@/src/config/toastConfig";

const forgotPasswordOtpValidation = async (email: string, otp: string) => {
  try {
    const response = await api.post("api/auth/verify-otp", {
      email,
      code: otp,
    });

    return response.data;
  } catch (error: any) {
    console.log("error", error?.response?.data);
  }
};

export const useForgotPasswordOtpValidation = () => {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      forgotPasswordOtpValidation(email, otp),
    mutationKey: ["forgot-password-otp-validation"],
    onSuccess: (data: any) => {
      showToast("success", data?.message);
    },
    onError: (error: any) => {
      showToast("error", error?.response?.data?.message);
    },
  });
};
