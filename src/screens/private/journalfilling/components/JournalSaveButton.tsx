import React, { memo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import PrimaryButton from "@/components/atoms/Primary-button";
import { Colors } from "@/constants/theme";

type JournalSaveButtonProps = {
  label: string;
  disabled: boolean;
  loading: boolean;
  bottomInset: number;
  onPress: () => void;
};

function JournalSaveButtonComponent({
  label,
  disabled,
  loading,
  bottomInset,
  onPress,
}: JournalSaveButtonProps) {
  return (
    <View style={[styles.container, { paddingBottom: bottomInset + 12 }]}>
      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={Colors.light.white} />
        </View>
      ) : null}
      <PrimaryButton
        text={label}
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.button,
          (disabled || loading) && styles.buttonDisabled,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    backgroundColor: Colors.light.blackBackground,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  button: {
    width: "82%",
    alignSelf: "center",
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    top: 12,
    bottom: 12,
  },
});

export const JournalSaveButton = memo(JournalSaveButtonComponent);
