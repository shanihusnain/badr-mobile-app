import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { hideMetricsStyles as styles } from "./style";
import { SwitchButton } from "@/components/atoms/SwitchButton";
import { useSharedValue } from "react-native-reanimated";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";

export default function HideMetricsScreen() {
    const hidePrayersEnabled = useSharedValue(false);
    const hideFastingEnabled = useSharedValue(false);
    const hideTimeSpentEnabled = useSharedValue(false);

    return (
        <BlackScreenWrapper>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hide Five Daily Prayers */}
                <View style={styles.settingBlock}>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingTitle}>HIDE FIVE DAILY PRAYERS</Text>
                        <SwitchButton
                            value={hidePrayersEnabled}
                            onPress={() => { hidePrayersEnabled.value = !hidePrayersEnabled.value; }}
                            trackColors={{ off: Colors.light.subtext, on: Colors.light.green }}
                            size="small"
                        />
                    </View>
                    <Text style={styles.settingDescription}>
                        This setting hides your daily prayer on-time metric, average prayer time, and other related metrics from the Home tab.
                    </Text>
                </View>


                {/* Hide Fasting Calendar */}
                <View style={styles.settingBlock}>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingTitle}>HIDE FASTING CALENDAR</Text>
                        <SwitchButton
                            value={hideFastingEnabled}
                            onPress={() => { hideFastingEnabled.value = !hideFastingEnabled.value; }}
                            trackColors={{ off: Colors.light.subtext, on: Colors.light.green }}
                            size="small"
                        />
                    </View>
                    <Text style={styles.settingDescription}>
                        This setting hides the fasting calendar on the Home tab, which shows when you have fasting goals. The data will still be available in the Fasting tab.
                    </Text>
                </View>

                {/* Hide Time Spent */}
                <View style={styles.settingBlock}>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingTitle}>HIDE TIME SPENT</Text>
                        <SwitchButton
                            value={hideTimeSpentEnabled}
                            onPress={() => { hideTimeSpentEnabled.value = !hideTimeSpentEnabled.value; }}
                            trackColors={{ off: Colors.light.subtext, on: Colors.light.green }}
                            size="small"
                        />
                    </View>
                    <Text style={styles.settingDescription}>
                        This setting hides the Time Spent graph on the Home tab, which provides insights into the time you spent overall on your acts of worship. It will also remove the Time Spent step when logging your goals.
                    </Text>
                </View>
            </ScrollView>
        </BlackScreenWrapper>
    );
}
