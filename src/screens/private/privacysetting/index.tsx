import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { privacySettingStyles as styles } from "./style";
import { useRouter } from "expo-router";
import { SwitchButton } from "@/components/atoms/SwitchButton";
import { useSharedValue } from "react-native-reanimated";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";

export default function PrivacySettingScreen() {
    const router = useRouter();

    const receiveTeamInvitation = useSharedValue(true);

    const handleClose = () => {
        router.back();
    };

    const handleDeleteAccount = () => {
        // Handle delete account action
    };

    return (
        <BlackScreenWrapper>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* CONNECT Section */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionLabel}>CONNECT</Text>
                    <View style={styles.sectionLine} />
                </View>

                <View style={styles.settingBlock}>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingTitle}>RECEIVE TEAM INVITATION</Text>
                        <SwitchButton
                            value={receiveTeamInvitation}
                            onPress={() => { receiveTeamInvitation.value = !receiveTeamInvitation.value; }}
                            trackColors={{ off: Colors.light.subtext, on: Colors.light.green }}
                            size="small"
                        />
                    </View>
                    <Text style={styles.settingDescription}>
                        Allow other members to invite you to teams.
                    </Text>
                </View>

                {/* DEACTIVATION Section */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionLabel}>DEACTIVATION</Text>
                    <View style={styles.sectionLine} />
                </View>

                <View style={styles.deleteButtonContainer}>
                    <SecondaryButton
                        text="DELETE YOUR BADR ACCOUNT"
                        onPress={handleDeleteAccount}
                        variant="green"
                    />
                </View>

            </ScrollView>
        </BlackScreenWrapper>
    );
}
