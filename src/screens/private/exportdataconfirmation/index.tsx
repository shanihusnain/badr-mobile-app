import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { exportDataConfirmationStyles as styles } from "./style";
import { useRouter } from "expo-router";

export default function ExportDataConfirmationScreen() {
    const router = useRouter();

    const handleClose = () => {
        // Navigate back to app setting screen
        router.push("/(private)/appsetting");
    };

    const handleGetHelp = () => {
        // Handle get help action
    };

    return (
        <BlackScreenWrapper>

            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>PREPARING YOUR FILES</Text>
                    <Text style={styles.cardText}>
                        You'll receive an email when your export is
                        done, which can take up to 24 hours. You can
                        request one export per day. Export requested
                        on January 24, 12:56 PM.
                    </Text>
                    <Pressable style={styles.linkRow} onPress={handleGetHelp}>
                        <Text style={styles.linkText}>GET HELP</Text>
                        <Feather name="chevron-right" size={16} color={Colors.light.white} />
                    </Pressable>
                </View>
            </ScrollView>
        </BlackScreenWrapper>
    );
}
