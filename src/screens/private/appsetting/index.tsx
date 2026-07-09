import React from "react";
import { ScrollView } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Colors } from "@/constants/theme";
import { appSettingStyles as styles } from "./styles";
import { CalendarIcon, InBoxArrow, JournalBookIcon, NotificationIcon, InsightIcon, EyeIcon } from "@/assets/icons";
import SettingsListItem from "./components/SettingsListItem";

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
  return (
    <BlackScreenWrapper>
      <ScrollView style={styles.content}>
        {SETTINGS.map((item) => (
          <SettingsListItem key={item.id} item={item} />
        ))}
      </ScrollView>
    </BlackScreenWrapper>
  );
}