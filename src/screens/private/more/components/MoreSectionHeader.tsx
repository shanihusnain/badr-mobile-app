import React from "react";
import { View, Text } from "react-native";
import { moreSectionHeaderStyles as styles } from "../style";

interface MoreSectionHeaderProps {
  title: string;
}

export default function MoreSectionHeader({ title }: MoreSectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}
