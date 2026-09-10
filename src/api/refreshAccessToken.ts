import {
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/src/storage/tokenStorage";
import axios from "axios";

export type RefreshTokenResponse = {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data: {
    accessToken: string;
    refreshToken?: string;
  };
};

/**
 * Refreshes the access token using a bare axios call (not the shared `api`
 * instance) so it never re-enters the 401 interceptor.
 */
export const refreshAccessToken = async (): Promise<string> => {
  const storedRefreshToken = await getRefreshToken();

  if (!storedRefreshToken) {
    throw new Error("No refresh token found");
  }

  const baseUrl = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/?$/, "/");

  const response = await axios.post<RefreshTokenResponse>(
    `${baseUrl}api/auth/refresh-token`,
    { refreshToken: storedRefreshToken },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
  );

  const accessToken = response.data?.data?.accessToken;
  const nextRefreshToken = response.data?.data?.refreshToken;

  if (!accessToken) {
    throw new Error("Refresh succeeded but no access token was returned");
  }

  await setAccessToken(accessToken);

  if (nextRefreshToken) {
    await setRefreshToken(nextRefreshToken);
  }

  return accessToken;
};
