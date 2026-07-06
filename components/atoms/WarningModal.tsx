import React from "react";
import { View, Text, StyleSheet, Modal, Pressable } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import SecondaryButton from "./Secondary-button";

type WarningModalProps = {
  visible: boolean;
  title: string;
  message: React.ReactNode;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
  onBackdropPress?: () => void;
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
}: WarningModalProps) {
  const handleBackdropPress = () => {
    if (onBackdropPress) onBackdropPress();
    else onPrimaryPress(); // Default to primary (keep/cancel) action
  };

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
          <Text style={styles.title}>{title}</Text>
          <View style={styles.messageContainer}>
            {typeof message === "string" ? (
              <Text style={styles.message}>{message}</Text>
            ) : (
              message
            )}
          </View>

          <View style={styles.buttonContainer}>
            <SecondaryButton
              text={primaryButtonText}
              onPress={onPrimaryPress}
              variant="green"
            />
            <Pressable
              style={styles.secondaryButton}
              onPress={onSecondaryPress}
            >
              <Text style={styles.secondaryButtonText}>
                {secondaryButtonText}
              </Text>
            </Pressable>
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
  messageContainer: {
    marginBottom: 24,
  },
  message: {
    color: Colors.light.dullWhite,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 12,
  },
  secondaryButton: {
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
  },
});
