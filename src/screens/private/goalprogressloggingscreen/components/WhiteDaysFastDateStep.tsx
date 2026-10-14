import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { useTranslation } from "react-i18next";
import { fonts } from "@/assets/fonts";

type Props = {
  dateLabel: string;
  canGoPrev: boolean;
  canGoNext: boolean;
  onShiftDate: (direction: -1 | 1) => void;
  styles: {
    dateRow: object;
    dateMainText: object;
  };
  /**
   * From loggable-dates `enabled`.
   * When false (booked or already logged), date is faded — no strikethrough.
   */
  enabled?: boolean;
  /** From loggable-dates `description` — shown under date with warning icon. */
  description?: string | null;
};

export function WhiteDaysFastDateStep({
  dateLabel,
  canGoPrev,
  canGoNext,
  onShiftDate,
  styles,
  enabled = true,
  description,
}: Props) {
  const { i18n } = useTranslation();
  const showDescription = Boolean(description?.trim()) && !enabled;

  return (
    <View style={localStyles.wrap}>
      <View style={styles.dateRow}>
        <TouchableOpacity
          onPress={() => onShiftDate(-1)}
          disabled={!canGoPrev}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name={i18n.language === "ar" ? "chevron-forward" : "chevron-back"}
            size={32}
            color={
              canGoPrev ? Colors.light.white : Colors.light.dullWhiteOpacity
            }
          />
        </TouchableOpacity>

        <View style={localStyles.dateCenter}>
          <Text
            style={[styles.dateMainText, !enabled && localStyles.dateDisabled]}
          >
            {dateLabel}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onShiftDate(1)}
          disabled={!canGoNext}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name={i18n.language === "ar" ? "chevron-back" : "chevron-forward"}
            size={32}
            color={
              canGoNext ? Colors.light.white : Colors.light.dullWhiteOpacity
            }
          />
        </TouchableOpacity>
      </View>

      {/* Absolute so the date stays vertically centered when subtext appears. */}
      {showDescription ? (
        <View style={localStyles.descriptionRow}>
          <Ionicons
            name="warning-outline"
            size={12}
            color={Colors.light.white}
            style={localStyles.descriptionIcon}
          />
          <Text style={localStyles.descriptionText} numberOfLines={2}>
            {description}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const localStyles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignItems: "center",
    position: "relative",
  },
  dateCenter: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
    flexShrink: 1,
  },
  dateDisabled: {
    opacity: 0.45,
  },
  descriptionRow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "100%",
    marginTop: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 4,
    paddingHorizontal: 4,
  },
  descriptionIcon: {
    marginTop: 2.5,
  },
  descriptionText: {
    flex: 1,
    flexShrink: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: 10,
    lineHeight: 13,
    textAlign: "left",
    opacity: 0.80,
  },
});
