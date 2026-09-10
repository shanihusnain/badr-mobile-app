import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import { refreshAccessToken } from "@/src/api/refreshAccessToken";
import { useMutation } from "@tanstack/react-query";

export { refreshAccessToken } from "@/src/api/refreshAccessToken";

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: refreshAccessToken,
    mutationKey: ["refresh-token"],
    onSuccess: () => {
      showToast("success", "Session refreshed");
    },
    onError: (error) => {
      showToast("error", getApiErrorMessage(error, "Session refresh failed"));
    },
  });
};
