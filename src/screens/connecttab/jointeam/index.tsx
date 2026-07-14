import { fonts } from "@/assets/fonts";
import PrimaryButton from "@/components/atoms/Primary-button";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { Colors } from "@/constants/theme";
import { TeamMemberRow } from "@/src/screens/private/teamprofile/components/TeamMemberRow";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  buildJoinedTeam,
  lookupTeamByInviteCode,
} from "./inviteTeamMockData";

export const JoinTeamScreen = () => {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ inviteCode?: string }>();

  const team = useMemo(
    () => lookupTeamByInviteCode(params.inviteCode ?? "COMM-0A2687"),
    [params.inviteCode],
  );

  if (!team) {
    return (
      <View style={styles.screen}>
        <Text style={styles.errorText}>
          Team not found for this invite code.
        </Text>
        <View style={styles.errorAction}>
          <PrimaryButton text="GO BACK" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const memberCountLabel = `${team.members.length} MEMBER${
    team.members.length === 1 ? "" : "S"
  }`;

  const handleJoin = () => {
    const joined = buildJoinedTeam(team);
    router.replace({
      pathname: "/teamprofile",
      params: {
        teamName: joined.name,
        bannerUri: joined.bannerUri,
        logoUri: joined.logoUri,
        description: joined.description,
        role: "member",
      },
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 120 },
        ]}
      >
        <View>
          <Image
            source={{ uri: team.bannerUri }}
            style={styles.banner}
            contentFit="cover"
          />
          <LinearGradient
            colors={[
              "transparent",
              "rgba(8, 26, 47, 0.15)",
              "rgba(8, 26, 47, 0.55)",
              "rgba(8, 26, 47, 0.9)",
              Colors.light.blackBackground,
            ]}
            locations={[0, 0.35, 0.58, 0.8, 1]}
            style={styles.bannerGradient}
            pointerEvents="none"
          />
        </View>

        <View style={styles.identityRow}>
          <Image
            source={{ uri: team.logoUri }}
            style={styles.logo}
            contentFit="cover"
          />
          <Text style={styles.teamName}>{team.name}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <Text style={styles.description}>{team.description}</Text>

          <Text style={[styles.sectionLabel, styles.sectionSpacing]}>
            {memberCountLabel}
          </Text>

          {team.members.map((member) => (
            <TeamMemberRow key={member.id} member={member} />
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <PrimaryButton text="JOIN TEAM" onPress={handleJoin} />
        <SecondaryButton
          text="DECLINE"
          variant="green"
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
  },
  scrollContent: {
    flexGrow: 1,
  },
  banner: {
    width: "100%",
    height: 240,
  },
  bannerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    marginTop: -40,
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.darkgrey,
    borderWidth: 2,
    borderColor: Colors.light.blackBackground,
  },
  teamName: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 18,
  },
  content: {
    paddingHorizontal: 16,
  },
  sectionLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 10,
    opacity: 0.9,
  },
  sectionSpacing: {
    marginTop: 24,
  },
  description: {
    color: Colors.light.dullWhite,
    fontFamily: fonts.primary.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.light.blackBackground,
  },
  errorText: {
    color: Colors.light.white,
    textAlign: "center",
    marginTop: 120,
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  errorAction: {
    paddingHorizontal: 16,
  },
});
