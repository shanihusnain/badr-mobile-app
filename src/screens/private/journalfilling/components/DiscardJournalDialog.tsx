import React, { memo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

type DiscardJournalDialogProps = {
  visible: boolean;
  title: string;
  body: string;
  checkboxLabel: string;
  dontShowAgain: boolean;
  primaryButtonText: string;
  secondaryButtonText: string;
  onToggleDontShowAgain: () => void;
  onCompleteJournal: () => void;
  onDismissJournal: () => void;
  onBackdropPress?: () => void;
};

function DiscardJournalDialogComponent({
  visible,
  title,
  body,
  checkboxLabel,
  dontShowAgain,
  primaryButtonText,
  secondaryButtonText,
  onToggleDontShowAgain,
  onCompleteJournal,
  onDismissJournal,
  onBackdropPress,
}: DiscardJournalDialogProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onBackdropPress ?? onCompleteJournal}
    >
      <Pressable
        style={styles.overlay}
        onPress={onBackdropPress ?? onCompleteJournal}
      >
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>

          <Pressable
            style={styles.checkboxRow}
            onPress={onToggleDontShowAgain}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: dontShowAgain }}
          >
            <View
              style={[
                styles.checkboxBox,
                dontShowAgain && styles.checkboxBoxSelected,
              ]}
            >
              {dontShowAgain ? (
                <Feather name="check" size={14} color={Colors.light.white} />
              ) : null}
            </View>
            <Text style={styles.checkboxLabel}>{checkboxLabel}</Text>
          </Pressable>

          <View style={styles.buttonContainer}>
            <SecondaryButton
              text={primaryButtonText}
              onPress={onCompleteJournal}
              variant="green"
            />
            <Pressable
              style={styles.secondaryButton}
              onPress={onDismissJournal}
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
  body: {
    color: Colors.light.dullWhite,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.light.subtext,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxSelected: {
    backgroundColor: Colors.light.green,
    borderColor: Colors.light.green,
  },
  checkboxLabel: {
    flex: 1,
    color: Colors.light.dullWhite,
    fontFamily: fonts.primary.regular,
    fontSize: 13,
    lineHeight: 18,
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

export const DiscardJournalDialog = memo(DiscardJournalDialogComponent);
