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
  canGoBack?: boolean;
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
  canGoBack = true,
  canConfirm = true,
  styles,
  style,
  contentStyle,
}) => {
  const { i18n } = useTranslation();
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
            style={[styles.navButton, !canGoBack && { opacity: 0.65 }]}
            onPress={onBack}
            disabled={!canGoBack}
            activeOpacity={0.8}
          >
            <View style={styles.navButtonIconWrap}>
              <FontAwesome
                name={i18n.language === "ar" ? "chevron-right" : "chevron-left"}
                size={12}
                color={
                  canGoBack ? Colors.light.white : Colors.light.white + "E6"
                }
                style={styles.navButtonIcon}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, !canGoForward && { opacity: 0.65 }]}
            onPress={onForward}
            disabled={!canGoForward}
            activeOpacity={0.8}
          >
            <View style={styles.navButtonIconWrap}>
              <FontAwesome
                name={i18n.language === "ar" ? "chevron-left" : "chevron-right"}
                size={12}
                color={
                  canGoForward ? Colors.light.white : Colors.light.white + "E6"
                }
                style={styles.navButtonIcon}
              />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            canConfirm && styles.confirmButtonActive,
            !canConfirm && styles.navButtonDisabled,
          ]}
          onPress={onConfirm}
          disabled={!canConfirm}
          activeOpacity={0.8}
        >
          <Ionicons
            name="checkmark"
            size={17}
            color={canConfirm ? Colors.light.white : Colors.light.white + "CC"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
