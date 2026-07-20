import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { getRefreshToken } from "@/src/storage/tokenStorage";
import { useMutation } from "@tanstack/react-query";
import { api } from "..";

const logout = async () => {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  const response = await api.post("api/auth/logout", {
    refreshToken,
  });

  return response.data;
};

export const useLogout = () => {
  return useMutation({
    mutationFn: logout,
    mutationKey: ["logout"],
    onSuccess: (data: any) => {
      showToast("success", data?.message ?? "Logged out successfully");
    },
    onError: (error) => {
      showToast("error", getApiErrorMessage(error, "Logout failed"));
    },
  });
};
