import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (
    accessToken: string,
    refreshToken?: string,
    userData?: any,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  user: any | null;
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const ACCESS_TOKEN = "access_token";
const REFRESH_TOKEN = "refresh_token";
const USER_DATA_KEY = "user_data";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem(ACCESS_TOKEN);
        const userData = await AsyncStorage.getItem(USER_DATA_KEY);

        if (token) {
          setIsAuthenticated(true);
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      } catch (error) {
        console.error("Failed to load auth state", error);
      } finally {
        setLoading(false);
      }
    };
    loadAuthState();
  }, []);

  const signIn = async (
    accessToken: string,
    refreshToken?: string,
    userData?: any,
  ) => {
    // Strip "Bearer " prefix if present
    const cleanAccessToken = accessToken.replace(/^Bearer\s+/i, "");
    const cleanRefreshToken = refreshToken?.replace(/^Bearer\s+/i, "");

    await AsyncStorage.setItem(ACCESS_TOKEN, cleanAccessToken);

    if (cleanRefreshToken) {
      await AsyncStorage.setItem(REFRESH_TOKEN, cleanRefreshToken);
    }

    if (userData) {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      setUser(userData);
    }

    setIsAuthenticated(true);
  };

  const getAccessToken = async () => {
    try {
      return await AsyncStorage.getItem(ACCESS_TOKEN);
    } catch (error) {
      console.error("Failed to get access token:", error);
      return null;
    }
  };

  const getRefreshToken = async () => {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN);
    } catch (error) {
      console.error("Failed to get refresh token:", error);
      return null;
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(ACCESS_TOKEN);
    await AsyncStorage.removeItem(REFRESH_TOKEN);
    await AsyncStorage.removeItem(USER_DATA_KEY);
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading: loading,
        signIn,
        signOut,
        user,
        getAccessToken,
        getRefreshToken,
      }}
    >
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export { AuthContext };
