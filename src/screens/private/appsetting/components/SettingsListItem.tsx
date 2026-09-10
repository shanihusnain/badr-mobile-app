import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { appSettingStyles as styles } from "../styles";

type SettingItem = {
  id: string;
  title: string;
  icon: React.ReactNode;
};

type Props = {
  item: SettingItem;
};

export default function SettingsListItem({ item }: Props) {
  const router = useRouter();

  const handlePress = () => {
    if (item.id === "calendar") {
      router.push("/(private)/calendersettings");
    } else if (item.id === "ai") {
      router.push("/(private)/artificialintelligencesetting");
    } else if (item.id === "data_export") {
      router.push("/(private)/exportdata");
    } else if (item.id === "journal") {
      router.push("/(private)/journalappsetting");
    } else if (item.id === "notifications") {
      router.push("/(private)/notifications");
    } else if (item.id === "status_insights") {
      router.push("/(private)/statusinsights");
    } else if (item.id === "hide_metrics") {
      router.push("/(private)/hidemetrics");
    }
  };

  return (
    <Pressable key={item.id} style={styles.listItem} onPress={handlePress}>
      <View style={styles.listIconContainer}>
        {item.icon}
        <Text style={styles.listText}>{item.title}</Text>
      </View>
    </Pressable>
  );
}
