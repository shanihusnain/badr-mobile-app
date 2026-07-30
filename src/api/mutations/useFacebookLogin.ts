import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { useMutation } from "@tanstack/react-query";
import { api } from "../index";
import type { LoginResponse } from "./useLogin";

export type FacebookLoginPayload = {
  token: string;
  fcmToken?: string;
};

const facebookLogin = async ({
  token,
  fcmToken,
}: FacebookLoginPayload): Promise<LoginResponse> => {
  const response = await api.post("api/auth/social-login", {
    provider: "FACEBOOK",
    token,
    ...(fcmToken ? { fcmToken } : {}),
  });
  console.log("response", JSON.stringify(response.data, null, 2));
  return response.data;
};

export const useFacebookLogin = () => {
  return useMutation({
    mutationFn: facebookLogin,
    mutationKey: ["facebookLogin"],
    onSuccess: (data) => {
      showToast("success", data?.message ?? "Logged in successfully");
    },
    onError: (error) => {
      console.log("error", JSON.stringify(error, null, 2));
      showToast("error", getApiErrorMessage(error, "Facebook login failed"));
    },
  });
};
