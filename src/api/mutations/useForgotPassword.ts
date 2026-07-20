import { useMutation } from "@tanstack/react-query";
import { api } from "../index";
import { showToast } from "@/src/config/toastConfig";

const forgotPassword = async (email: string) => {
  try {
    const response = await api.post("api/auth/forgot-password", {
      email,
    });
    return response.data;
  } catch (error: any) {
    console.log("error", error?.response?.data);
  }
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data: any) => {
      showToast("success", data?.message);
    },
    onError: (error: any) => {
      showToast("error", error?.response?.data?.message);
    },
  });
};
