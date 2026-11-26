import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Colors } from "@/constants/theme";
import { privacySettingStyles as styles } from "./style";
import { SwitchButton } from "@/components/atoms/SwitchButton";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { useSettingsBoolean } from "@/src/hooks/useSettingsBoolean";

export default function PrivacySettingScreen() {
  const { value: receiveTeamInvitation, toggle: toggleReceiveTeamInvitation } =
    useSettingsBoolean("receiveTeamInvitation", true);

  const handleDeleteAccount = () => {
    // Handle delete account action
  };

  return (
    <BlackScreenWrapper>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>CONNECT</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.settingBlock}>
          <View style={styles.settingRow}>
            <Text style={styles.settingTitle}>RECEIVE TEAM INVITATION</Text>
            <SwitchButton
              value={receiveTeamInvitation}
              onPress={toggleReceiveTeamInvitation}
              trackColors={{
                off: Colors.light.subtext,
                on: Colors.light.green,
              }}
              size="small"
            />
          </View>
          <Text style={styles.settingDescription}>
            Allow other members to invite you to teams.
          </Text>
        </View>

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
