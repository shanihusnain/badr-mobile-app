import { api } from "../index";
import { useMutation } from "@tanstack/react-query";
import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";

export type UploadAvatarPayload = {
  userId: string;
  imageUri: string;
};

export type UploadAvatarResponse = {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: {
    user?: {
      id?: string;
      username?: string;
      email?: string;
      avatarUrl?: string;
    };
    avatarUrl?: string;
    url?: string;
  };
  avatarUrl?: string;
};

const getFileMeta = (imageUri: string) => {
  const withoutQuery = imageUri.split("?")[0] ?? imageUri;
  const rawName = withoutQuery.split("/").pop() || "avatar.jpg";
  const filename = rawName.includes(".") ? rawName : `${rawName}.jpg`;
  const extension = filename.split(".").pop()?.toLowerCase() || "jpg";
  const type =
    extension === "jpg" || extension === "jpeg"
      ? "image/jpeg"
      : `image/${extension}`;

  return { filename, type };
};

const uploadAvatar = async (
  data: UploadAvatarPayload,
): Promise<UploadAvatarResponse> => {
  const isLocalFile =
    data.imageUri.startsWith("file:") || data.imageUri.startsWith("content:");

  if (!isLocalFile) {
    throw new Error("Avatar upload requires a local image file");
  }

  const formData = new FormData();
  formData.append("userId", data.userId);

  const { filename, type } = getFileMeta(data.imageUri);
  formData.append("file", {
    uri: data.imageUri,
    name: filename,
    type,
  } as unknown as Blob);

  const response = await api.post("api/users/avatar", formData, {
    headers: {
      // Override instance default application/json; RN will add boundary.
      "Content-Type": "multipart/form-data",
    },
    transformRequest: (body) => body,
  });

  return response.data;
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
