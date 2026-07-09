import React from "react";
import { ScrollView, Text } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { notificationsStyles as styles } from "./style";
import { useSharedValue } from "react-native-reanimated";
import NotificationItemCard from "./components/NotificationItemCard";

export default function NotificationsScreen() {
    const dailyGoalEnabled = useSharedValue(true);
    const missedCheckInEnabled = useSharedValue(true);
    const countdownEnabled = useSharedValue(true);
    const journalingEnabled = useSharedValue(true);

    const notifications = [
        {
            title: "DAILY GOAL SUMMARY",
            description: (
                <>
                    <Text style={styles.boldText}>Badr</Text> provides a daily summary of your progress\n
toward your monthly goals.
                </>
            ),
            value: dailyGoalEnabled,
            onToggle: () => {
                dailyGoalEnabled.value = !dailyGoalEnabled.value;
            },
        },
        {
            title: "MISSED CHECK-INS",
            description: "Get notified when you don't log progress toward\nyour goals for over 3 days.",
            value: missedCheckInEnabled,
            onToggle: () => {
                missedCheckInEnabled.value = !missedCheckInEnabled.value;
            },
        },
        {
            title: "COUNTDOWN ALERT",
            description: "Get notified as your monthly goal cycle nears\nits end, helping you stay on track before time\nruns out.",
            value: countdownEnabled,
            onToggle: () => {
                countdownEnabled.value = !countdownEnabled.value;
            },
        },
        {
            title: "JOURNALING REMINDER",
            description: "We notify you if you miss filling out your daily\njournal, encouraging consistent reflection.",
            value: journalingEnabled,
            onToggle: () => {
                journalingEnabled.value = !journalingEnabled.value;
            },
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
