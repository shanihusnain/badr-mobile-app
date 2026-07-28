import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Alert, View } from "react-native";
import {
  AppleIcon,
  FacebookIcon,
  GoogleIcon,
} from "@/assets/icons";
import { useFacebookSignIn } from "@/src/hooks/useFacebookSignIn";
import { useGoogleSignIn } from "@/src/hooks/useGoogleSignIn";
import { styles } from "../style";
import { SocialLoginButton } from "./SocialLoginButton";

type Props = {
  disabled?: boolean;
};

class SocialAuthErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.log("[SocialAuth] Failed to render social login", error, info);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

function SocialAuthButtons({ disabled = false }: Props) {
  const { signInWithGoogle, isLoading: googleLoading } = useGoogleSignIn();
  const { signInWithFacebook, isLoading: facebookLoading } =
    useFacebookSignIn();

  const isBusy = disabled || googleLoading || facebookLoading;

  return (
    <View style={styles.socialLoginButtonsContainer}>
      <SocialLoginButton
        icon={<FacebookIcon />}
        onPress={() => {
          void signInWithFacebook();
        }}
        disabled={isBusy}
      />
      <SocialLoginButton
        icon={<GoogleIcon />}
        onPress={() => {
          void signInWithGoogle();
        }}
        disabled={isBusy}
      />
      <SocialLoginButton
        icon={<AppleIcon />}
        onPress={() => {
          Alert.alert("Apple");
        }}
        disabled={isBusy}
      />
    </View>
  );
}

export function SocialAuthSection({ disabled = false }: Props) {
  return (
    <SocialAuthErrorBoundary>
      <SocialAuthButtons disabled={disabled} />
    </SocialAuthErrorBoundary>
  );
}
