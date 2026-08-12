import { useGoogleLogin } from "@/src/api/mutations/useGoogleLogin";
import { showToast } from "@/src/config/toastConfig";
import { useAuth } from "@/provider/useAuth";
import {
  mergeSocialLoginUser,
  needsSocialProfileCompletion,
} from "@/src/utils/needsSocialProfileCompletion";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

let isConfigured = false;

const getGoogleSignIn = () =>
  require("@react-native-google-signin/google-signin") as typeof import("@react-native-google-signin/google-signin");

const configureGoogleSignIn = () => {
  if (isConfigured || !webClientId) return;

  getGoogleSignIn().GoogleSignin.configure({
    webClientId,
    ...(iosClientId ? { iosClientId } : {}),
  });
  isConfigured = true;
};

export const useGoogleSignIn = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const { mutateAsync: googleLoginMutation, isPending: isExchanging } =
    useGoogleLogin();
  const [isPrompting, setIsPrompting] = useState(false);

  const signInWithGoogle = useCallback(async () => {
    if (isPrompting || isExchanging) return;

    if (!webClientId) {
      showToast("error", "Google Web client ID is not configured");
      return;
    }

    const {
      GoogleSignin,
      isErrorWithCode,
      isSuccessResponse,
      statusCodes,
    } = getGoogleSignIn();

    configureGoogleSignIn();

    try {
      setIsPrompting(true);

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        return;
      }

      const idToken = response.data.idToken;
      if (!idToken) {
        showToast("error", "Google did not return an ID token");
        return;
      }

      const result = await googleLoginMutation({ token: idToken });
      const {
        accessToken,
        refreshToken,
        user,
        isNewUser,
        calendarView,
        weekendDays,
      } = result.data;

      if (!accessToken) {
        showToast("error", "Login succeeded but no access token was returned");
        return;
      }

      const profileUser = mergeSocialLoginUser(
        (user ?? {}) as Record<string, unknown>,
        {
          calendarView:
            calendarView ??
            (user as { calendarView?: string } | undefined)?.calendarView,
          weekendDays:
            weekendDays ??
            (user as { weekendDays?: string[] } | undefined)?.weekendDays,
        },
      );

      await signIn(accessToken, refreshToken, profileUser);

      if (needsSocialProfileCompletion(profileUser, isNewUser)) {
        router.replace({
          pathname: "/(auth)/createaccount",
          params: {
            user: JSON.stringify(profileUser),
            calendarView: String(profileUser.calendarView ?? ""),
            weekendDays: JSON.stringify(profileUser.weekendDays ?? []),
          },
        });
        return;
      }

      router.replace("/(private)/greetingsscreen");
    } catch (error) {
      const { isErrorWithCode, statusCodes } = getGoogleSignIn();
      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) return;
        if (error.code === statusCodes.IN_PROGRESS) return;
        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          showToast("error", "Google Play Services is unavailable");
          return;
        }
      }

      console.error("[Google Login]", JSON.stringify(error, null, 2));
      showToast("error", "Unable to complete Google sign-in");
    } finally {
      setIsPrompting(false);
    }
  }, [googleLoginMutation, isExchanging, isPrompting, router, signIn]);

  return {
    signInWithGoogle,
    isReady: !!webClientId,
    isLoading: isPrompting || isExchanging,
  };
};
