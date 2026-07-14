import React, { type ReactElement, type ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { fonts } from "@/assets/fonts";

type FeatherIconName = keyof typeof Feather.glyphMap;

/** `default` = FlatList / More screen style. Sheet variants for action menus. */
export type MoreActionButtonVariant = "default" | "outline" | "sheet";

interface MoreActionButtonProps {
  title: string;
  description?: string;
  /** Custom icon element (e.g. `<ReferFriendIcon />`) or a Feather icon name */
  icon?: ReactNode | FeatherIconName;
  onPress?: () => void;
  isHighlighted?: boolean;
  iconSize?: number;
  /**
   * Visual style. Defaults to `default` (existing FlatList look).
   * - `outline`: dark fill + green border (sheet primary action)
   * - `sheet`: dark fill, no border (sheet secondary action)
   */
  variant?: MoreActionButtonVariant;
}

export default function MoreActionButton({
  title,
  description,
  icon,
  onPress,
  isHighlighted = false,
  iconSize = 20,
  variant = "default",
}: MoreActionButtonProps): ReactElement {
  const isSheetVariant = variant === "outline" || variant === "sheet";
  const iconColor = isHighlighted
    ? Colors.light.text
    : isSheetVariant
      ? Colors.light.white
      : Colors.light.icon;

  const renderIcon = (): ReactNode => {
    if (icon == null) return null;

    // Custom SVG / component icons passed as JSX
    if (React.isValidElement(icon)) {
      const iconElement = icon as React.ReactElement<{
        size?: number;
        color?: string;
        Color?: string;
      }>;

      return React.cloneElement(iconElement, {
        size: iconElement.props.size ?? iconSize,
        // Support both `color` and `Color` prop conventions used across icons
        color: iconElement.props.color ?? iconColor,
        Color: iconElement.props.Color ?? iconColor,
      });
    }

    // Feather icon name string
    if (typeof icon === "string") {
      return (
        <Feather
          name={icon as FeatherIconName}
          size={iconSize}
          color={iconColor}
        />
      );
    }

    return null;
  };

  const iconNode = renderIcon();

  const content = (
    <View
      style={[
        styles.contentContainer,
        isSheetVariant && styles.contentContainerSheet,
      ]}
    >
      {iconNode ? <View style={styles.icon}>{iconNode}</View> : null}
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            isHighlighted && styles.titleHighlighted,
            isSheetVariant && styles.titleSheet,
          ]}
        >
          {title}
        </Text>
        {description ? (
          <Text
            style={[
              styles.description,
              isHighlighted && styles.descriptionHighlighted,
            ]}
          >
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        variant === "default" && !isHighlighted && styles.defaultBackground,
        variant === "outline" && styles.outlineBackground,
        variant === "sheet" && styles.sheetBackground,
      ]}
      onPress={onPress}
    >
      {isHighlighted && variant === "default" ? (
        <LinearGradient
          colors={[Colors.light.white, Colors.light.subtext]}
          style={styles.gradientBackground}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  defaultBackground: {
    backgroundColor: Colors.light.greybuttonBackground,
  },
  outlineBackground: {
    backgroundColor: Colors.light.darkgrey,
    borderWidth: 1.5,
    borderColor: Colors.light.green,
    overflow: "visible",
  },
  sheetBackground: {
    backgroundColor: Colors.light.darkgrey,
  },
  gradientBackground: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  contentContainerSheet: {
    paddingVertical: 14,
    minHeight: 52,
  },
  icon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    textTransform: "uppercase",
  },
  titleSheet: {
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  titleHighlighted: {
    color: Colors.light.text,
  },
  description: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    marginTop: 4,
  },
  descriptionHighlighted: {
    color: Colors.light.subtext,
  },
});
