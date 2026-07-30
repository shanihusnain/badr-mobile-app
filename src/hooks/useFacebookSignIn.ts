import { useFacebookLogin } from "@/src/api/mutations/useFacebookLogin";
import { showToast } from "@/src/config/toastConfig";
import { useAuth } from "@/provider/useAuth";
import { AccessToken, LoginManager } from "react-native-fbsdk-next";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";

export const useFacebookSignIn = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const { mutateAsync: facebookLoginMutation, isPending: isExchanging } =
    useFacebookLogin();
  const [isPrompting, setIsPrompting] = useState(false);

  const fbAppId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? "";
  // Enable "email" in Meta App Dashboard → Permissions before adding it here.
  const permissions = useMemo(() => ["public_profile"], []);

  const signInWithFacebook = useCallback(async () => {
    if (isPrompting || isExchanging) return;

    if (!fbAppId) {
      showToast(
        "error",
        "Facebook appID is not configured. Add EXPO_PUBLIC_FACEBOOK_APP_ID.",
      );
      return;
    }

    try {
      setIsPrompting(true);

      const loginResult = await LoginManager.logInWithPermissions(permissions);

      if (loginResult.isCancelled) {
        return;
      }

      const token = await AccessToken.getCurrentAccessToken();
      const fbAccessToken = token?.accessToken;

      if (!fbAccessToken) {
        showToast("error", "Facebook login succeeded but token is missing");
        return;
      }

      const result = await facebookLoginMutation({ token: fbAccessToken });
      const { accessToken, refreshToken, user, isNewUser } = result.data;

      if (!accessToken) {
        showToast("error", "Login succeeded but no access token was returned");
        return;
      }

      // Tokens are required so createaccount can call PUT /api/users/profile.
      await signIn(accessToken, refreshToken, user);

      if (isNewUser) {
        router.replace({
          pathname: "/(auth)/createaccount",
          params: { user: JSON.stringify(user) },
        });
        return;
      }

      router.replace("/(private)/greetingsscreen");
    } catch (error) {
      console.error("[Facebook Login]", error);
      if (!(error as { response?: unknown })?.response) {
        showToast("error", "Unable to complete Facebook sign-in");
      }
    } finally {
      setIsPrompting(false);
    }
  }, [
    facebookLoginMutation,
    fbAppId,
    isExchanging,
    isPrompting,
    permissions,
    router,
    signIn,
  ]);

  return {
    signInWithFacebook,
    isLoading: isPrompting || isExchanging,
  };
};
