import React, { type ReactNode } from "react";
import { View, Text, Pressable } from "react-native";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { moreListItemStyles as styles } from "../style";

interface MoreListItemProps {
  title: string;
  description?: string;
  icon: ReactNode | keyof typeof Feather.glyphMap;
  onPress?: () => void;
  isHighlighted?: boolean;
}

export default function MoreListItem({
  title,
  description,
  icon,
  onPress,
  isHighlighted = false,
}: MoreListItemProps) {
  const iconColor = isHighlighted ? Colors.light.text : Colors.light.icon;

  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      const iconElement = icon as React.ReactElement<{
        size?: number;
        color?: string;
        Color?: string;
      }>;
      const iconProps = iconElement.props;
      const nextSize = iconProps.size ?? 20;
      const nextColor = iconProps.color ?? iconProps.Color ?? iconColor;

      return React.cloneElement(iconElement, {
        size: nextSize,
        ...(iconProps.Color !== undefined ? { Color: nextColor } : { color: nextColor }),
      });
    }

    return (
      <Feather
        name={icon as keyof typeof Feather.glyphMap}
        size={20}
        color={iconColor}
      />
    );
  };

  const content = (
    <View style={styles.contentContainer}>
      <View style={styles.icon}>{renderIcon()}</View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, isHighlighted && styles.titleHighlighted]}>
          {title}
        </Text>
        {description && (
          <Text
            style={[
              styles.description,
              isHighlighted && styles.descriptionHighlighted,
            ]}
          >
            {description}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        !isHighlighted && styles.defaultBackground,
      ]}
      onPress={onPress}
    >
      {isHighlighted ? (
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
