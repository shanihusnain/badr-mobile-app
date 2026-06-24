import React, { useCallback } from "react";
import { Text, TouchableOpacity, View, type ViewStyle } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";

export type FlowDropdownOption<T extends string> = {
  value: T;
  label: string;
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
};

const FLOW_DROPDOWN_RADIO_COLOR = Colors.light.green;

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
}: Props<T>) {
  const selectedOption = options.find((option) => option.value === selectedValue);
  const displayLabel = selectedOption?.label ?? placeholder;

  const updateOpen = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange, setIsOpen],
  );

  return (
    <View
      style={[styles.flowDropdownWrapper, isOpen && { zIndex: 30 }]}
      onStartShouldSetResponder={() => isOpen}
      onMoveShouldSetResponder={() => isOpen}
    >
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
          numberOfLines={1}
        >
          {displayLabel}
        </Text>
        <Ionicons name="chevron-down" size={14} color={Colors.light.white} />
      </TouchableOpacity>

      {isOpen ? (
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
            {options.map((option) => {
              const isSelected = selectedValue === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={styles.flowDropdownOption ?? styles.dropdownOption}
                  onPress={() => {
                    onSelectValue(option.value);
                    updateOpen(false);
                  }}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.dropdownRadioOuter,
                      isSelected && { borderColor: FLOW_DROPDOWN_RADIO_COLOR },
                    ]}
                  >
                    {isSelected ? (
                      <View
                        style={[
                          styles.dropdownRadioInner,
                          { backgroundColor: FLOW_DROPDOWN_RADIO_COLOR },
                        ]}
                      />
                    ) : null}
                  </View>
                  <Text style={styles.dropdownOptionText} numberOfLines={2}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
