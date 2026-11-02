import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { SadaqahDropDownHonoringParentsIcon } from "@/assets/icons/SadqahDropDownHonoringParentsIcon";
import { SadaqahDropDownSponsiringIcon } from "@/assets/icons/SadaqahDropDownSponsiringIcon";
import { SadaqahDropDownBuildingWellsIcon } from "@/assets/icons/SadaqahDropDownBuildingWellsIcon";
import { SadaqahDropDownMosqueIcon } from "@/assets/icons/SadaqahDropDownMosqueIcon";
import { SadaqahDropDownTeachingQuranIcon } from "@/assets/icons/SadaqahDropDownTeachingQuranIcon";
import { SadaqahDropDownSheltringLivesIcon } from "@/assets/icons/SadaqahDropDownSheltringLivesIcon";
import { SadaqahDropDownHealthCareIcon } from "@/assets/icons/SadaqahDropDownHealthCareIcon";
import { SadaqahDropDownKnowledgeIcon } from "@/assets/icons/SadaqahDropDownKnowledgeIcon";
import { SadaqahDropDownCloathingIcon } from "@/assets/icons/SadaqahDropDownCloathingIcon";
import { SadaqahDropDownTreeIcon } from "@/assets/icons/SadaqahDropDownTreeIcon";
import {
  SadaqahJariyahCategoryId,
  SadaqahJariyahCategoryDef,
  SADAQAH_JARIYAH_CATEGORIES,
} from "../sadaqahJariyahCategories";

type Props = {
  selectedCategory: SadaqahJariyahCategoryId;
  onSelectCategory: (id: SadaqahJariyahCategoryId) => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

/** Same as Lillah: two rows visible, scroll for the rest. */
const VISIBLE_MENU_ROWS = 2;
const MENU_ROW_HEIGHT = 25;
const MENU_LIST_VERTICAL_PADDING = 7;
/** Dropdown icons are designed at 18×18; keep them uniform in the menu. */
const DROPDOWN_ICON_SIZE = 14;

function CategoryIcon({
  id,
  size = DROPDOWN_ICON_SIZE,
}: {
  id: SadaqahJariyahCategoryId;
  size?: number;
}) {
  switch (id) {
    case "honoring-parents":
      return (
        <SadaqahDropDownHonoringParentsIcon
          size={size}
          color={Colors.light.white}
        />
      );
    case "sponsoring-orphans":
      return (
        <SadaqahDropDownSponsiringIcon
          size={size}
          color={Colors.light.white}
        />
      );
    case "building-wells":
      return (
        <SadaqahDropDownBuildingWellsIcon
          size={size}
          color={Colors.light.white}
        />
      );
    case "sustaining-mosques":
      return (
        <SadaqahDropDownMosqueIcon size={size} color={Colors.light.white} />
      );
    case "teaching-quran":
      return (
        <SadaqahDropDownTeachingQuranIcon
          size={size}
          color={Colors.light.white}
        />
      );
    case "sheltering-lives":
      return (
        <SadaqahDropDownSheltringLivesIcon
          size={size}
          color={Colors.light.white}
        />
      );
    case "providing-healthcare":
      return (
        <SadaqahDropDownHealthCareIcon
          size={size}
          color={Colors.light.white}
        />
      );
    case "spreading-knowledge":
      return (
        <SadaqahDropDownKnowledgeIcon size={size} color={Colors.light.white} />
      );
    case "providing-clothing":
      return (
        <SadaqahDropDownCloathingIcon size={size} color={Colors.light.white} />
      );
    case "planting-trees":
      return (
        <SadaqahDropDownTreeIcon size={size} color={Colors.light.white} />
      );
    default:
      return null;
  }
}

export function SadaqahJariyahCategoryStep({
  selectedCategory,
  onSelectCategory,
  isOpen,
  setIsOpen,
}: Props) {
  const [tempSelectedCategory, setTempSelectedCategory] =
    useState<SadaqahJariyahCategoryId | null>(null);

  const selected = SADAQAH_JARIYAH_CATEGORIES.find(
    (c) => c.id === selectedCategory,
  )!;
  const menuOptions = SADAQAH_JARIYAH_CATEGORIES.filter(
    (c) => c.id !== selectedCategory,
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setIsOpen((v) => !v)}
        activeOpacity={0.85}
      >
        <CategoryIcon id={selected.id} size={DROPDOWN_ICON_SIZE} />
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
            {menuOptions.map((cat: SadaqahJariyahCategoryDef) => {
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
                    <CategoryIcon id={cat.id} size={DROPDOWN_ICON_SIZE} />
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
    // Height = trigger only so open/close never shifts the card layout.
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
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  radioLabel: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 13,
    fontWeight: "500",
  },
});
