import React from "react";
import { View, Text, Pressable } from "react-native";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { moreListItemStyles as styles } from "../style";

interface MoreListItemProps {
  title: string;
  description?: string;
  icon: keyof typeof Feather.glyphMap;
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
  const content = (
    <View style={styles.contentContainer}>
      <Feather
        name={icon}
        size={20}
        color={isHighlighted ? Colors.light.text : Colors.light.icon}
        style={styles.icon}
      />
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
          colors={["#FFFFFF", "#999999"]}
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
