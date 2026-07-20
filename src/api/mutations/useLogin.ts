import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { useMutation } from "@tanstack/react-query";
import { api } from "../index";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginUser = {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  country: string;
  dateOfBirth: string;
  gender: string;
  emailVerified: boolean;
  subscriptionStatus: string;
  createdAt: string;
};

export type LoginAuthData = {
  accessToken: string;
  refreshToken: string;
  user: LoginUser;
};

export type LoginResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: LoginAuthData;
};

const login = async ({
  email,
  password,
}: LoginPayload): Promise<LoginResponse> => {
  const response = await api.post("api/auth/login", {
    email,
    password,
  });
  return response.data;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
    mutationKey: ["login"],
    onSuccess: (data) => {
      showToast("success", data?.message ?? "Login successful");
    },
    onError: (error) => {
      showToast("error", getApiErrorMessage(error, "Login failed"));
    },
  });
};
