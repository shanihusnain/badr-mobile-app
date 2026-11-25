import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
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
      <PrimaryButton
        text={label}
        onPress={onPress}
        disabled={disabled || loading}
        isLoading={loading}
        style={[
          styles.button,
          disabled && !loading && styles.buttonDisabled,
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
});

export const JournalSaveButton = memo(JournalSaveButtonComponent);
