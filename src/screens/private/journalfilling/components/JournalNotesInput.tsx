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
        placeholderTextColor={Colors.light.placeholder}
        multiline
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
  },
  title: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    marginBottom: 10,
  },
  input: {
    minHeight: 120,
    borderRadius: 10,
    backgroundColor: Colors.light.white,
    opacity: 0.6,
    color: Colors.light.blackBackground,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});

export const JournalNotesInput = memo(JournalNotesInputComponent);
