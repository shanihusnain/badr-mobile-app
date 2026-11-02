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
import { FlowCardFoodReliefIcon } from "@/assets/icons/FlowCardFoodReleifIcon";
import {
  VolunteeringCategoryId,
  VolunteeringCategoryDef,
  VOLUNTEERING_CATEGORIES,
} from "../volunteeringCategories";

type Props = {
  selectedCategory: VolunteeringCategoryId;
  onSelectCategory: (id: VolunteeringCategoryId) => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

/** Visible rows in the open menu (same as Lillah: two at a time, scroll for rest). */
const VISIBLE_MENU_ROWS = 2;
const MENU_ROW_HEIGHT = 25;
const MENU_LIST_VERTICAL_PADDING = 7;

function CategoryIcon({
  id,
  size = 18,
}: {
  id: VolunteeringCategoryId;
  size?: number;
}) {
  if (id === "distributing-food") {
    return <FlowCardFoodReliefIcon size={size} color={Colors.light.white} />;
  }
  const def = VOLUNTEERING_CATEGORIES.find((c) => c.id === id);
  return (
    <MaterialCommunityIcons
      name={(def?.icon as any) ?? "help-circle-outline"}
      size={size}
      color={Colors.light.white}
    />
  );
}

export function VolunteeringCategoryStep({
  selectedCategory,
  onSelectCategory,
  isOpen,
  setIsOpen,
}: Props) {
  const [tempSelectedCategory, setTempSelectedCategory] =
    useState<VolunteeringCategoryId | null>(null);

  const selected = VOLUNTEERING_CATEGORIES.find(
    (c) => c.id === selectedCategory,
  )!;
  const menuOptions = VOLUNTEERING_CATEGORIES.filter(
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
            {menuOptions.map((cat: VolunteeringCategoryDef) => {
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
                    <CategoryIcon id={cat.id} size={14} />
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
    marginTop: 14,
    position: "relative",
    zIndex: 20,
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
    lineHeight: 14,
    fontWeight: "400",
    textAlign: "left",
    paddingHorizontal: 0,
  },
  radioList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 2,
    backgroundColor: Colors.light.blackBackground,
    borderRadius: 8,
    paddingVertical: 3.5,
    zIndex: 999,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    maxHeight: MENU_ROW_HEIGHT * VISIBLE_MENU_ROWS + MENU_LIST_VERTICAL_PADDING,
    overflow: "hidden",
  },
  radioScroll: {
    maxHeight: MENU_ROW_HEIGHT * VISIBLE_MENU_ROWS,
  },
  radioScrollContent: {
    paddingBottom: 0,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: MENU_ROW_HEIGHT,
    paddingHorizontal: 10,
  },
  radioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.light.grey,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleChecked: {
    borderColor: Colors.light.green,
  },
  radioDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.light.green,
  },
  catIconCirclePlain: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  radioLabel: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
  },
});
