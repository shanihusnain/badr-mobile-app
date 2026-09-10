import React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TextStyle,
  ViewStyle,
  StyleProp,
  StyleSheet,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Controller } from "react-hook-form";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useTranslation } from "react-i18next";
import {
  ConfirmPasswordEyeIcon,
  PasswordEyeIcon,
} from "@/assets/icons";
interface CustomTextInputProps {
  label?: string;
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  showEye?: boolean;
  onToggleEye?: () => void;
  errors?: string[];
  success?: string[];
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  control?: any; // optional for react-hook-form usage
  name?: string; // optional for react-hook-form usage
  multiline?: boolean;
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "number-pad"
    | "decimal-pad"
    | "visible-password"
    | "ascii-capable"
    | "name-phone-pad"
    | "twitter"
    | "web-search";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maxLength?: number;
  editable?: boolean;
  selectTextOnFocus?: boolean;
  numberOfLines?: number;
  leftIcon?: React.ReactNode;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
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
  multiline = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  maxLength,
  editable,
  selectTextOnFocus,
  numberOfLines,
  leftIcon,
}) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const renderInput = (
    fieldValue?: string,
    fieldOnChange?: (value: string) => void,
  ) => {
    const actualValue = fieldValue ?? value ?? "";
    const handleChange = fieldOnChange ?? onChangeText;

    // Native secureTextEntry only shows platform dots; mask with asterisks instead.
    const displayValue = secureTextEntry
      ? "*".repeat(actualValue.length)
      : actualValue;

    const handleMaskedChange = (text: string) => {
      if (!handleChange) return;

      if (!secureTextEntry) {
        handleChange(text);
        return;
      }

      if (text.length < actualValue.length) {
        handleChange(actualValue.slice(0, text.length));
        return;
      }

      handleChange(actualValue + text.slice(actualValue.length));
    };

    return (
      <View style={styles.wrapper}>
        {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}
        <View
          style={[
            styles.inputWrapper,
            containerStyle,
            multiline && styles.multilineInputWrapper,
          ]}
        >
          {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
          <TextInput
            style={[
              styles.input,
              { textAlign: isRtl ? "right" : "left" },
              secureTextEntry && { fontFamily: fonts.primary.semiBold },
              multiline && styles.multilineTextInput,
              inputStyle,
            ]}
            placeholder={placeholder}
            placeholderTextColor={Colors.light.icon}
            value={displayValue}
            onChangeText={handleMaskedChange}
            secureTextEntry={false}
            multiline={multiline}
            keyboardType={keyboardType}
            autoCapitalize={secureTextEntry ? "none" : autoCapitalize}
            autoCorrect={false}
            spellCheck={false}
            textContentType={secureTextEntry || showEye ? "password" : undefined}
            autoComplete={secureTextEntry || showEye ? "password" : undefined}
            maxLength={maxLength}
            editable={editable}
            selectTextOnFocus={selectTextOnFocus}
            numberOfLines={numberOfLines}
            textAlignVertical={multiline ? "top" : "center"}
          />
          {showEye && onToggleEye && (
            <TouchableOpacity onPress={onToggleEye} style={styles.rightIcon}>
              {secureTextEntry ? (
                <ConfirmPasswordEyeIcon size={20} color={Colors.light.white} />
              ) : (
                <PasswordEyeIcon size={20} color={Colors.light.white} />
              )}
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
    );
  };

  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) =>
          renderInput(value, onChange)
        }
      />
    );
  }

  return renderInput();
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
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },
  leftIcon: {
    marginRight: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  rightIcon: {
    marginLeft: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  inputWrapper: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 48,
    marginTop: hp(1),
    flexDirection: "row",
    alignItems: "center",
  },
  multilineInputWrapper: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingVertical: hp(1.1),
  },
  multilineTextInput: {
    textAlignVertical: "top",
    paddingTop: hp(0.4),
    paddingBottom: hp(0.4),
  },
  label: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    marginTop: 0,
    alignSelf: "flex-start",
    marginRight: 14,
  },
  wrapper: {
    width: "98%",
  },
});
export default CustomTextInput;
