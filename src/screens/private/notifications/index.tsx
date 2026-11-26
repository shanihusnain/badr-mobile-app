import React from "react";
import { ScrollView, Text } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { notificationsStyles as styles } from "./style";
import NotificationItemCard from "./components/NotificationItemCard";
import { useSettingsBoolean } from "@/src/hooks/useSettingsBoolean";

export default function NotificationsScreen() {
  const dailyGoal = useSettingsBoolean("dailyGoalSummary", true);
  const missedCheckIns = useSettingsBoolean("missedCheckIns", true);
  const countdown = useSettingsBoolean("countdownAlert", true);
  const journaling = useSettingsBoolean("journalingReminder", true);

  const notifications = [
    {
      title: "DAILY GOAL SUMMARY",
      description: (
        <>
          <Text style={styles.boldText}>Badr</Text> provides a daily summary of
          your progress toward your monthly goals.
        </>
      ),
      value: dailyGoal.value,
      onToggle: dailyGoal.toggle,
    },
    {
      title: "MISSED CHECK-INS",
      description:
        "Get notified when you don't log progress toward your goals for over 3 days.",
      value: missedCheckIns.value,
      onToggle: missedCheckIns.toggle,
    },
    {
      title: "COUNTDOWN ALERT",
      description:
        "Get notified as your monthly goal cycle nears its end, helping you stay on track before time runs out.",
      value: countdown.value,
      onToggle: countdown.toggle,
    },
    {
      title: "JOURNALING REMINDER",
      description:
        "We notify you if you miss filling out your daily journal, encouraging consistent reflection.",
      value: journaling.value,
      onToggle: journaling.toggle,
    },
  ];

  return (
    <BlackScreenWrapper>
      <ScrollView style={styles.content}>
        {notifications.map((item) => (
          <NotificationItemCard
            key={item.title}
            title={item.title}
            description={item.description}
            value={item.value}
            onToggle={item.onToggle}
          />
        ))}
      </ScrollView>
    </BlackScreenWrapper>
  );
}
