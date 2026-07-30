import axios from "axios";
import { api } from "../index";
import { useMutation } from "@tanstack/react-query";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

export type UploadAvatarPayload = {
  userId: string;
  imageUri: string;
};

const uploadAvatar = async (data: UploadAvatarPayload) => {
  console.log("[uploadAvatar] payload", data);
  const formData = new FormData();
  formData.append("userId", data.userId);

  // In React Native, FormData expects an object with uri, name, and type for files
  const filename = data.imageUri.split("/").pop() || "avatar.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image`;

  formData.append("file", {
    uri: data.imageUri,
    name: filename,
    type,
  } as any);
console.log("form data", formData);
  try {
    const response = await api.post("api/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("[uploadAvatar] response", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("[uploadAvatar] axios error details", error.response?.data);
    }
    throw error;
  }
};

export const useUploadAvatar = () => {
  return useMutation({
    mutationFn: uploadAvatar,
    mutationKey: ["uploadAvatar"],
    onError: (error) => {
      showToast("error", getApiErrorMessage(error, "Avatar upload failed"));
    },
  });
};
