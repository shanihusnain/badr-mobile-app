import axios from "axios";
import { api } from "../index";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: string;
  country: string;
  calendarView?: "GREGORIAN" | "HIJRI";
  weekendDays?:
    | "FRIDAY_SATURDAY"
    | "SATURDAY_SUNDAY"
    | "FRIDAY_ONLY"
    | "SATURDAY_ONLY"
    | "SUNDAY_ONLY";
  avatarUrl?: string;
};

const registerUser = async (data: RegisterPayload) => {
  console.log("[register] payload", data);
  try {
    const response = await api.post("api/auth/register", data);
    console.log("[register] response", response.data);
    return response.data;
  } catch (error) {
    console.log("error", error);
    if (axios.isAxiosError(error)) {
      console.log(
        "errorerrorerrorerrorerrorerrorerrorerrorerrorerrorerrorerror",
        error?.response?.data?.message,
      );
      console.error("[register] axios error details", {
        message: error.message,
        code: error.code,
        baseURL: error.config?.baseURL,
        url: error.config?.url,
        method: error.config?.method,
        requestData: error.config?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        responseHeaders: error.response?.headers,
        isNetworkError:
          error.message === "Network Error" && error.response == null,
      });
    } else {
      console.error("[register] unknown error", error);
    }
    throw error;
  }
};

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
    mutationKey: ["register"],
    onError: (error) => {
      showToast("error", getApiErrorMessage(error, "Registration failed"));
    },
  });
};
