import { useMutation } from "@tanstack/react-query";
import { api } from "../index";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

export type VerifyOtpPayload = {
  otp: string;
  email: string;
};

const verifyOtp = async ({ otp, email }: VerifyOtpPayload) => {
  console.log("otp", otp);
  console.log("email", email);
  const response = await api.post("api/auth/verify-email", {
    code: otp,
    email,
  });
  console.log(
    "response.data of the verify otp",
    JSON.stringify(response.data, null, 2),
  );
  return response.data;
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data: any) => {
      showToast("success", data?.message ?? "Email verified");
    },
    onError: (error: any) => {
      console.log("error", error?.response);
      showToast("error", getApiErrorMessage(error, "Verification failed"));
    },
  });
};
