import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ACCESS_TOKEN = "access_token";
const getBaseUrl = () => {
  return process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
};

const getAccessToken = async () => {
  try {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN);
    return token;
  } catch (error) {
    console.error("Failed to get access token:", error);
    return null;
  }
};
export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    console.log("Starting Request:", {
      url: config.url,
      baseURL: config.baseURL,
      method: config.method,
      headers: config.headers,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  },
);
