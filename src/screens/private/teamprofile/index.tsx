import { DotsWithCircle, ProfileInformationIcon } from "@/assets/icons";
import { HeaderWithCrossTitleDynamicIcon } from "@/components/atoms/HeaderWithCrossTitleDynamicIcon";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";
import { Colors } from "@/constants/theme";
import { useSendConnectTeamMessage } from "@/src/api/mutations/useSendConnectTeamMessage";
import { useGetConnectTeam } from "@/src/api/queries/useGetConnectTeam";
import { useGetConnectTeamLeaderboard } from "@/src/api/queries/useGetConnectTeamLeaderboard";
import { useGetConnectTeamMessages } from "@/src/api/queries/useGetConnectTeamMessages";
import { useTeamTyping } from "@/src/realtime/useTeamTyping";
import BottomSheet from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { InviteMemberSheet } from "./components/InviteMemberSheet";
import { RankMetricDropdown } from "./components/RankMetricDropdown";
import { TeamChatTab } from "./components/TeamChatTab";
import { TeamMemberRow } from "./components/TeamMemberRow";
import { TeamOptionsSheet } from "./components/TeamOptionsSheet";
import { TeamProfileTabs } from "./components/TeamProfileTabs";
import { ViewRankTab } from "./components/ViewRankTab";
import {
  DEFAULT_TEAM_BANNER,
  DEFAULT_TEAM_LOGO,
  type TeamMember,
} from "./mockData";
import { formatRankScore, type RankPeriod } from "./rankMockData";
import { teamProfileStyles as styles } from "./styles";

type TeamTab = "info" | "rank" | "chat";

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200";

function asParamString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0]?.trim() ?? "";
  return typeof value === "string" ? value.trim() : "";
}

function mapApiPeriodToRankPeriod(period: string | undefined): RankPeriod {
  if (period === "WEEKLY" || period === "week") return "week";
  if (period === "MONTHLY" || period === "monthly") return "monthly";
  return "daily";
}

function mapRankPeriodToApi(
  period: RankPeriod,
): "DAILY" | "WEEKLY" | "MONTHLY" {
  if (period === "week") return "WEEKLY";
  if (period === "monthly") return "MONTHLY";
  return "DAILY";
}

export const TeamProfile = () => {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{
    teamId?: string;
    teamName?: string;
    bannerUri?: string;
    logoUri?: string;
    description?: string;
    role?: string;
  }>();

  const teamId = asParamString(params.teamId);
  const {
    data: teamDetail,
    isLoading: isLoadingTeam,
    isError: isTeamError,
  } = useGetConnectTeam(teamId || null);

  const [activeTab, setActiveTab] = useState<TeamTab>("info");
  const [rankDropdownOpen, setRankDropdownOpen] = useState(false);
  const [rankMetricId, setRankMetricId] = useState<string>("");
  const [rankPeriod, setRankPeriod] = useState<RankPeriod>("daily");
  const hasInitializedRankPrefs = useRef(false);

  const optionsSheetRef = useRef<BottomSheet>(null);
  const inviteSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (!teamDetail?.me || hasInitializedRankPrefs.current) return;
    setRankMetricId(teamDetail.me.displayMetric ?? "");
    setRankPeriod(mapApiPeriodToRankPeriod(teamDetail.me.displayPeriod));
    hasInitializedRankPrefs.current = true;
  }, [teamDetail?.me]);

  const leaderboardParams = useMemo(() => {
    if (!teamId) return null;
    return {
      teamId,
      metric: rankMetricId || null,
      period: mapRankPeriodToApi(rankPeriod),
    };
  }, [rankMetricId, rankPeriod, teamId]);

  const {
    data: leaderboard,
    isLoading: isLoadingLeaderboard,
    isFetching: isFetchingLeaderboard,
  } = useGetConnectTeamLeaderboard(leaderboardParams);

  const shouldLoadMessages = activeTab === "chat";
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    isFetchingNextPage: isFetchingOlderMessages,
    hasNextPage: hasOlderMessages,
    fetchNextPage: fetchOlderMessages,
  } = useGetConnectTeamMessages(teamId || null, shouldLoadMessages);
  const { mutateAsync: sendMessage, isPending: isSendingMessage } =
    useSendConnectTeamMessage();
  const {
    typingUsers,
    notifyTyping,
    stopTyping,
  } = useTeamTyping(teamId || null, shouldLoadMessages);

  const teamName =
    teamDetail?.name?.trim() ||
    asParamString(params.teamName) ||
    "Team";
  const bannerUri =
    teamDetail?.banner?.url ||
    asParamString(params.bannerUri) ||
    DEFAULT_TEAM_BANNER;
  const logoUri =
    teamDetail?.logo?.url ||
    asParamString(params.logoUri) ||
    DEFAULT_TEAM_LOGO;
  const description =
    teamDetail?.about?.trim() ||
    asParamString(params.description) ||
    "";
  const chatEnabled =
    messagesData?.chatEnabled ?? teamDetail?.chatEnabled ?? true;
  const isAdmin = teamDetail?.me?.isAdmin ?? params.role !== "member";
  const inviteCode = teamDetail?.inviteCode ?? "";
  const referralCode = teamDetail?.referral?.code ?? "";
  const inviteShareText = teamDetail?.inviteShareText;

  const members = useMemo<TeamMember[]>(() => {
    if (!teamDetail?.members?.length) return [];
    return teamDetail.members.map((member) => ({
      id: member.userId,
      name: member.name,
      handle: member.username ? `@${member.username}` : "",
      avatarUri: member.avatarUrl?.trim() || FALLBACK_AVATAR,
      isAdmin: member.isAdmin,
    }));
  }, [teamDetail?.members]);

  const meMember = useMemo(
    () => teamDetail?.members?.find((member) => member.isMe) ?? null,
    [teamDetail?.members],
  );

  const rankMetrics = useMemo(() => {
    const fromLeaderboard = leaderboard?.metrics;
    const source =
      fromLeaderboard && fromLeaderboard.length > 0
        ? fromLeaderboard
        : (teamDetail?.metrics ?? []);

    return source.map((metric) => ({
      id: metric.metric,
      label: metric.label.toUpperCase(),
    }));
  }, [leaderboard?.metrics, teamDetail?.metrics]);

  const selectedMetricLabel =
    leaderboard?.metric?.label?.toUpperCase() ||
    rankMetrics.find((metric) => metric.id === rankMetricId)?.label ||
    "VIEW RANK";

  const rankEntries = useMemo(() => {
    if (!leaderboard?.members?.length) return [];
    return leaderboard.members.map((member) => ({
      id: member.userId,
      name: member.name,
      handle: member.username ? `@${member.username}` : "",
      avatarUri: member.avatarUrl?.trim() || FALLBACK_AVATAR,
      isAdmin: Boolean(member.isAdmin),
      score: member.score,
    }));
  }, [leaderboard?.members]);

  const totalLabel =
    leaderboard?.totalLabel ??
    (typeof leaderboard?.total === "number"
      ? `${formatRankScore(leaderboard.total)} total`
      : "");
  const periodLabel =
    leaderboard?.periodLabel?.toUpperCase() ||
    (rankPeriod === "daily"
      ? "TODAY"
      : rankPeriod === "week"
        ? "MON - SUN"
        : "MONTHLY");
  const lastUpdated = leaderboard?.lastUpdated
    ? `Last Updated: ${leaderboard.lastUpdated}`
    : "";

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
        teamId,
        teamName,
        bannerUri,
        logoUri,
        description,
        teamChatEnabled: chatEnabled ? "1" : "0",
      },
    });
  }, [bannerUri, chatEnabled, description, logoUri, teamId, teamName]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!teamId) return;
      stopTyping();
      await sendMessage({ teamId, text });
    },
    [sendMessage, stopTyping, teamId],
  );

  const handleTypingChange = useCallback(
    (text: string) => {
      if (!text.trim()) {
        stopTyping();
        return;
      }
      notifyTyping();
    },
    [notifyTyping, stopTyping],
  );

  const handleLoadOlderMessages = useCallback(() => {
    if (!hasOlderMessages || isFetchingOlderMessages) return;
    void fetchOlderMessages();
  }, [fetchOlderMessages, hasOlderMessages, isFetchingOlderMessages]);

  useLayoutEffect(() => {
    const headerTitle =
      activeTab === "info" && !rankDropdownOpen ? "" : teamName.toUpperCase();

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
  }, [activeTab, navigation, openOptionsSheet, rankDropdownOpen, teamName]);

  const memberCount = teamDetail?.memberCount ?? members.length;
  const memberCountLabel = `${memberCount} MEMBER${memberCount === 1 ? "" : "S"}`;

  const middleTabLabel =
    activeTab === "rank" && !rankDropdownOpen
      ? selectedMetricLabel
      : "VIEW RANK";

  const showInfoContent = activeTab === "info" || rankDropdownOpen;
  const showRankContent = activeTab === "rank" && !rankDropdownOpen;

  const renderBanner = (compact: boolean) => (
    <View>
      <Image
        source={{ uri: bannerUri }}
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

  if (!teamId) {
    return (
      <View style={[styles.screen, styles.centeredState]}>
        <Text style={styles.stateText}>Missing team id.</Text>
      </View>
    );
  }

  if (isLoadingTeam) {
    return (
      <View style={[styles.screen, styles.centeredState]}>
        <LoadingComponent size="large" />
      </View>
    );
  }

  if (isTeamError || !teamDetail) {
    return (
      <View style={[styles.screen, styles.centeredState]}>
        <Text style={styles.stateText}>Unable to load this team.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {activeTab === "chat" ? (
        <View style={styles.flex}>
          {renderBanner(true)}
          <TeamChatTab
            enabled={chatEnabled}
            teamName={teamName}
            teamLogoUri={logoUri}
            userAvatarUri={meMember?.avatarUrl}
            messages={messagesData?.messages ?? []}
            isLoading={isLoadingMessages}
            isSending={isSendingMessage}
            isFetchingOlder={isFetchingOlderMessages}
            hasOlderMessages={Boolean(hasOlderMessages)}
            typingUsers={typingUsers}
            onLoadOlder={handleLoadOlderMessages}
            onTypingChange={handleTypingChange}
            onSend={handleSendMessage}
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
                      source={{ uri: logoUri }}
                      style={styles.logo}
                      contentFit="cover"
                    />
                    <Text style={styles.teamName}>{teamName}</Text>
                  </View>
                ) : (
                  <View style={styles.dropdownContentSpacer} />
                )}

                <View style={styles.content}>
                  {!rankDropdownOpen ? (
                    <>
                      <Text style={styles.sectionLabel}>ABOUT</Text>
                      {description ? (
                        <Text style={styles.descriptionText}>{description}</Text>
                      ) : isAdmin ? (
                        <Pressable
                          style={styles.addDescriptionButton}
                          onPress={openManageTeam}
                        >
                          <Text style={styles.addDescriptionText}>
                            ADD DESCRIPTION
                          </Text>
                        </Pressable>
                      ) : (
                        <Text style={styles.descriptionText}>
                          No description yet.
                        </Text>
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

                  {isAdmin ? (
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

                  {members.map((member) => (
                    <TeamMemberRow key={member.id} member={member} />
                  ))}
                </View>
              </>
            ) : null}

            {showRankContent ? (
              <View style={styles.rankContentOffset}>
                <ViewRankTab
                  metricLabel={selectedMetricLabel}
                  period={rankPeriod}
                  onPeriodChange={setRankPeriod}
                  totalLabel={totalLabel}
                  periodLabel={periodLabel}
                  lastUpdated={lastUpdated}
                  entries={rankEntries}
                  isLoading={isLoadingLeaderboard || isFetchingLeaderboard}
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
                  metrics={rankMetrics}
                  selectedMetricId={
                    rankMetricId || leaderboard?.metric?.metric || ""
                  }
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
          router.push({
            pathname: "/chatnotificationsettings",
            params: { teamId },
          });
        }}
        onManageTeam={openManageTeam}
      />

      <InviteMemberSheet
        ref={inviteSheetRef}
        inviteCode={inviteCode}
        referralCode={referralCode}
        shareText={inviteShareText}
        onClose={() => inviteSheetRef.current?.close()}
      />
    </View>
  );
};
