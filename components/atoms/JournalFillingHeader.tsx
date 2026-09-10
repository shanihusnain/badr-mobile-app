import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import BackButton from "./Backbutton";

type JournalFillingHeaderProps = {
  title?: string;
  showEdit?: boolean;
  onBackPress?: () => void;
  onEditPress?: () => void;
  backgroundColor?: string;
};

function JournalFillingHeaderComponent({
  title = "JOURNAL",
  showEdit = false,
  onBackPress,
  onEditPress,
  backgroundColor = "transparent",
}: JournalFillingHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.headerRow,
        {
          paddingTop: insets.top + 10,
          backgroundColor,
        },
      ]}
    >
      <View style={styles.headerLeft}>
        <BackButton onPress={onBackPress ?? (() => router.back())} />
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
            <Feather name="edit-2" size={18} color={Colors.light.white} />
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
  editButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.buttonBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  editPlaceholder: {
    width: 30,
    height: 30,
  },
});

export const JournalFillingHeader = memo(JournalFillingHeaderComponent);
