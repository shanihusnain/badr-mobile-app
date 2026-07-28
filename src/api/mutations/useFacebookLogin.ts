import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { useMutation } from "@tanstack/react-query";
import { api } from "../index";
import type { LoginResponse } from "./useLogin";

export type FacebookLoginPayload = {
  accessToken: string;
};

const facebookLogin = async ({
  accessToken,
}: FacebookLoginPayload): Promise<LoginResponse> => {
  // Backend must implement this endpoint and exchange the Facebook token
  // for your app's `accessToken`/`refreshToken`.
  const response = await api.post("api/auth/facebook", { accessToken });

  console.log("response", response.data);
  return response.data;
};

export const useFacebookLogin = () => {
  return useMutation({
    mutationFn: facebookLogin,
    mutationKey: ["facebookLogin"],
    onSuccess: (data) => {
      showToast("success", data?.message ?? "Login successful");
    },
    onError: (error) => {
      console.log("error", error);
      showToast("error", getApiErrorMessage(error, "Facebook login failed"));
    },
  });
};
