import React from "react";
import { ScrollView } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { hideMetricsStyles as styles } from "./style";
import SettingCard from "./components/SettingCard";

export default function HideMetricsScreen() {
    const hidePrayersEnabled = useSharedValue(false);
    const hideFastingEnabled = useSharedValue(false);
    const hideTimeSpentEnabled = useSharedValue(false);

    const settings = [
        {
            title: "HIDE FIVE DAILY PRAYERS",
            description:
                "This setting hides your daily prayer on-time metric, average prayer time, and other related metrics from the Home tab.",
            value: hidePrayersEnabled,
            onToggle: () => {
                hidePrayersEnabled.value = !hidePrayersEnabled.value;
            },
        },
        {
            title: "HIDE FASTING CALENDAR",
            description:
                "This setting hides the fasting calendar on the Home tab, which shows when you have fasting goals. The data will still be available in the Fasting tab.",
            value: hideFastingEnabled,
            onToggle: () => {
                hideFastingEnabled.value = !hideFastingEnabled.value;
            },
        },
        {
            title: "HIDE TIME SPENT",
            description:
                "This setting hides the Time Spent graph on the Home tab, which provides insights into the time you spent overall on your acts of worship. It will also remove the Time Spent step when logging your goals.",
            value: hideTimeSpentEnabled,
            onToggle: () => {
                hideTimeSpentEnabled.value = !hideTimeSpentEnabled.value;
            },
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
