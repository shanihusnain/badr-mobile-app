import { useGoogleLogin } from "@/src/api/mutations/useGoogleLogin";
import { showToast } from "@/src/config/toastConfig";
import { useAuth } from "@/provider/useAuth";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "";
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? webClientId;

export const useGoogleSignIn = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const { mutateAsync: googleLoginMutation, isPending: isExchanging } =
    useGoogleLogin();
  const [isPrompting, setIsPrompting] = useState(false);
  const handledResponseKey = useRef<string | null>(null);
  const redirectUri = AuthSession.makeRedirectUri({
    native: "https://auth.expo.io/@badr-islamic-app/badr",
  });

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId,
    androidClientId,
    iosClientId,
    redirectUri,
    selectAccount: true,
  });

  const completeSignIn = useCallback(
    async (idToken: string) => {
      const result = await googleLoginMutation({ idToken });
      const { accessToken, refreshToken, user } = result.data;

      if (!accessToken) {
        showToast("error", "Login succeeded but no access token was returned");
        return;
      }

      await signIn(accessToken, refreshToken, user);
      router.replace("/(private)/greetingsscreen");
    },
    [googleLoginMutation, router, signIn],
  );

  useEffect(() => {
    if (!response) return;

    if (response.type === "dismiss" || response.type === "cancel") {
      setIsPrompting(false);
      return;
    }

    if (response.type !== "success") {
      setIsPrompting(false);
      showToast("error", "Google sign-in was not completed");
      return;
    }

    const idToken =
      response.params.id_token ?? response.authentication?.idToken ?? "";

    const responseKey = idToken || JSON.stringify(response.params);
    if (handledResponseKey.current === responseKey) return;
    handledResponseKey.current = responseKey;

    if (!idToken) {
      setIsPrompting(false);
      showToast("error", "Google did not return an ID token");
      return;
    }

    void (async () => {
      try {
        await completeSignIn(idToken);
      } catch {
        // Toast handled in useGoogleLogin
      } finally {
        setIsPrompting(false);
      }
    })();
  }, [completeSignIn, response]);

  const signInWithGoogle = useCallback(async () => {
    if (isPrompting || isExchanging) return;

    if (Platform.OS === "android" && !androidClientId) {
      showToast("error", "Google Android client ID is not configured");
      return;
    }

    if (Platform.OS === "ios" && !iosClientId) {
      showToast("error", "Google iOS client ID is not configured");
      return;
    }

    if (!webClientId && !androidClientId && !iosClientId) {
      showToast("error", "Google client IDs are not configured");
      return;
    }

    if (!request) {
      showToast("error", "Google sign-in is still loading. Try again.");
      return;
    }

    try {
      setIsPrompting(true);
      handledResponseKey.current = null;
      await promptAsync();
    } catch {
      setIsPrompting(false);
      showToast("error", "Unable to open Google sign-in");
    }
  }, [isExchanging, isPrompting, promptAsync, request]);

  return {
    signInWithGoogle,
    isReady: !!request,
    isLoading: isPrompting || isExchanging,
  };
};
