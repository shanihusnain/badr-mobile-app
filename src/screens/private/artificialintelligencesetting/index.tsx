import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { aiSettingStyles as styles } from "./style";
import { useRouter } from "expo-router";
import { SwitchButton } from "@/components/atoms/SwitchButton";
import { useSharedValue } from "react-native-reanimated";

export default function ArtificialIntelligenceSettingScreen() {
    const router = useRouter();
    const memoryEnabled = useSharedValue(true);

    const handleToggleMemory = () => {
        memoryEnabled.value = !memoryEnabled.value;
    };

    const handleBack = () => {
        router.back();
    };

    const handleLearnMore = () => {
        // Handle learn more action, e.g. open webview or privacy policy screen
    };

    return (
        <BlackScreenWrapper>

            <ScrollView style={styles.content}>
                <View style={styles.memoryRow}>
                    <Text style={styles.sectionTitle}>MEMORY</Text>
                    <SwitchButton
                        value={memoryEnabled}
                        onPress={handleToggleMemory}
                        trackColors={{ off: Colors.light.subtext, on: Colors.light.dullWhiteOpacity }}
                        thumbColors={{ off: Colors.light.white, on: Colors.light.green }}
                        size="small"
                    />
                </View>

                <Text style={styles.descriptionText}>
                    Allow <Text style={styles.boldText}>Badr</Text> to remember details from past{"\n"}
                    conversations to provide personalized guidance.
                </Text>

                <Text style={styles.descriptionText}>
                    All data is stored securely by <Text style={styles.boldText}>Badr</Text> and never shared{"\n"}
                    with a third party.
                </Text>

                <View style={styles.separator} />

                <View style={styles.privacyCard}>
                    <Text style={styles.privacyTitle}>DATA PRIVACY</Text>
                    <Text style={styles.privacyText}>
                        We strive to empower you on your journey to draw closer to Allah (SWT), while protecting your personal data. Read more about our commitment to Data Privacy.
                    </Text>
                    <Pressable style={styles.learnMoreRow} onPress={handleLearnMore}>
                        <Text style={styles.learnMoreText}>LEARN MORE</Text>
                        <Feather name="chevron-right" size={16} color={Colors.light.white} />
                    </Pressable>
                </View>
            </ScrollView>
        </BlackScreenWrapper>
    );
}
