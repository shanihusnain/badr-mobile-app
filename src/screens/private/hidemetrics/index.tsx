import React from "react";
import { ScrollView } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { hideMetricsStyles as styles } from "./style";
import SettingCard from "./components/SettingCard";
import { useSettingsBoolean } from "@/src/hooks/useSettingsBoolean";

export default function HideMetricsScreen() {
  const prayers = useSettingsBoolean("hideFiveDailyPrayers", false);
  const fasting = useSettingsBoolean("hideFastingCalendar", false);
  const timeSpent = useSettingsBoolean("hideTimeSpent", false);

  const settings = [
    {
      title: "HIDE FIVE DAILY PRAYERS",
      description:
        "This setting hides your daily prayer on-time metric, average prayer time, and other related metrics from the Home tab.",
      value: prayers.value,
      onToggle: prayers.toggle,
    },
    {
      title: "HIDE FASTING CALENDAR",
      description:
        "This setting hides the fasting calendar on the Home tab, which shows when you have fasting goals. The data will still be available in the Fasting tab.",
      value: fasting.value,
      onToggle: fasting.toggle,
    },
    {
      title: "HIDE TIME SPENT",
      description:
        "This setting hides the Time Spent graph on the Home tab, which provides insights into the time you spent overall on your acts of worship. It will also remove the Time Spent step when logging your goals.",
      value: timeSpent.value,
      onToggle: timeSpent.toggle,
    },
  ];

  return (
    <BlackScreenWrapper>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settings.map((setting) => (
          <SettingCard
            key={setting.title}
            title={setting.title}
            description={setting.description}
            value={setting.value}
            onToggle={setting.onToggle}
          />
        ))}
      </ScrollView>
    </BlackScreenWrapper>
  );
}
