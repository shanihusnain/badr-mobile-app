import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/constants/theme";
import { useTranslation } from "react-i18next";
import {
  FlowCardChevronBackIcon,
  FlowCardChevronForwardIcon,
} from "@/assets/icons";

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
  /** When false, hides the checkmark confirm button (e.g. mid-flow steps). */
  showConfirmButton?: boolean;
  /** When false, hides back/forward/confirm row (e.g. open log-type menu). */
  showFooter?: boolean;
  /** Grow with content instead of fixed FLOW_CARD_HEIGHT. */
  autoHeight?: boolean;
  styles: any;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  /** Keep header label on one line (shrink if needed). */
  headerSingleLine?: boolean;
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
  showConfirmButton = true,
  showFooter = true,
  autoHeight = false,
  styles,
  style,
  contentStyle,
  headerStyle,
  headerSingleLine = false,
}) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const BackIcon = isRtl ? FlowCardChevronForwardIcon : FlowCardChevronBackIcon;
  const ForwardIcon = isRtl
    ? FlowCardChevronBackIcon
    : FlowCardChevronForwardIcon;

  return (
    <View
      style={[autoHeight ? styles.flowCardAutoHeight : styles.flowCard, style]}
    >
      <View style={[styles.flowHeader, headerStyle]}>
        <View style={styles.flowIconCircle}>{headerIcon}</View>
        <Text
          style={styles.flowHeaderText}
          numberOfLines={headerSingleLine ? 1 : 2}
          // adjustsFontSizeToFit
          // minimumFontScale={headerSingleLine ? 0.85 : 0.8}
        >
          {headerLabel}
        </Text>
      </View>

      <View style={[styles.flowContent, contentStyle]}>{children}</View>

      {showFooter ? (
        <View style={styles.flowFooter}>
          <View style={styles.navGroup}>
            <TouchableOpacity
              style={[styles.navButton, !canGoBack && { opacity: 0.65 }]}
              onPress={onBack}
              disabled={!canGoBack}
              activeOpacity={0.8}
            >
              <BackIcon
                Size={8}
                Color={
                  canGoBack ? Colors.light.white : Colors.light.white + "E6"
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, !canGoForward && { opacity: 0.65 }]}
              onPress={onForward}
              disabled={!canGoForward}
              activeOpacity={0.8}
            >
              <ForwardIcon
                Size={8}
                Color={
                  canGoForward ? Colors.light.white : Colors.light.white + "E6"
                }
              />
            </TouchableOpacity>
          </View>

          {showConfirmButton ? (
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
                color={
                  canConfirm ? Colors.light.white : Colors.light.white + "CC"
                }
              />
            </TouchableOpacity>
          ) : (
            // Keep footer height/alignment identical to time steps (confirm has
            // translateY + larger hit area), so nav chevrons don't jump.
            <View style={styles.confirmButtonPlaceholder} />
          )}
        </View>
      ) : null}
    </View>
  );
};
