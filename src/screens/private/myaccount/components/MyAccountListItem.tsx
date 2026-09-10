import React from "react";
import { View, Text, Pressable } from "react-native";
import { myAccountStyles as styles } from "../style";

type MyAccountListItemProps = {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
};

export default function MyAccountListItem({
  title,
  subtitle,
  icon,
  onPress,
}: MyAccountListItemProps) {
  return (
    <Pressable style={styles.listCard} onPress={onPress}>
      <View style={styles.listIconContainer}>{icon}</View>
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemTitle}>{title}</Text>
        {subtitle ? <Text style={styles.listItemSubtitle}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}
