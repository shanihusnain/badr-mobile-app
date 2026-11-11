import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { SvgComponent as JournalPencilIcon } from "@/assets/icons/JournalPencilIcon";

type JournalFillingHeaderProps = {
  title?: string;
  showEdit?: boolean;
  onBackPress?: () => void;
  onEditPress?: () => void;
  backgroundColor?: string;
  /** Skip status-bar inset — for embedding in a bottom sheet. */
  compact?: boolean;
};

function JournalFillingHeaderComponent({
  title = "JOURNAL",
  showEdit = false,
  onBackPress,
  onEditPress,
  backgroundColor = "transparent",
  compact = false,
}: JournalFillingHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.headerRow,
        {
          paddingTop: compact ? 4 : insets.top + 10,
          backgroundColor,
        },
      ]}
    >
      <View style={styles.headerLeft}>
        <Pressable
          style={styles.backButtonContainer}
          onPress={onBackPress ?? (() => router.back())}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <Feather name="x" size={16} color={Colors.light.blackBackground} />
        </Pressable>
      </View>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerRight}>
        {showEdit ? (
          <Pressable
            style={styles.editButton}
            onPress={onEditPress}
            accessibilityRole="button"
            accessibilityLabel="Edit journal"
            hitSlop={8}
          >
            <JournalPencilIcon size={18} color={Colors.light.white} />
          </Pressable>
        ) : (
          <View style={styles.editPlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    width: 40,
    alignItems: "flex-start",
  },
  headerTitle: {
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    color: Colors.light.white,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  backButtonContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 0,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  editPlaceholder: {
    width: 32,
    height: 32,
  },
});

export const JournalFillingHeader = memo(JournalFillingHeaderComponent);
