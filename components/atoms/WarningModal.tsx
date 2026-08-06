import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";
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
}: WarningModalProps) {
  const handleBackdropPress = () => {
    if (onBackdropPress) onBackdropPress();
    else onPrimaryPress();
  };

  const hasMessage = message != null && message !== "" && message !== false;
  const showSecondaryButton = Boolean(secondaryButtonText);

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={handleBackdropPress}
    >
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.light.overlayBlackColor,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  modalContainer: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
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
    width: "40%",
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
