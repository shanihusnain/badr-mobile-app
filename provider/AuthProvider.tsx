import { loginSuccess, logout } from "@/src/store/authSlice";
import { registerForceSignOut } from "@/src/api/authSession";
import {
  clearAuthTokens,
  getAccessToken as getStoredAccessToken,
  getRefreshToken as getStoredRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/src/storage/tokenStorage";
import { store } from "@/src/store/store";
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
  updateUser: (userData: any) => Promise<void>;
  user: any | null;
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_DATA_KEY = "user_data";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const token = await getStoredAccessToken();
        const userData = await AsyncStorage.getItem(USER_DATA_KEY);

        if (token) {
          setIsAuthenticated(true);
          if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            store.dispatch(
              loginSuccess({ email: parsedUser.email ?? "" }),
            );
          } else {
            store.dispatch(loginSuccess({ email: "" }));
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
    await setAccessToken(accessToken);

    if (refreshToken) {
      await setRefreshToken(refreshToken);
    }

    if (userData) {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      setUser(userData);
      store.dispatch(loginSuccess({ email: userData.email ?? "" }));
    } else {
      store.dispatch(loginSuccess({ email: "" }));
    }

    setIsAuthenticated(true);
  };

  const getAccessToken = async () => {
    try {
      return await getStoredAccessToken();
    } catch (error) {
      console.error("Failed to get access token:", error);
      return null;
    }
  };

  const getRefreshToken = async () => {
    try {
      return await getStoredRefreshToken();
    } catch (error) {
      console.error("Failed to get refresh token:", error);
      return null;
    }
  };

  const signOut = async () => {
    await clearAuthTokens();
    await AsyncStorage.removeItem(USER_DATA_KEY);
    setIsAuthenticated(false);
    setUser(null);
    store.dispatch(logout());
  };

  const updateUser = async (userData: any) => {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    setUser(userData);
    store.dispatch(loginSuccess({ email: userData?.email ?? "" }));
  };

  useEffect(() => {
    registerForceSignOut(signOut);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading: loading,
        signIn,
        signOut,
        updateUser,
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
