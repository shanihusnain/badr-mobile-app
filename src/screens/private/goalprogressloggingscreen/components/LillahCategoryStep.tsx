import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { GoatIcon } from "@/assets/icons/GoatIcon";
import { HouseWithHeartIcon } from "@/assets/icons/HouseWithHeartIcon";
import { DebtAssistanceIcon } from "@/assets/icons/DebtAssistanceIcon";
import { FlowCardQardHassanIcon } from "@/assets/icons/FlowCardQardHassanIcon";
import { FlowCardFoodReliefIcon } from "@/assets/icons/FlowCardFoodReleifIcon";
import {
  LillahCategoryId,
  LillahCategoryDef,
  LILLAH_CATEGORIES,
} from "../lillahCategories";

type Props = {
  selectedCategory: LillahCategoryId;
  onSelectCategory: (id: LillahCategoryId) => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

/** Visible rows in the open menu (design: two at a time, scroll for the rest). */
const VISIBLE_MENU_ROWS = 2;
const MENU_ROW_HEIGHT = 25;
const MENU_LIST_VERTICAL_PADDING = 7;

function CategoryIcon({
  id,
  size = 20,
}: {
  id: LillahCategoryId;
  size?: number;
}) {
  if (id === "qurbani") {
    return <GoatIcon size={size} color={Colors.light.white} />;
  }
  if (id === "household-essentials") {
    return <HouseWithHeartIcon size={size} color={Colors.light.white} />;
  }
  if (id === "debt-assistance") {
    return <DebtAssistanceIcon size={size} color={Colors.light.white} />;
  }
  if (id === "qard-hassan") {
    return <FlowCardQardHassanIcon size={size} color={Colors.light.white} />;
  }
  if (id === "food-relief") {
    return <FlowCardFoodReliefIcon size={size} color={Colors.light.white} />;
  }
  return (
    <MaterialCommunityIcons
      name="help-circle-outline"
      size={size}
      color={Colors.light.white}
    />
  );
}

export function LillahCategoryStep({
  selectedCategory,
  onSelectCategory,
  isOpen,
  setIsOpen,
}: Props) {
  const [tempSelectedCategory, setTempSelectedCategory] =
    useState<LillahCategoryId | null>(null);

  const selected = LILLAH_CATEGORIES.find((c) => c.id === selectedCategory)!;
  // All other Lillah options (Food Relief, Animal Sacrifice, Household,
  // Debt Assistance, Qard Hassan) minus the one already on the trigger.
  const menuOptions = LILLAH_CATEGORIES.filter(
    (c) => c.id !== selectedCategory,
  );

  return (
    <View style={styles.container}>
      {/* Trigger stays fixed; subtext + menu overlay below so layout never jumps. */}
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setIsOpen((v) => !v)}
        activeOpacity={0.85}
      >
        <CategoryIcon id={selected.id} size={18} />
        <Text style={styles.dropdownLabel} numberOfLines={1}>
          {selected.label}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={16}
          color={Colors.light.white}
        />
      </TouchableOpacity>

      {!isOpen ? (
        <Text style={styles.description} numberOfLines={3}>
          ({selected.description})
        </Text>
      ) : (
        <View style={styles.radioList}>
          <ScrollView
            style={styles.radioScroll}
            contentContainerStyle={styles.radioScrollContent}
            showsVerticalScrollIndicator
            nestedScrollEnabled
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            {menuOptions.map((cat: LillahCategoryDef) => {
              const isChecked = cat.id === tempSelectedCategory;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.radioRow}
                  onPress={() => {
                    setTempSelectedCategory(cat.id);
                    setTimeout(() => {
                      onSelectCategory(cat.id);
                      setIsOpen(false);
                      setTempSelectedCategory(null);
                    }, 150);
                  }}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      isChecked && styles.radioCircleChecked,
                    ]}
                  >
                    {isChecked ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={styles.catIconCirclePlain}>
                    <CategoryIcon id={cat.id} size={18} />
                  </View>
                  <Text style={styles.radioLabel} numberOfLines={1}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 16,
    position: "relative",
    zIndex: 20,
    // Height = trigger only so open/close never shifts the Food Relief box.
    alignSelf: "stretch",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "transparent",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  dropdownLabel: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 13,
    fontWeight: "600",
  },
  description: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: fonts.primary.regular,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "400",
    textAlign: "left",
    // Flush with dropdown left edge (same as trigger).
    paddingHorizontal: 0,
  },
  radioList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: Colors.light.blackBackground,
    borderRadius: 8,
    paddingVertical: 6,
    zIndex: 999,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Exactly two rows visible; remaining categories scroll inside.
    maxHeight: MENU_ROW_HEIGHT * VISIBLE_MENU_ROWS + MENU_LIST_VERTICAL_PADDING,
    overflow: "hidden",
  },
  radioScroll: {
    maxHeight: MENU_ROW_HEIGHT * VISIBLE_MENU_ROWS,
  },
  radioScrollContent: {
    paddingBottom: 2,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: MENU_ROW_HEIGHT,
    paddingHorizontal: 12,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.light.grey,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleChecked: {
    borderColor: Colors.light.green,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.green,
  },
  catIconCirclePlain: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  radioLabel: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 16,
    includeFontPadding: false,
    textAlignVertical: "center",
    // Optical center with category icons (esp. Debt Assistance spark + note).
    marginTop: 1,
  },
});
