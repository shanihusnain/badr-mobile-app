import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { useMutation } from "@tanstack/react-query";
import { api } from "../index";
import type { LoginResponse } from "./useLogin";

export type GoogleLoginPayload = {
  idToken: string;
};

const googleLogin = async ({
  idToken,
}: GoogleLoginPayload): Promise<LoginResponse> => {
  const response = await api.post("api/auth/google", {
    idToken,
  });
  return response.data;
};

export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: googleLogin,
    mutationKey: ["googleLogin"],
    onSuccess: (data) => {
      showToast("success", data?.message ?? "Login successful");
    },
    onError: (error) => {
      showToast("error", getApiErrorMessage(error, "Google login failed"));
    },
  });
};
