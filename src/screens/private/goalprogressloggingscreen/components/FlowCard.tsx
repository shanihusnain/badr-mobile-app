import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "@/constants/theme";
import { useTranslation } from "react-i18next";

type FlowCardProps = {
  headerIcon: React.ReactNode;
  headerLabel: string;
  children: React.ReactNode;
  onBack: () => void;
  onForward: () => void;
  onConfirm: () => void;
  canGoForward: boolean;
  canConfirm?: boolean;
  styles: any;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export const FlowCard: React.FC<FlowCardProps> = ({
  headerIcon,
  headerLabel,
  children,
  onBack,
  onForward,
  onConfirm,
  canGoForward,
  canConfirm = true,
  styles,
  style,
  contentStyle,
}) => {
  const { i18n } = useTranslation();
  const iconColorsDecider = () =>
    canGoForward ? Colors.light.white : Colors.light.subtext;
  const forwardBtnStyleDecider = () => {
    return [styles.navButton, !canGoForward && styles.navButtonDisabled];
  };
  return (
    <View style={[styles.flowCard, style]}>
      <View style={styles.flowHeader}>
        <View style={styles.flowIconCircle}>{headerIcon}</View>
        <Text style={styles.flowHeaderText}>{headerLabel}</Text>
      </View>

      <View style={[styles.flowContent, contentStyle]}>{children}</View>

      <View style={styles.flowFooter}>
        <View style={styles.navGroup}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <FontAwesome
              name={i18n.language === "ar" ? "chevron-right" : "chevron-left"}
              size={12}
              color={Colors.light.white}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={forwardBtnStyleDecider()}
            onPress={onForward}
            disabled={!canGoForward}
            activeOpacity={0.8}
          >
            <FontAwesome
              name={i18n.language === "ar" ? "chevron-left" : "chevron-right"}
              size={12}
              color={iconColorsDecider()}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            !canConfirm && styles.navButtonDisabled,
          ]}
          onPress={onConfirm}
          disabled={!canConfirm}
          activeOpacity={0.8}
        >
          <Ionicons
            name="checkmark"
            size={18}
            color={canConfirm ? Colors.light.white : Colors.light.subtext}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
