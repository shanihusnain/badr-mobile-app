import { useGoogleLogin } from "@/src/api/mutations/useGoogleLogin";
import { showToast } from "@/src/config/toastConfig";
import { useAuth } from "@/provider/useAuth";
// import {
//   GoogleSignin,
//   isErrorWithCode,
//   isSuccessResponse,
//   statusCodes,
// } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

let isConfigured = false;

const configureGoogleSignIn = () => {
  if (isConfigured || !webClientId) return;

  // GoogleSignin.configure({
  //   webClientId,
  //   ...(iosClientId ? { iosClientId } : {}),
  // });
  isConfigured = true;
};

export const useGoogleSignIn = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const { mutateAsync: googleLoginMutation, isPending: isExchanging } =
    useGoogleLogin();
  const [isPrompting, setIsPrompting] = useState(false);

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    Alert.alert("Notice", "Google Sign-In is disabled in Expo Go. Please use a development build.");
  }, [googleLoginMutation, isExchanging, isPrompting, router, signIn]);

  return {
    signInWithGoogle,
    isReady: !!webClientId,
    isLoading: isPrompting || isExchanging,
  };
};
