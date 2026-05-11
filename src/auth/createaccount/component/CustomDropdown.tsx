import React from "react";
import {
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { fonts } from "../../../../assets/fonts";
import { Colors } from "../../../../constants/theme";

interface CustomDropdownProps {
  label?: string;
  placeholder: string;
  selectedValue: string;
  options: string[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  menuStyle?: ViewStyle;
  optionStyle?: ViewStyle;
  optionTextStyle?: TextStyle;
  selectedTextStyle?: TextStyle;
  errors?: string[];
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  placeholder,
  selectedValue,
  options,
  isOpen,
  onToggle,
  onSelect,
  labelStyle,
  containerStyle,
  menuStyle,
  optionStyle,
  optionTextStyle,
  selectedTextStyle,
  errors = [],
}) => {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}
      <TouchableOpacity
        style={[styles.trigger, containerStyle]}
        onPress={onToggle}
      >
        <Text style={[styles.triggerText, selectedTextStyle]}>
          {selectedValue || placeholder}
        </Text>
        <Text style={styles.icon}>{isOpen ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {isOpen && (
        <View
          style={[
            styles.menu,
            menuStyle,
            containerStyle?.width ? { width: containerStyle.width } : undefined,
          ]}
        >
          {options.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.option, optionStyle]}
              onPress={() => onSelect(item)}
            >
              <View style={styles.radioOuter}>
                {selectedValue === item && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.optionText, optionTextStyle]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {errors.length > 0 && (
        <View style={{ marginTop: 5 }}>
          {errors.map((error, index) => (
            <Text key={index} style={{ color: "red", fontSize: 12 }}>
              {error}
            </Text>
          ))}
        </View>
      )}
    </View>
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
    marginRight: 14,
  },
  trigger: {
    backgroundColor: Colors.light.buttonBackground,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 15,
    width: 333,
    marginTop: hp(1),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  triggerText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
  },
  icon: {
    color: Colors.light.white,
    fontSize: 14,
  },
  menu: {
    width: 333,
    backgroundColor: Colors.light.buttonBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginTop: 6,
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
});

export default CustomDropdown;
