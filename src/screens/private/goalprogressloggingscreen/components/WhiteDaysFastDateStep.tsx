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
  /** From loggable-dates `enabled`. Defaults true. */
  enabled?: boolean;
  /** From loggable-dates `alreadyLoggedFastingGoal` — blue strikethrough. */
  alreadyLogged?: boolean;
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
  alreadyLogged = false,
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
          <View style={localStyles.dateLabelWrap}>
            <Text
              style={[
                styles.dateMainText,
                !enabled && !alreadyLogged && localStyles.dateDisabled,
                alreadyLogged && localStyles.dateAlreadyLogged,
              ]}
            >
              {dateLabel}
            </Text>
            {alreadyLogged ? <View style={localStyles.strikeThrough} /> : null}
          </View>
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

      {showDescription ? (
        <View style={localStyles.descriptionRow}>
          <Ionicons
            name="warning"
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
  },
  dateCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
  },
  dateLabelWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  dateDisabled: {
    opacity: 0.45,
  },
  dateAlreadyLogged: {
    opacity: 0.9,
  },
  strikeThrough: {
    position: "absolute",
    left: -2,
    right: -2,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.light.darkblue,
    top: "50%",
    marginTop: -1,
  },
  descriptionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 8,
    maxWidth: "100%",
  },
  descriptionIcon: {
    marginTop: 1,
  },
  descriptionText: {
    flexShrink: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    fontSize: 10,
    lineHeight: 13,
    textAlign: "center",
    opacity: 0.95,
  },
});
