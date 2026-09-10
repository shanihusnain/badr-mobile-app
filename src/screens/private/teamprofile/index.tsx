import { DotsWithCircle, ProfileInformationIcon } from "@/assets/icons";
import { HeaderWithCrossTitleDynamicIcon } from "@/components/atoms/HeaderWithCrossTitleDynamicIcon";
import { Colors } from "@/constants/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { InviteMemberSheet } from "./components/InviteMemberSheet";
import { RankMetricDropdown } from "./components/RankMetricDropdown";
import { TeamChatTab } from "./components/TeamChatTab";
import { TeamMemberRow } from "./components/TeamMemberRow";
import { TeamOptionsSheet } from "./components/TeamOptionsSheet";
import { TeamProfileTabs } from "./components/TeamProfileTabs";
import { ViewRankTab } from "./components/ViewRankTab";
import { buildCreatedTeam } from "./mockData";
import {
  getRankSnapshot,
  RANK_METRICS,
  RANK_SNAPSHOTS,
  type RankPeriod,
} from "./rankMockData";
import { teamProfileStyles as styles } from "./styles";

type TeamTab = "info" | "rank" | "chat";

export const TeamProfile = () => {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{
    teamName?: string;
    bannerUri?: string;
    logoUri?: string;
    description?: string;
    role?: string;
  }>();

  const isMemberView = params.role === "member";

  const team = useMemo(
    () =>
      buildCreatedTeam({
        name: params.teamName ?? "Badr's Team",
        bannerUri: params.bannerUri,
        logoUri: params.logoUri,
        description: params.description,
        role: isMemberView ? "member" : "admin",
      }),
    [
      isMemberView,
      params.bannerUri,
      params.description,
      params.logoUri,
      params.teamName,
    ],
  );

  const [activeTab, setActiveTab] = useState<TeamTab>("info");
  const [rankDropdownOpen, setRankDropdownOpen] = useState(false);
  const [rankMetricId, setRankMetricId] = useState("quran-completions");
  const [rankPeriod, setRankPeriod] = useState<RankPeriod>("monthly");

  const optionsSheetRef = useRef<BottomSheet>(null);
  const inviteSheetRef = useRef<BottomSheet>(null);

  const selectedMetric =
    RANK_METRICS.find((metric) => metric.id === rankMetricId) ??
    RANK_METRICS[0];

  const rankSnapshot = useMemo(
    () => getRankSnapshot(rankMetricId, rankPeriod),
    [rankMetricId, rankPeriod],
  );

  const openOptionsSheet = useCallback(() => {
    setRankDropdownOpen(false);
    optionsSheetRef.current?.expand();
  }, []);

  const closeRankDropdown = useCallback(() => {
    setRankDropdownOpen(false);
  }, []);

  const handleRankTabPress = useCallback(() => {
    setRankDropdownOpen((open) => !open);
  }, []);

  const handleSelectMetric = useCallback((metricId: string) => {
    setRankMetricId(metricId);
    const periods = RANK_SNAPSHOTS[metricId];
    if (periods?.daily) setRankPeriod("daily");
    else if (periods?.week) setRankPeriod("week");
    else if (periods?.monthly) setRankPeriod("monthly");
    setRankDropdownOpen(false);
    setActiveTab("rank");
  }, []);

  const handleInfoPress = useCallback(() => {
    setRankDropdownOpen(false);
    setActiveTab("info");
  }, []);

  const handleChatPress = useCallback(() => {
    setRankDropdownOpen(false);
    setActiveTab("chat");
  }, []);

  useLayoutEffect(() => {
    const headerTitle =
      activeTab === "info" && !rankDropdownOpen ? "" : team.name.toUpperCase();

    navigation.setOptions({
      header: ({ navigation: nav }: { navigation: typeof navigation }) => (
        <HeaderWithCrossTitleDynamicIcon
          title={headerTitle}
          navigation={nav}
          bgcolor="transparent"
          iconName="chevron-left"
          rightIcon={<DotsWithCircle size={30} color={Colors.light.white} />}
          onRightPress={openOptionsSheet}
        />
      ),
    });
  }, [activeTab, navigation, openOptionsSheet, rankDropdownOpen, team.name]);

  const openInviteSheet = useCallback(() => {
    optionsSheetRef.current?.close();
    requestAnimationFrame(() => {
      inviteSheetRef.current?.expand();
    });
  }, []);

  const openManageTeam = useCallback(() => {
    optionsSheetRef.current?.close();
    router.push({
      pathname: "/manageteam",
      params: {
        teamName: team.name,
        bannerUri: team.bannerUri,
        logoUri: team.logoUri,
        description: team.description,
        teamChatEnabled: team.teamChatEnabled ? "1" : "0",
      },
    });
  }, [team]);

  const memberCountLabel = `${team.members.length} MEMBER${
    team.members.length === 1 ? "" : "S"
  }`;

  const middleTabLabel =
    activeTab === "rank" && !rankDropdownOpen
      ? selectedMetric.label
      : "VIEW RANK";

  const showInfoContent = activeTab === "info" || rankDropdownOpen;
  const showRankContent = activeTab === "rank" && !rankDropdownOpen;

  const renderBanner = (compact: boolean) => (
    <View>
      <Image
        source={{ uri: team.bannerUri }}
        style={compact ? styles.bannerCompact : styles.banner}
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
      <TeamProfileTabs
        activeTab={activeTab}
        middleTabLabel={middleTabLabel}
        rankHighlighted={rankDropdownOpen}
        onInfoPress={handleInfoPress}
        onRankPress={handleRankTabPress}
        onChatPress={handleChatPress}
      />
    </View>
  );

  return (
    <View style={styles.screen}>
      {activeTab === "chat" ? (
        <View style={styles.flex}>
          {renderBanner(true)}
          <TeamChatTab
            enabled={team.teamChatEnabled}
            teamName={team.name}
            teamLogoUri={team.logoUri}
          />
        </View>
      ) : (
        <View style={styles.flex}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEnabled={!rankDropdownOpen}
          >
            {renderBanner(showRankContent)}

            {showInfoContent ? (
              <>
                {!rankDropdownOpen ? (
                  <View style={styles.identityRow}>
                    <Image
                      source={{ uri: team.logoUri }}
                      style={styles.logo}
                      contentFit="cover"
                    />
                    <Text style={styles.teamName}>{team.name}</Text>
                  </View>
                ) : (
                  <View style={styles.dropdownContentSpacer} />
                )}

                <View style={styles.content}>
                  {!rankDropdownOpen ? (
                    <>
                      <Text style={styles.sectionLabel}>ABOUT</Text>
                      {team.description ? (
                        <Text style={styles.descriptionText}>
                          {team.description}
                        </Text>
                      ) : (
                        <Pressable
                          style={styles.addDescriptionButton}
                          onPress={openManageTeam}
                        >
                          <Text style={styles.addDescriptionText}>
                            ADD DESCRIPTION
                          </Text>
                        </Pressable>
                      )}
                    </>
                  ) : null}

                  <Text
                    style={[
                      styles.sectionLabel,
                      !rankDropdownOpen && styles.sectionSpacing,
                    ]}
                  >
                    {memberCountLabel}
                  </Text>

                  {!isMemberView ? (
                    <Pressable
                      style={styles.addMembersRow}
                      onPress={openInviteSheet}
                    >
                      <View style={styles.addMembersIcon}>
                        <ProfileInformationIcon
                          Color={Colors.light.green}
                          size={22}
                        />
                      </View>
                      <Text style={styles.addMembersText}>ADD MEMBERS</Text>
                    </Pressable>
                  ) : null}

                  {team.members.map((member) => (
                    <TeamMemberRow key={member.id} member={member} />
                  ))}
                </View>
              </>
            ) : null}

            {showRankContent ? (
              <View style={styles.rankContentOffset}>
                <ViewRankTab
                  metricLabel={selectedMetric.label}
                  period={rankPeriod}
                  onPeriodChange={setRankPeriod}
                  totalLabel={rankSnapshot.totalLabel}
                  periodLabel={rankSnapshot.periodLabel}
                  lastUpdated={rankSnapshot.lastUpdated}
                  entries={rankSnapshot.entries}
                />
              </View>
            ) : null}
          </ScrollView>

          {rankDropdownOpen ? (
            <View style={styles.dropdownLayer} pointerEvents="box-none">
              <Pressable
                style={styles.dropdownBackdrop}
                onPress={closeRankDropdown}
              />
              <View style={styles.dropdownAnchor}>
                <RankMetricDropdown
                  selectedMetricId={rankMetricId}
                  onSelect={handleSelectMetric}
                />
              </View>
            </View>
          ) : null}
        </View>
      )}

      <TeamOptionsSheet
        ref={optionsSheetRef}
        onClose={() => optionsSheetRef.current?.close()}
        onAddMember={openInviteSheet}
        onNotificationSettings={() => {
          optionsSheetRef.current?.close();
          router.push("/chatnotificationsettings");
        }}
        onManageTeam={openManageTeam}
      />

      <InviteMemberSheet
        ref={inviteSheetRef}
        inviteCode={team.inviteCode}
        referralCode={team.referralCode}
        onClose={() => inviteSheetRef.current?.close()}
      />
    </View>
  );
};
