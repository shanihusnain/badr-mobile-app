import React, { useCallback } from "react";
import { Text, TouchableOpacity, View, type ViewStyle } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";

export type FlowDropdownOption<T extends string> = {
  value: T;
  label: string;
  /** When true, option is shown greyed and not selectable. */
  disabled?: boolean;
  hint?: string;
};

type Props<T extends string> = {
  options: FlowDropdownOption<T>[];
  selectedValue: T | null;
  onSelectValue: (value: T) => void;
  placeholder: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onOpenChange?: (open: boolean) => void;
  styles: Record<string, object>;
  menuStyle?: ViewStyle;
  /** Override hint under the selector; defaults to selected option.hint */
  hint?: string | null;
  /**
   * `overlay` (default): absolute menu under the selector.
   * `inline`: menu expands in-flow so it is never clipped by the card.
   */
  menuPlacement?: "overlay" | "inline";
  /** Allow multi-line selected label (log-wizard modes). */
  labelNumberOfLines?: number;
  /** Max lines for hint under the selector. */
  hintNumberOfLines?: number;
  /** Tighter option rows for fixed-height log-wizard cards. */
  compactMenu?: boolean;
  /**
   * When true, the open menu omits the currently selected value so the
   * closed selector shows the default and the menu lists the alternatives.
   */
  hideSelectedInMenu?: boolean;
};

const FLOW_DROPDOWN_RADIO_INNER = Colors.light.green;
const FLOW_DROPDOWN_RADIO_OUTER = Colors.light.grey;
const DISABLED_OPTION_COLOR = Colors.light.grey;

export function FlowDropdownSelect<T extends string>({
  options,
  selectedValue,
  onSelectValue,
  placeholder,
  isOpen,
  setIsOpen,
  onOpenChange,
  styles,
  menuStyle,
  hint,
  menuPlacement = "overlay",
  labelNumberOfLines = 1,
  hintNumberOfLines = 2,
  compactMenu = false,
  hideSelectedInMenu = false,
}: Props<T>) {
  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  );
  const displayLabel = selectedOption?.label ?? placeholder;
  const displayHint =
    hint !== undefined ? hint : (selectedOption?.hint ?? null);
  const isInline = menuPlacement === "inline";
  const menuOptions =
    hideSelectedInMenu && selectedValue
      ? options.filter((option) => option.value !== selectedValue)
      : options;

  const updateOpen = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange, setIsOpen],
  );

  const optionRowStyle = compactMenu
    ? (styles.fastingWizardLogTypeOption ??
      styles.flowDropdownOption ??
      styles.dropdownOption)
    : (styles.flowDropdownOption ?? styles.dropdownOption);

  const optionsList = menuOptions.map((option) => {
    const isSelected = selectedValue === option.value;
    const isDisabled = option.disabled === true;
    return (
      <TouchableOpacity
        key={option.value}
        style={optionRowStyle}
        onPress={() => {
          if (isDisabled) return;
          onSelectValue(option.value);
          updateOpen(false);
        }}
        activeOpacity={isDisabled ? 1 : 0.8}
        disabled={isDisabled}
      >
        <View
          style={[
            styles.dropdownRadioOuter,
            {
              borderColor: isDisabled
                ? DISABLED_OPTION_COLOR
                : FLOW_DROPDOWN_RADIO_OUTER,
            },
          ]}
        >
          {isSelected && !isDisabled ? (
            <View
              style={[
                styles.dropdownRadioInner,
                { backgroundColor: FLOW_DROPDOWN_RADIO_INNER },
              ]}
            />
          ) : null}
        </View>
        <Text
          style={[
            styles.dropdownOptionText,
            isDisabled && { color: DISABLED_OPTION_COLOR },
          ]}
          numberOfLines={2}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  });

  return (
    <View
      style={[styles.flowDropdownWrapper, isOpen && { zIndex: 30 }]}
      onStartShouldSetResponder={() => isOpen}
      onMoveShouldSetResponder={() => isOpen}
    >
      {/*
        Selector + overlay menu share one relative box so `top: 100%` is
        under the selector only — not under the hint (which caused the menu
        to sit at the bottom of the card).
      */}
      <View style={{ position: "relative", zIndex: 2 }}>
        <TouchableOpacity
          style={[
            styles.flowDropdownSelector,
            isOpen && { borderColor: Colors.light.white },
          ]}
          onPress={() => updateOpen(!isOpen)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.flowDropdownValue,
              !selectedOption && styles.flowDropdownPlaceholder,
            ]}
            numberOfLines={labelNumberOfLines}
            {...(labelNumberOfLines === 1
              ? {
                  adjustsFontSizeToFit: true as const,
                  minimumFontScale: 0.85,
                }
              : null)}
          >
            {displayLabel}
          </Text>
          <Ionicons name="chevron-down" size={14} color={Colors.light.white} />
        </TouchableOpacity>

        {isOpen && !isInline ? (
          <View
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
          >
            <ScrollView
              style={[styles.flowDropdownMenu, menuStyle]}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {optionsList}
            </ScrollView>
          </View>
        ) : null}
      </View>

      {/* Keep hint mounted when open so open/close does not shift card layout. */}
      {displayHint ? (
        <Text
          style={[styles.flowDropdownHint, isOpen && { opacity: 0 }]}
          numberOfLines={hintNumberOfLines}
        >
          {displayHint}
        </Text>
      ) : null}

      {isOpen && isInline ? (
        <View
          style={[styles.flowDropdownMenuInline, menuStyle]}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
        >
          {optionsList}
        </View>
      ) : null}
    </View>
  );
}
