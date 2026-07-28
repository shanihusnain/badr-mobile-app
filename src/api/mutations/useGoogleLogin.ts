import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { useMutation } from "@tanstack/react-query";
import { api } from "../index";
import type { LoginResponse } from "./useLogin";

export type GoogleLoginPayload = {
  token: string;
  fcmToken?: string;
};

const googleLogin = async ({
  token,
  fcmToken,
}: GoogleLoginPayload): Promise<LoginResponse> => {
  const response = await api.post("api/auth/social-login", {
    provider: "GOOGLE",
    token,
    ...(fcmToken ? { fcmToken } : {}),
  });
  return response.data;
};

export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: googleLogin,
    mutationKey: ["googleLogin"],
    onSuccess: (data) => {
      showToast("success", data?.message ?? "Logged in successfully");
    },
    onError: (error) => {
      showToast("error", getApiErrorMessage(error, "Google login failed"));
    },
  });
};
