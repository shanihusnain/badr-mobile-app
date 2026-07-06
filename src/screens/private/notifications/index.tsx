import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Colors } from "@/constants/theme";
import { notificationsStyles as styles } from "./style";
import { useRouter } from "expo-router";
import { SwitchButton } from "@/components/atoms/SwitchButton";
import { useSharedValue } from "react-native-reanimated";

export default function NotificationsScreen() {
    const router = useRouter();
    
    const dailyGoalEnabled = useSharedValue(true);
    const missedCheckInEnabled = useSharedValue(true);
    const countdownEnabled = useSharedValue(true);
    const journalingEnabled = useSharedValue(true);

    const handleClose = () => {
        router.back();
    };

    return (
        <BlackScreenWrapper>
            <ScrollView style={styles.content}>
                <View style={styles.notificationItem}>
                    <View style={styles.row}>
                        <Text style={styles.sectionTitle}>DAILY GOAL SUMMARY</Text>
                        <SwitchButton
                            value={dailyGoalEnabled}
                            onPress={() => { dailyGoalEnabled.value = !dailyGoalEnabled.value; }}
                            trackColors={{ off: Colors.light.subtext, on: Colors.light.green }}
                            size="small"
                        />
                    </View>
                    <Text style={styles.descriptionText}>
                        <Text style={styles.boldText}>Badr</Text> provides a daily summary of your progress{"\n"}
                        toward your monthly goals.
                    </Text>
                </View>

                <View style={styles.notificationItem}>
                    <View style={styles.row}>
                        <Text style={styles.sectionTitle}>MISSED CHECK-INS</Text>
                        <SwitchButton
                            value={missedCheckInEnabled}
                            onPress={() => { missedCheckInEnabled.value = !missedCheckInEnabled.value; }}
                            trackColors={{ off: Colors.light.subtext, on: Colors.light.green }}
                            size="small"
                        />
                    </View>
                    <Text style={styles.descriptionText}>
                        Get notified when you don't log progress toward{"\n"}
                        your goals for over 3 days.
                    </Text>
                </View>

                <View style={styles.notificationItem}>
                    <View style={styles.row}>
                        <Text style={styles.sectionTitle}>COUNTDOWN ALERT</Text>
                        <SwitchButton
                            value={countdownEnabled}
                            onPress={() => { countdownEnabled.value = !countdownEnabled.value; }}
                            trackColors={{ off: Colors.light.subtext, on: Colors.light.green }}
                            size="small"
                        />
                    </View>
                    <Text style={styles.descriptionText}>
                        Get notified as your monthly goal cycle nears{"\n"}
                        its end, helping you stay on track before time{"\n"}
                        runs out.
                    </Text>
                </View>

                <View style={styles.notificationItem}>
                    <View style={styles.row}>
                        <Text style={styles.sectionTitle}>JOURNALING REMINDER</Text>
                        <SwitchButton
                            value={journalingEnabled}
                            onPress={() => { journalingEnabled.value = !journalingEnabled.value; }}
                            trackColors={{ off: Colors.light.subtext, on: Colors.light.green }}
                            size="small"
                        />
                    </View>
                    <Text style={styles.descriptionText}>
                        We notify you if you miss filling out your daily{"\n"}
                        journal, encouraging consistent reflection.
                    </Text>
                </View>
            </ScrollView>
        </BlackScreenWrapper>
    );
}
