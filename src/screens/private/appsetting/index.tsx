import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { appSettingStyles as styles } from "./styles";
import { useRouter } from "expo-router";
import { CalendarIcon, InBoxArrow, JournalBookIcon, NotificationIcon, InsightIcon, EyeIcon } from "@/assets/icons";

type SettingItem = {
  id: string;
  title: string;
  icon: React.ReactNode;
};

const SETTINGS: SettingItem[] = [
  { id: "calendar", title: "CALENDAR SETTINGS", icon: <CalendarIcon size={24} color={Colors.light.subtext} /> },
  { id: "ai", title: "AI SETTINGS", icon: <InBoxArrow size={24} color={Colors.light.subtext} /> },
  { id: "data_export", title: "DATA EXPORT", icon: <InBoxArrow size={24} color={Colors.light.subtext} /> },
  { id: "journal", title: "JOURNAL", icon: < JournalBookIcon size={24} color={Colors.light.subtext} /> },
  { id: "notifications", title: "NOTIFICATIONS", icon: <NotificationIcon size={24} color={Colors.light.subtext} /> },
  { id: "status_insights", title: "STATUS INSIGHTS", icon: <InsightIcon size={24} color={Colors.light.subtext} /> },
  { id: "hide_metrics", title: "HIDE METRICS", icon: <EyeIcon size={24} color={Colors.light.subtext} /> },
];

export default function AppSettingScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <BlackScreenWrapper>
      <ScrollView style={styles.content}>
        {SETTINGS.map((item) => (
          <Pressable
            key={item.id}
            style={styles.listItem}
            onPress={() => {
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
            }}
          >
            <View style={styles.listIconContainer}>
              {item.icon}
              <Text style={styles.listText}>{item.title}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </BlackScreenWrapper>
  );
}