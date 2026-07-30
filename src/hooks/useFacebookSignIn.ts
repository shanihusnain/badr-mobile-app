import { showToast } from "@/src/config/toastConfig";
// import { AccessToken, LoginManager } from "react-native-fbsdk-next";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

export const useFacebookSignIn = () => {
  const [isPrompting, setIsPrompting] = useState(false);

  // These are required for react-native-fbsdk-next (plugin/native setup).
  // They are runtime checks only; the actual native wiring is done by the Expo config plugin.
  const fbAppId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? "";
  const permissions = useMemo(() => ["public_profile"], []);

  const signInWithFacebook = useCallback(async () => {
    Alert.alert("Notice", "Facebook Sign-In is disabled in Expo Go. Please use a development build.");
  }, [permissions, fbAppId, isPrompting]);

  return {
    signInWithFacebook,
    isLoading: isPrompting,
  };
};
