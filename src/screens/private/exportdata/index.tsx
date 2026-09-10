import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { exportDataStyles as styles } from "./style";
import { useRouter } from "expo-router";
import SecondaryButton from "@/components/atoms/Secondary-button";

export default function ExportDataScreen() {
    const router = useRouter();

    // Dummy email for display, should be replaced with actual user email
    const userEmail = "laylanajia@gmail.com";

    const handleBack = () => {
        router.back();
    };

    const handleLearnMore = () => {
        // Handle learn more action
    };

    const handleUpdateAccount = () => {
        router.push("/(private)/changeemailid");
    };

    const handleCreateExport = () => {
        router.push("/(private)/exportdataconfirmation");
    };

    return (
        <BlackScreenWrapper>

            <ScrollView style={styles.content}>
                <Text style={styles.descriptionText}>
                    Export a complete archive of your monthly goals
                    and journal data by submitting a request below.
                    This is your data, and we take your privacy seriously.
                </Text>

                <Pressable style={styles.linkRow} onPress={handleLearnMore}>
                    <Text style={styles.linkText}>LEARN MORE</Text>
                    <Feather name="chevron-right" size={16} color={Colors.light.white} />
                </Pressable>

                <Text style={styles.descriptionText}>
                    Your export will be sent to your account email
                    address once ready. You can update your account
                    if this email is incorrect:{" "}
                    <Text style={styles.emailText}>{userEmail}</Text>
                </Text>

                <Pressable style={styles.linkRow} onPress={handleUpdateAccount}>
                    <Text style={styles.linkText}>UPDATE YOUR ACCOUNT</Text>
                    <Feather name="chevron-right" size={16} color={Colors.light.white} />
                </Pressable>
            </ScrollView>

            <View style={styles.bottomContainer}>
                <SecondaryButton
                    text="CREATE EXPORT"
                    onPress={handleCreateExport}
                    variant="green"
                />
            </View>
        </BlackScreenWrapper>
    );
}
