import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BulbIcon } from "@/assets/icons/BulbIcon";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

type JournalInsightsButtonProps = {
  onPress: () => void;
};

function JournalInsightsButtonComponent({
  onPress,
}: JournalInsightsButtonProps) {
  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Insights"
      hitSlop={4}
    >
      <BulbIcon size={16} color={Colors.light.white} />
      <Text style={styles.label}>INSIGHTS</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 4,
    padding: 6,
    backgroundColor: Colors.light.dullWhiteOpacity,
  },
  label: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 10,
    fontWeight: "500",
  },
});

export const JournalInsightsButton = memo(JournalInsightsButtonComponent);

type JournalTitleRowProps = {
  title: string;
  onInsightsPress: () => void;
};

function JournalTitleRowComponent({
  title,
  onInsightsPress,
}: JournalTitleRowProps) {
  return (
    <View style={titleRowStyles.container}>
      <Text style={titleRowStyles.title}>{title}</Text>
      <View style={titleRowStyles.insightsSlot}>
        <JournalInsightsButton onPress={onInsightsPress} />
      </View>
    </View>
  );
}

const titleRowStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 0,
    paddingHorizontal: 16,
  },
  title: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "700",
  },
  insightsSlot: {
    paddingTop: 4,
  },
});

export const JournalTitleRow = memo(JournalTitleRowComponent);
