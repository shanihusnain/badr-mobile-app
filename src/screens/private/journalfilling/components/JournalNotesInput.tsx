import React, { memo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

type JournalNotesInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
};

function JournalNotesInputComponent({
  value,
  onChangeText,
  placeholder,
}: JournalNotesInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notes</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(0, 0, 0, 0.6)"
        selectionColor="rgba(0, 0, 0, 0.7)"
        multiline
        textAlign="left"
        textAlignVertical="top"
        accessibilityLabel="Journal notes"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 24,
    alignItems: "flex-start",
  },
  title: {
    color: "#808284",
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    minHeight: 120,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.62)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    color: "rgba(0, 0, 0, 0.7)",
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingTop: 42,
    paddingBottom: 12,
    textAlign: "left",
    textAlignVertical: "top",
  },
});

export const JournalNotesInput = memo(JournalNotesInputComponent);
