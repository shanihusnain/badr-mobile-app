import React from "react";
import { View, Text, Pressable } from "react-native";
import { badarMembershipStyles as styles } from "../style";

type MembershipActionItemProps = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => void;
};

export default function MembershipActionItem({
  title,
  subtitle,
  icon,
  onPress,
}: MembershipActionItemProps) {
  return (
    <Pressable style={styles.actionCard} onPress={onPress}>
      <View style={styles.actionIconContainer}>{icon}</View>
      <View style={styles.actionTextContainer}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}
