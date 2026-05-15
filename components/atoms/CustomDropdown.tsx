import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

interface Option {
  label: string;
  value: string | number;
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
  control: any;
  name: string;
  onSelect?: (value: any) => void;
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
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        const handleSelect = (itemValue: any) => {
          onChange(itemValue);
          setIsOpen(false);
          if (onSelect) onSelect(itemValue);
        };

        const getDisplayLabel = (): string => {
          if (value === undefined || value === null || value === "")
            return placeholder;
          const found = options.find((opt) =>
            typeof opt === "string" ? opt === value : opt.value === value,
          );
          if (!found) return value;
          return typeof found === "string" ? found : found.label;
        };

        return (
          <View style={styles.wrapper}>
            {label ? (
              <Text style={[styles.label, labelStyle]}>{label}</Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.trigger,
                isOpen && styles.triggerOpen,
                containerStyle,
              ]}
              onPress={() => setIsOpen((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.triggerText,
                  selectedTextStyle,
                  !value && { color: Colors.light.icon },
                ]}
              >
                {getDisplayLabel()}
              </Text>
              <Text style={styles.icon}>{isOpen ? "▲" : "▼"}</Text>
            </TouchableOpacity>

            {isOpen && (
              <View style={[styles.menu, menuStyle]}>
                {options.map((item, index) => {
                  const itemLabel =
                    typeof item === "string" ? item : item.label;
                  const itemValue =
                    typeof item === "string" ? item : item.value;
                  const isSelected = value === itemValue;

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
                      <Text style={[styles.optionText, optionTextStyle]}>
                        {itemLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
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
      }}
    />
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  label: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    marginTop: hp(2),
    alignSelf: "flex-start",
  },
  trigger: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 15,
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
  triggerText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    flex: 1,
  },
  icon: {
    color: Colors.light.white,
    fontSize: 14,
  },
  menu: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 16,
    borderWidth: 1,
    //borderColor: Colors.light.border,
    marginTop: 6,
    paddingVertical: 5,
    width: "100%",
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
    marginLeft: 10,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
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
