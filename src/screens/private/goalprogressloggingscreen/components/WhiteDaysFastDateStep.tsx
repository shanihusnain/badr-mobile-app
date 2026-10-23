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
  const descriptionText = description?.replace(/\s+/g, " ").trim() ?? "";
  const showDescription = Boolean(descriptionText) && !enabled;

  return (
    <View style={localStyles.wrap}>
      <View style={[styles.dateRow, localStyles.dateRow]}>
        <TouchableOpacity
          style={[localStyles.chevronHit, localStyles.chevronHitStart]}
          onPress={() => onShiftDate(-1)}
          disabled={!canGoPrev}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name={i18n.language === "ar" ? "chevron-forward" : "chevron-back"}
            size={32}
            color={Colors.light.white}
            style={!canGoPrev ? localStyles.chevronDisabled : undefined}
          />
        </TouchableOpacity>

        <View style={localStyles.dateCenter}>
          <Text
            style={[styles.dateMainText, !enabled && localStyles.dateDisabled]}
            numberOfLines={1}
          >
            {dateLabel}
          </Text>
        </View>

        <TouchableOpacity
          style={[localStyles.chevronHit, localStyles.chevronHitEnd]}
          onPress={() => onShiftDate(1)}
          disabled={!canGoNext}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name={i18n.language === "ar" ? "chevron-back" : "chevron-forward"}
            size={32}
            color={Colors.light.white}
            style={!canGoNext ? localStyles.chevronDisabled : undefined}
          />
        </TouchableOpacity>
      </View>

      {/* Absolute under the date row so enabled/disabled dates share the same height. */}
      {showDescription ? (
        <View style={localStyles.descriptionRow} pointerEvents="none">
          <View style={localStyles.descriptionInner}>
            <Ionicons
              name="warning-outline"
              size={12}
              color={Colors.light.white}
              style={localStyles.descriptionIcon}
            />
            <Text
              style={localStyles.descriptionText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {descriptionText}
            </Text>
          </View>
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
  dateRow: {
    width: "100%",
    justifyContent: "space-between",
  },
  chevronHit: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  // Nudge 2px toward the date label.
  chevronHitStart: {
    transform: [{ translateX: 2 }],
  },
  chevronHitEnd: {
    transform: [{ translateX: -2 }],
  },
  dateCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
    paddingHorizontal: 6,
  },
  dateDisabled: {
    opacity: 0.45,
  },
  // Slightly slimmer than active — not as faint as dullWhiteOpacity (10%).
  chevronDisabled: {
    opacity: 0.35,
    transform: [{ scaleX: 0.82 }],
  },
  descriptionRow: {
    position: "absolute",
    top: "100%",
    left: 8,
    right: 8,
    alignItems: "center",
  },
  descriptionInner: {
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  descriptionIcon: {
    flexShrink: 0,
  },
  descriptionText: {
    flexShrink: 1,
    minWidth: 0,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: 10,
    lineHeight: 13,
    textAlign: "center",
    opacity: 0.8,
  },
});
