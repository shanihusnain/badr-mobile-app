import { fonts } from "@/assets/fonts";
import { DownArrowIcon } from "@/assets/icons";
import { Colors } from "@/constants/theme";
import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import {
  StyleSheet,
  Text,
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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<
    string | number | undefined
  >(controlledValue);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setSelectedValue(controlledValue);
    }
  }, [controlledValue]);

  const renderDropdown = (
    currentValue: string | number | undefined,
    onChange?: (value: any) => void,
  ) => {
    const handleSelect = (itemValue: any) => {
      if (onChange) onChange(itemValue);
      else setSelectedValue(itemValue);
      setIsOpen(false);
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

    const getDisplayLabel = (): string => {
      if (
        currentValue === undefined ||
        currentValue === null ||
        currentValue === ""
      )
        return placeholder;
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
              <View style={styles.iconWrapper}>{selectedOption.icon}</View>
            ) : null}
            <Text
              style={[
                styles.triggerText,
                selectedTextStyle,
                !currentValue && { color: Colors.light.icon },
              ]}
            >
              {getDisplayLabel()}
            </Text>
          </View>
          <DownArrowIcon />
        </TouchableOpacity>

        {isOpen && (
          <ScrollView
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            style={[
              styles.menu,
              menuStyle,
              {
                maxHeight: 300,
              },
            ]}
          >
            {options.map((item, index) => {
              const itemLabel = typeof item === "string" ? item : item.label;
              const itemValue = typeof item === "string" ? item : item.value;
              const itemIcon = typeof item === "string" ? undefined : item.icon;
              const isSelected = currentValue === itemValue;

              return (
                <TouchableOpacity
                  key={index}
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
            })}
          </ScrollView>
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
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 8,
    paddingHorizontal: 16,
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
  },
  triggerText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    flex: 1,
  },
  optionIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  iconWrapper: {
    marginLeft: 10,
    marginRight: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    color: Colors.light.white,
    fontSize: 14,
  },
  menu: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 6,
    //borderWidth: 1,
    //borderColor: Colors.light.border,
    marginTop: 10,
    paddingVertical: 5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    marginLeft: 4,
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
