import { fonts } from "@/assets/fonts";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Colors } from "@/constants/theme";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ChatNotificationOption = "all" | "mentions" | "none";

const OPTIONS: { id: ChatNotificationOption; label: string }[] = [
  { id: "all", label: "ALL NEW MESSAGES" },
  { id: "mentions", label: "@MENTIONS ONLY" },
  { id: "none", label: "NONE" },
];

export default function ChatNotificationSettingsScreen() {
  const [selected, setSelected] = useState<ChatNotificationOption>("all");

  return (
    <BlackScreenWrapper>
      <View style={styles.content}>
        {OPTIONS.map((option) => {
          const isSelected = option.id === selected;
          return (
            <Pressable
              key={option.id}
              style={styles.row}
              onPress={() => setSelected(option.id)}
            >
              <View
                style={[
                  styles.radio,
                  isSelected ? styles.radioSelected : styles.radioUnselected,
                ]}
              />
              <Text style={styles.label}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </BlackScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 22,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  radioSelected: {
    backgroundColor: Colors.light.green,
  },
  radioUnselected: {
    backgroundColor: Colors.light.darkgrey,
    borderWidth: 1.5,
    borderColor: Colors.light.subtext,
  },
  label: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 13,
    textTransform: "uppercase",
  },
});
