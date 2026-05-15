import React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TextStyle,
  ViewStyle,
  StyleSheet,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Controller } from "react-hook-form";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
interface CustomTextInputProps {
  label?: string;
  placeholder: string;
  value?: string;
  // onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  showEye?: boolean;
  onToggleEye?: () => void;
  errors?: string[];
  success?: string[];
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  labelStyle?: TextStyle;
  control: any; // react-hook-form control
  name: string; // name of the field for react-hook-form
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  placeholder,
  value,
  // onChangeText,
  secureTextEntry = false,
  showEye = false,
  onToggleEye,
  errors = [],
  success = [],
  containerStyle,
  inputStyle,
  labelStyle,
  control,
  name,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={styles.wrapper}>
          {label ? (
            <Text style={[styles.label, labelStyle]}>{label}</Text>
          ) : null}
          <View style={[styles.inputWrapper, containerStyle]}>
            <View style={styles.flex1}>
              <TextInput
                style={[
                  styles.input,
                  //inputStyle,
                ]}
                placeholder={placeholder}
                placeholderTextColor={Colors.light.icon}
                value={value}
                onChangeText={onChange}
                secureTextEntry={secureTextEntry}
              />
            </View>
            {showEye && onToggleEye && (
              <TouchableOpacity onPress={onToggleEye}>
                <Text style={{ fontSize: 16, color: Colors.light.white }}>
                  👁️
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {errors.length > 0 && (
            <Text style={styles.errorMsg}>{errors.join(", ")}</Text>
          )}
          {success.length > 0 && (
            <Text style={styles.successMsg}>{success.join(", ")}</Text>
          )}
        </View>
      )}
    />
  );
};
const styles = StyleSheet.create({
  successMsg: {
    color: "#4CAF50",
    // Green color for success
    fontFamily: fonts.primary.semiBold,
    fontSize: 11,
    marginTop: hp(1),
  },
  errorMsg: {
    color: Colors.light.red,
    fontFamily: fonts.primary.semiBold,
    fontSize: 11,
    marginTop: hp(1),
    alignSelf: "flex-start",
  },
  input: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
  },
  flex1: {
    flex: 1,
  },
  inputWrapper: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginTop: hp(1),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    marginTop: hp(2),
    alignSelf: "flex-start",
    marginRight: 14,
  },
  wrapper: {
    width: "98%",
  },
});
export default CustomTextInput;
