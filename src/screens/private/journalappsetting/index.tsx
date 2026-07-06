import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { journalAppSettingStyles as styles } from "./style";
import { useRouter } from "expo-router";
import { SwitchButton } from "@/components/atoms/SwitchButton";
import { useSharedValue } from "react-native-reanimated";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";

export default function JournalAppSettingScreen() {
    const router = useRouter();
    const journalEnabled = useSharedValue(true);

    const handleToggleJournal = () => {
        journalEnabled.value = !journalEnabled.value;
    };

    const handleCustomizeJournal = () => {
        // Handle customize journal action
    };

    return (
        <BlackScreenWrapper>
            <ScrollView style={styles.content}>
                <View style={styles.row}>
                    <Text style={styles.sectionTitle}>JOURNAL</Text>
                    <SwitchButton
                        value={journalEnabled}
                        onPress={handleToggleJournal}
                        trackColors={{ off: Colors.light.subtext, on: Colors.light.green }}
                        size="small"
                    />
                </View>

                <Text style={styles.descriptionText}>
                    Track and analyze how various behaviors and{"\n"}
                    practices affect your <Text style={styles.boldText}>Badr</Text> data.
                </Text>

                <Pressable style={styles.customizeButton} onPress={handleCustomizeJournal}>
                    <Feather name="sliders" size={18} color={Colors.light.subtext} style={styles.customizeIcon} />
                    <Text style={styles.customizeText}>CUSTOMIZE JOURNAL</Text>
                </Pressable>
            </ScrollView>
        </BlackScreenWrapper>
    );
}
