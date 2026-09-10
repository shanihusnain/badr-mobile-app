import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
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

export function VolunteeringCategoryStep({
  selectedCategory,
  onSelectCategory,
  isOpen,
  setIsOpen,
}: Props) {
  const [tempSelectedCategory, setTempSelectedCategory] = useState<VolunteeringCategoryId | null>(null);

  const selected = VOLUNTEERING_CATEGORIES.find(
    (c) => c.id === selectedCategory,
  )!;

  return (
    <View style={styles.container}>
      {/* Dropdown Trigger */}
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setIsOpen((v) => !v)}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons
          name={selected.icon as any}
          size={18}
          color={Colors.light.white}
        />
        <Text style={styles.dropdownLabel} numberOfLines={1}>
          {selected.label}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={16}
          color={Colors.light.white}
        />
      </TouchableOpacity>

      {/* Description (when closed) */}
      {!isOpen && (
        <Text style={styles.description} numberOfLines={3}>
          ({selected.description})
        </Text>
      )}

      {/* Radio List (when open) */}
      {isOpen && (
        <View style={styles.radioList}>
          {VOLUNTEERING_CATEGORIES.filter((c) => c.id !== selectedCategory).map(
            (cat: VolunteeringCategoryDef) => {
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
                  {/* Radio circle */}
                  <View
                    style={[
                      styles.radioCircle,
                      isChecked && styles.radioCircleChecked,
                    ]}
                  >
                    {isChecked && <View style={styles.radioDot} />}
                  </View>

                  {/* Icon */}
                  <View style={styles.catIconCircle}>
                    <MaterialCommunityIcons
                      name={cat.icon as any}
                      size={14}
                      color={Colors.light.white}
                    />
                  </View>

                  {/* Label */}
                  <Text style={styles.radioLabel} numberOfLines={1}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 4,
    marginTop: 12,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  dropdownLabel: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 13,
    fontWeight: "600",
  },
  description: {
    color: Colors.light.dullWhite,
    fontFamily: fonts.primary.regular,
    fontSize: 11,
    lineHeight: 15,
    paddingHorizontal: 4,
  },
  radioList: {
    backgroundColor: Colors.light.blackBackground,
    borderRadius: 8,
    paddingVertical: 4,
    marginTop: -3,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 10,
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
  catIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 13,
    flex: 1,
  },
});
