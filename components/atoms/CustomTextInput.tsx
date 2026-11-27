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
  Platform,
} from "react-native";
import { Controller } from "react-hook-form";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useTranslation } from "react-i18next";
import { ConfirmPasswordEyeIcon, PasswordEyeIcon } from "@/assets/icons";
import { ms } from "@/src/utils/responsive";
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
            cursorColor={Colors.light.green}
            textContentType={
              secureTextEntry || showEye ? "password" : undefined
            }
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
                <ConfirmPasswordEyeIcon
                  size={ms(20)}
                  color={Colors.light.white}
                />
              ) : (
                <PasswordEyeIcon size={ms(20)} color={Colors.light.white} />
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
    fontSize: ms(11),
    marginTop: ms(8),
  },
  errorMsg: {
    color: Colors.light.red,
    fontFamily: fonts.primary.semiBold,
    fontSize: ms(11),
    marginTop: ms(8),
    alignSelf: "flex-start",
  },
  input: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: ms(12),
    // Avoid height/lineHeight on single-line inputs — iOS shifts typed glyphs
    // off the visual center relative to a centered leftIcon.
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
    ...Platform.select({
      ios: {
        // Optical nudge so custom fonts sit on the same axis as 20pt icons.
        paddingTop: ms(1),
      },
      default: {},
    }),
  },
  leftIcon: {
    marginRight: ms(6),
    justifyContent: "center",
    alignItems: "center",
  },
  rightIcon: {
    marginLeft: ms(6),
    justifyContent: "center",
    alignItems: "center",
  },
  inputWrapper: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: ms(6),
    paddingHorizontal: ms(12),
    height: ms(48),
    marginTop: ms(8),
    flexDirection: "row",
    alignItems: "center",
  },
  multilineInputWrapper: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingVertical: ms(9),
  },
  multilineTextInput: {
    textAlignVertical: "top",
    paddingTop: ms(3),
    paddingBottom: ms(3),
  },
  label: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: ms(12),
    marginTop: 0,
    alignSelf: "flex-start",
    marginRight: ms(14),
  },
  wrapper: {
    width: "98%",
  },
});
export default CustomTextInput;
