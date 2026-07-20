import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

const LEGACY_ACCESS_TOKEN_KEY = "access_token";
const LEGACY_REFRESH_TOKEN_KEY = "refresh_token";

const isWeb = Platform.OS === "web";

async function getSecureItem(key: string): Promise<string | null> {
  if (isWeb) {
    return AsyncStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function setSecureItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function deleteSecureItem(key: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

async function migrateLegacyToken(
  legacyKey: string,
  secureKey: string,
): Promise<string | null> {
  const legacyValue = await AsyncStorage.getItem(legacyKey);
  if (!legacyValue) return null;

  await setSecureItem(secureKey, legacyValue);
  await AsyncStorage.removeItem(legacyKey);
  return legacyValue;
}

export async function getAccessToken(): Promise<string | null> {
  try {
    const token = await getSecureItem(ACCESS_TOKEN_KEY);
    if (token) return token;

    return migrateLegacyToken(LEGACY_ACCESS_TOKEN_KEY, ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to get access token:", error);
    return null;
  }
}

export async function setAccessToken(token: string): Promise<void> {
  const cleanToken = token.replace(/^Bearer\s+/i, "");
  await setSecureItem(ACCESS_TOKEN_KEY, cleanToken);
  await AsyncStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    const token = await getSecureItem(REFRESH_TOKEN_KEY);
    if (token) return token;

    return migrateLegacyToken(LEGACY_REFRESH_TOKEN_KEY, REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to get refresh token:", error);
    return null;
  }
}

export async function setRefreshToken(token: string): Promise<void> {
  const cleanToken = token.replace(/^Bearer\s+/i, "");
  await setSecureItem(REFRESH_TOKEN_KEY, cleanToken);
  await AsyncStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
}

export async function clearAuthTokens(): Promise<void> {
  await deleteSecureItem(ACCESS_TOKEN_KEY);
  await deleteSecureItem(REFRESH_TOKEN_KEY);
  await AsyncStorage.multiRemove([
    LEGACY_ACCESS_TOKEN_KEY,
    LEGACY_REFRESH_TOKEN_KEY,
  ]);
}
