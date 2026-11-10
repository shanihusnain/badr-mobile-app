import { fonts } from "@/assets/fonts";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";
import PrimaryButton from "@/components/atoms/Primary-button";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { Colors } from "@/constants/theme";
import { useJoinTeamWithCode } from "@/src/api/mutations/useJoinTeamWithCode";
import { useGetJoinTeamPreview } from "@/src/api/queries/useGetJoinTeamPreview";
import { TeamMemberRow } from "@/src/screens/private/teamprofile/components/TeamMemberRow";
import type { TeamMember } from "@/src/screens/private/teamprofile/mockData";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200";
const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800";
const FALLBACK_LOGO =
  "https://images.unsplash.com/photo-1585036156171-3841649478f8?w=200";

function asParamString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0]?.trim() ?? "";
  return typeof value === "string" ? value.trim() : "";
}

export const JoinTeamScreen = () => {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ inviteCode?: string }>();
  const inviteCode = asParamString(params.inviteCode).toUpperCase();

  const {
    data: preview,
    isLoading,
    isError,
  } = useGetJoinTeamPreview(inviteCode || null);
  const { mutateAsync: joinTeam, isPending: isJoining } = useJoinTeamWithCode();

  const members = useMemo<TeamMember[]>(() => {
    if (!preview?.members?.length) return [];
    return preview.members.map((member) => ({
      id: member.userId,
      name: member.name,
      handle: member.username ? `@${member.username}` : "",
      avatarUri: member.avatarUrl?.trim() || FALLBACK_AVATAR,
      isAdmin: member.isAdmin,
    }));
  }, [preview?.members]);

  const memberCount = preview?.memberCount ?? members.length;
  const memberCountLabel = `${memberCount} MEMBER${memberCount === 1 ? "" : "S"}`;

  const handleJoin = useCallback(async () => {
    if (!inviteCode || isJoining) return;

    try {
      const response = await joinTeam(inviteCode);
      const team = response.data;
      if (!team?.id) {
        router.back();
        return;
      }

      router.replace({
        pathname: "/teamprofile",
        params: {
          teamId: team.id,
          teamName: team.name,
          bannerUri: team.banner?.url ?? "",
          logoUri: team.logo?.url ?? "",
          description: team.about ?? "",
          role: team.me?.isAdmin ? "admin" : "member",
        },
      });
    } catch {
      // Toast is handled in the mutation.
    }
  }, [inviteCode, isJoining, joinTeam]);

  if (!inviteCode) {
    return (
      <View style={styles.screen}>
        <Text style={styles.errorText}>Missing invite code.</Text>
        <View style={styles.errorAction}>
          <PrimaryButton text="GO BACK" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <LoadingComponent size="large" />
      </View>
    );
  }

  if (isError || !preview) {
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

  const bannerUri = preview.banner?.url || FALLBACK_BANNER;
  const logoUri = preview.logo?.url || FALLBACK_LOGO;
  const about = preview.about?.trim() || "No description yet.";
  const alreadyMember = Boolean(preview.alreadyMember);

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
            source={{ uri: bannerUri }}
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
            source={{ uri: logoUri }}
            style={styles.logo}
            contentFit="cover"
          />
          <Text style={styles.teamName}>{preview.name}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <Text style={styles.description}>{about}</Text>

          <Text style={[styles.sectionLabel, styles.sectionSpacing]}>
            {memberCountLabel}
          </Text>

          {members.map((member) => (
            <TeamMemberRow key={member.id} member={member} />
          ))}
        </View>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        {alreadyMember ? (
          <PrimaryButton
            text="OPEN TEAM"
            onPress={() =>
              router.replace({
                pathname: "/teamprofile",
                params: {
                  teamId: preview.id,
                  teamName: preview.name,
                  bannerUri,
                  logoUri,
                  description: preview.about ?? "",
                  role: "member",
                },
              })
            }
          />
        ) : (
          <PrimaryButton
            text="JOIN TEAM"
            onPress={handleJoin}
            isLoading={isJoining}
            disabled={isJoining}
          />
        )}
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
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
  },
  banner: {
    width: "100%",
    height: 240,
  },
  bannerGradient: {
    ...StyleSheet.absoluteFill,
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
