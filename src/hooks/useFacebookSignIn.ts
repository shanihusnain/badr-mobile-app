import { showToast } from "@/src/config/toastConfig";
import { AccessToken, LoginManager } from "react-native-fbsdk-next";
import { useCallback, useMemo, useState } from "react";

export const useFacebookSignIn = () => {
  const [isPrompting, setIsPrompting] = useState(false);

  // These are required for react-native-fbsdk-next (plugin/native setup).
  // They are runtime checks only; the actual native wiring is done by the Expo config plugin.
  const fbAppId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? "";
  const permissions = useMemo(() => ["public_profile"], []);

  const signInWithFacebook = useCallback(async () => {
    if (isPrompting) return;

    if (!fbAppId) {
      showToast(
        "error",
        "Facebook appID is not configured. Add EXPO_PUBLIC_FACEBOOK_APP_ID.",
      );
      return;
    }

    try {
      setIsPrompting(true);
      console.log("[Facebook Login] Starting login flow");

      const loginResult = await LoginManager.logInWithPermissions(permissions);
      console.log("[Facebook Login] Redirect returned", {
        isCancelled: loginResult.isCancelled,
        grantedPermissions: loginResult.grantedPermissions,
        declinedPermissions: loginResult.declinedPermissions,
      });

      if (loginResult.isCancelled) {
        console.log("[Facebook Login] User cancelled before token retrieval");
        showToast("error", "Facebook login cancelled");
        return;
      }

      const token = await AccessToken.getCurrentAccessToken();
      const fbAccessToken = token?.accessToken;
      console.log("[Facebook Login] Access token lookup finished", {
        hasToken: !!fbAccessToken,
        userId: token?.userID,
        applicationId: token?.applicationID,
        expiresAt: token?.expirationTime,
      });

      if (!fbAccessToken) {
        console.log("[Facebook Login] Missing access token after redirect");
        showToast("error", "Facebook login succeeded but token is missing");
        return;
      }

      console.log("[Facebook Login] Facebook callback payload", {
        accessToken: fbAccessToken,
        tokenPreview: `${fbAccessToken.slice(0, 12)}...`,
        userId: token?.userID,
        applicationId: token?.applicationID,
        permissions: token?.permissions,
        declinedPermissions: token?.declinedPermissions,
        expiredPermissions: token?.expiredPermissions,
        expiresAt: token?.expirationTime,
      });
    } catch (error) {
      console.log("[Facebook Login] Flow failed", error);
      showToast("error", "Facebook login failed");
    } finally {
      console.log("[Facebook Login] Flow finished");
      setIsPrompting(false);
    }
  }, [permissions, fbAppId, isPrompting]);

  return {
    signInWithFacebook,
    isLoading: isPrompting,
  };
};
