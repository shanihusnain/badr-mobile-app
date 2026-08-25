import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Platform,
  Pressable,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";
import { FullWindowOverlay } from "react-native-screens";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import SecondaryButton from "./Secondary-button";

type WarningModalProps = {
  visible: boolean;
  title: string;
  message?: React.ReactNode;
  primaryButtonText?: string;
  /** Omit or pass null/empty to hide the secondary text button (single-action modal). */
  secondaryButtonText?: string | null;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  onBackdropPress?: () => void;
  /** Optional overrides — defaults keep existing WarningModal look elsewhere. */
  primaryButtonStyle?: StyleProp<ViewStyle>;
  primaryButtonTextStyle?: StyleProp<TextStyle>;
  secondaryButtonTextStyle?: StyleProp<TextStyle>;
  primaryButtonVariant?: "white" | "green";
  /** Defaults to compact so modal bordered CTAs stay shorter than app-wide SecondaryButtons. */
  primaryButtonSize?: "default" | "compact" | "modal";
};

export default function WarningModal({
  visible,
  title,
  message,
  primaryButtonText = "Keep Membership",
  secondaryButtonText = "Confirm Cancellation",
  onPrimaryPress,
  onSecondaryPress,
  onBackdropPress,
  primaryButtonStyle,
  primaryButtonTextStyle,
  secondaryButtonTextStyle,
  primaryButtonVariant = "green",
  primaryButtonSize = "compact",
}: WarningModalProps) {
  const handleBackdropPress = () => {
    if (onBackdropPress) onBackdropPress();
    else onPrimaryPress();
  };

  const hasMessage = message != null && message !== "" && message !== false;
  const showSecondaryButton = Boolean(secondaryButtonText);

  if (!visible) return null;

  const body = (
    <Pressable style={styles.overlay} onPress={handleBackdropPress}>
      <Pressable
        style={styles.modalContainer}
        onPress={(e) => e.stopPropagation()}
      >
        <Text style={[styles.title, !hasMessage && styles.titleOnly]}>
          {title}
        </Text>
        {hasMessage ? (
          <View style={styles.messageContainer}>
            {typeof message === "string" ? (
              <Text style={styles.message}>{message}</Text>
            ) : (
              message
            )}
          </View>
        ) : null}

        <View style={styles.buttonContainer}>
          <SecondaryButton
            text={primaryButtonText}
            onPress={onPrimaryPress}
            variant={primaryButtonVariant}
            size={primaryButtonSize}
            style={primaryButtonStyle}
            textStyle={primaryButtonTextStyle}
          />
          {showSecondaryButton ? (
            <Pressable
              style={styles.secondaryButton}
              onPress={onSecondaryPress}
            >
              <Text
                style={[styles.secondaryButtonText, secondaryButtonTextStyle]}
              >
                {secondaryButtonText}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </Pressable>
    </Pressable>
  );

  // Goal planner (and similar) host sheets in FullWindowOverlay on iOS.
  // RN Modal presents below that overlay, so warnings must use the same layer.
  if (Platform.OS === "ios") {
    return (
      <FullWindowOverlay>
        <View style={styles.iosOverlayRoot}>{body}</View>
      </FullWindowOverlay>
    );
  }

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={handleBackdropPress}
    >
      {body}
    </Modal>
  );
}

const styles = StyleSheet.create({
  iosOverlayRoot: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.light.overlayBlackColor,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  modalContainer: {
    backgroundColor: Colors.light.darkgrey,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 30,
    width: "100%",
  },
  title: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
    textTransform: "uppercase",
    lineHeight: 22,
  },
  titleOnly: {
    marginBottom: 24,
  },
  messageContainer: {
    marginBottom: 24,
  },
  message: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 12,
    width: "50%",
    alignSelf: "center",
  },
  secondaryButton: {
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
  },
});
