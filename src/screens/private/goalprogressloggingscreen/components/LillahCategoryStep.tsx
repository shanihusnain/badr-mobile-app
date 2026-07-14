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
};

export function LillahCategoryStep({ selectedCategory, onSelectCategory }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const selected = LILLAH_CATEGORIES.find((c) => c.id === selectedCategory)!;

  return (
    <View style={styles.container}>
      {/* Dropdown Trigger */}
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setIsOpen((v) => !v)}
        activeOpacity={0.85}
      >
        {selected.id === "qurbani" ? (
          <GoatIcon size={20} color={Colors.light.white} />
        ) : selected.id === "household-essentials" ? (
          <HouseWithHeartIcon size={20} color={Colors.light.white} />
        ) : selected.id === "debt-assistance" ? (
          <DebtAssistanceIcon size={20} color={Colors.light.white} />
        ) : selected.id === "qard-hassan" ? (
          <FlowCardQardHassanIcon size={20} color={Colors.light.white} />
        ) : selected.id === "food-relief" ? (
          <FlowCardFoodReliefIcon size={20} color={Colors.light.white} />
        ) : (
          <MaterialCommunityIcons
            name={selected.icon as any}
            size={20}
            color={Colors.light.white}
          />
        )}
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
          {LILLAH_CATEGORIES.map((cat: LillahCategoryDef) => {
            const isChecked = cat.id === selectedCategory;
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.radioRow}
                onPress={() => {
                  onSelectCategory(cat.id);
                  setIsOpen(false);
                }}
                activeOpacity={0.8}
              >
                {/* Radio circle */}
                <View style={[styles.radioCircle, isChecked && styles.radioCircleChecked]}>
                  {isChecked && <View style={styles.radioDot} />}
                </View>

                {/* Icon */}
                <View style={styles.catIconCirclePlain}>
                  {cat.id === "qurbani" ? (
                    <GoatIcon size={20} color={Colors.light.white} />
                  ) : cat.id === "household-essentials" ? (
                    <HouseWithHeartIcon size={20} color={Colors.light.white} />
                  ) : cat.id === "debt-assistance" ? (
                    <DebtAssistanceIcon size={20} color={Colors.light.white} />
                  ) : cat.id === "qard-hassan" ? (
                    <FlowCardQardHassanIcon size={20} color={Colors.light.white} />
                  ) : cat.id === "food-relief" ? (
                    <FlowCardFoodReliefIcon size={20} color={Colors.light.white} />
                  ) : (
                    <MaterialCommunityIcons
                      name={cat.icon as any}
                      size={20}
                      color={Colors.light.white}
                    />
                  )}
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
    gap: 8,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    gap: 2,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.light.subtext,
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
  },
});
