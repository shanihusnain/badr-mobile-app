import { fonts } from "@/assets/fonts";
import { DownArrowIcon, MagnifyingGlassIcon } from "@/assets/icons";
import { Colors } from "@/constants/theme";
import React, { useEffect, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import {
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
// Use gesture-handler ScrollView for better nested scrolling inside FlatList / BottomSheet
import { ScrollView } from "react-native-gesture-handler";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

interface Option {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  label?: string;
  placeholder: string;
  options: (string | Option)[];
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  menuStyle?: ViewStyle;
  optionStyle?: ViewStyle;
  optionTextStyle?: TextStyle;
  selectedTextStyle?: TextStyle;
  errors?: string[];
  control?: any;
  name?: string;
  value?: string | number;
  onSelect?: (value: any) => void;
  borderColor?: string;
  /** Shows a search field inside the open menu. */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptySearchText?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  placeholder,
  options,
  labelStyle,
  containerStyle,
  menuStyle,
  optionStyle,
  optionTextStyle,
  selectedTextStyle,
  errors = [],
  control,
  name,
  value: controlledValue,
  onSelect,
  borderColor,
  searchable = false,
  searchPlaceholder = "Search...",
  emptySearchText = "No results found",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState<
    string | number | undefined
  >(controlledValue);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setSelectedValue(controlledValue);
    }
  }, [controlledValue]);

  useEffect(() => {
    if (!isOpen) setSearchQuery("");
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const query = searchQuery.trim().toLowerCase();
    return options.filter((item) => {
      const label = typeof item === "string" ? item : item.label;
      const value = typeof item === "string" ? item : String(item.value);
      return (
        label.toLowerCase().includes(query) ||
        value.toLowerCase().includes(query)
      );
    });
  }, [options, searchQuery, searchable]);

  const renderDropdown = (
    currentValue: string | number | undefined,
    onChange?: (value: any) => void,
  ) => {
    const handleSelect = (itemValue: any) => {
      if (onChange) onChange(itemValue);
      else setSelectedValue(itemValue);
      setIsOpen(false);
      setSearchQuery("");
      if (onSelect) onSelect(itemValue);
    };

    const getSelectedOption = () => {
      return options.find((opt) =>
        typeof opt === "string"
          ? opt === currentValue
          : opt.value === currentValue,
      );
    };

    const selectedOption = getSelectedOption();
    const hasValue =
      currentValue !== undefined &&
      currentValue !== null &&
      String(currentValue).trim() !== "";

    const getDisplayLabel = (): string => {
      if (!hasValue) return placeholder;
      if (!selectedOption) return String(currentValue);
      return typeof selectedOption === "string"
        ? selectedOption
        : selectedOption.label;
    };

    return (
      <View style={styles.wrapper}>
        {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}

        <TouchableOpacity
          style={[
            styles.trigger,
            containerStyle,
            borderColor
              ? {
                  borderColor: isOpen ? Colors.light.green : borderColor,
                  borderWidth: 1,
                }
              : {
                  borderColor: isOpen ? Colors.light.green : "transparent",
                  borderWidth: isOpen ? 1 : 0,
                },
          ]}
          onPress={() => setIsOpen((prev) => !prev)}
          activeOpacity={0.8}
        >
          <View style={styles.triggerContent}>
            {selectedOption &&
            typeof selectedOption !== "string" &&
            selectedOption.icon ? (
              <View style={styles.triggerIconWrapper}>
                {selectedOption.icon}
              </View>
            ) : null}
            <Text
              style={[
                styles.triggerText,
                hasValue ? selectedTextStyle : styles.placeholderText,
              ]}
            >
              {getDisplayLabel()}
            </Text>
          </View>
          <DownArrowIcon />
        </TouchableOpacity>

        {isOpen && (
          <View style={[styles.menu, menuStyle]}>
            {searchable ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  backgroundColor: Colors.light.greybuttonBackground,
                  marginHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 6,
                  paddingHorizontal: 12,
                }}
              >
                <MagnifyingGlassIcon />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={Colors.light.white}
                  style={styles.searchInput}
                  autoCorrect={false}
                  autoCapitalize="none"
                  clearButtonMode="while-editing"
                />
              </View>
            ) : null}
            <ScrollView
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              style={styles.menuScroll}
            >
              {filteredOptions.length === 0 ? (
                <Text style={styles.emptySearchText}>{emptySearchText}</Text>
              ) : (
                filteredOptions.map((item, index) => {
                  const itemLabel =
                    typeof item === "string" ? item : item.label;
                  const itemValue =
                    typeof item === "string" ? item : item.value;
                  const itemIcon =
                    typeof item === "string" ? undefined : item.icon;
                  const isSelected = currentValue === itemValue;

                  return (
                    <TouchableOpacity
                      key={`${String(itemValue)}-${index}`}
                      style={[styles.option, optionStyle]}
                      onPress={() => handleSelect(itemValue)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.radioOuter}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      {itemIcon ? (
                        <View style={styles.iconWrapper}>{itemIcon}</View>
                      ) : null}
                      <Text style={[styles.optionText, optionTextStyle]}>
                        {itemLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        )}

        {errors.length > 0 && (
          <View style={{ marginTop: 5 }}>
            {errors.map((error, index) => (
              <Text key={index} style={styles.errorText}>
                {error}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) =>
          renderDropdown(value, (itemValue) => onChange(itemValue))
        }
      />
    );
  }

  return renderDropdown(selectedValue);
};

const styles = StyleSheet.create({
  wrapper: {
    width: "98%",
  },
  label: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    marginTop: 0,
    alignSelf: "flex-start",
  },
  trigger: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 48,
    width: "100%",
    marginTop: hp(1),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  triggerOpen: {
    borderWidth: 1.5,
    borderColor: Colors.light.green,
  },
  triggerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  triggerIconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  triggerText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    flex: 1,
  },
  placeholderText: {
    color: Colors.light.icon,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
  },
  optionIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  iconWrapper: {
    marginLeft: 10,
    marginRight: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    color: Colors.light.white,
    fontSize: 14,
  },
  menu: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 8,
    marginTop: 10,
    paddingVertical: 5,
    maxHeight: 300,
  },
  menuScroll: {
    maxHeight: 250,
  },
  searchInput: {
    backgroundColor: Colors.light.greybuttonBackground,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 13,
  },
  emptySearchText: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 13,
    marginLeft: 10,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.grey,
    backgroundColor: Colors.light.buttonBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
});

export default CustomDropdown;
