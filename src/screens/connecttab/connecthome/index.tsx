import { fonts } from "@/assets/fonts";
import {
  AddIcon,
  EnterInviteCode,
  ReferUserIcon,
  ThreeDotsIcon,
} from "@/assets/icons";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";
import MoreActionButton from "@/components/atoms/MoreActionButton";
import PrimaryButton from "@/components/atoms/Primary-button";
import { BottomSheetWrapper } from "@/components/molecules/BottomSheetWrapper";
import {
  PastAchievementStudyMaterial,
  type StudyMaterialItem,
} from "@/components/molecules/PastAchievementStudyMaterial";
import { Colors } from "@/constants/theme";
import { useUpdateConnectTeamMe } from "@/src/api/mutations/useUpdateConnectTeamMe";
import {
  useConnectHomeData,
  type ConnectHomeLearnMoreItem,
  type ConnectHomeTeam,
} from "@/src/api/queries/useConnectHomeData";
import { useGetConnectTeam } from "@/src/api/queries/useGetConnectTeam";
import BottomSheet from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from "react-native";
import { EditDisplayRankSheet } from "./components/EditDisplayRankSheet";
import { MyTeamsList } from "./components/MyTeamsList";
import {
  buildDisplayRankLabel,
  mapDisplayPeriodToApi,
  type DisplayRankMetric,
  type DisplayRankPeriod,
  type MyTeam,
} from "./myTeamsMockData";

type ConnectActionButton = {
  title: string;
  description: string;
  icon: ReactNode;
  onPress: () => void;
};

type ConnectHomeSection = {
  id: string;
  title: string;
  description?: string;
  titleIcon?: ReactNode;
  button?: ConnectActionButton[];
  showMyTeams?: boolean;
};

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function mapApiPeriodToDisplayPeriod(
  period: string | undefined,
): DisplayRankPeriod {
  if (period === "WEEKLY" || period === "week") return "week";
  if (period === "MONTHLY" || period === "month") return "month";
  return "today";
}

function mapConnectHomeTeams(teams: ConnectHomeTeam[] | undefined): MyTeam[] {
  if (!Array.isArray(teams) || teams.length === 0) return [];

  return teams.flatMap((team) => {
    const id = asString(team.id);
    const name = asString(team.name);
    if (!id || !name) return [];

    const selectedMetricId =
      asString(team.rank?.metric?.metric) ?? "PRAYER_QIYAM";
    const selectedPeriod = mapApiPeriodToDisplayPeriod(team.rank?.period);

    return [
      {
        id,
        name,
        avatarUri: asString(team.logo?.url) ?? "",
        selectedMetricId,
        selectedPeriod,
        displayRankLabel:
          asString(team.rank?.chipLabel) ??
          buildDisplayRankLabel(selectedMetricId, selectedPeriod),
        rankPosition: asNumber(team.rank?.position) ?? 0,
        rankTotal: asNumber(team.rank?.of) ?? 0,
      } satisfies MyTeam,
    ];
  });
}

function mapLearnMoreItems(
  items: ConnectHomeLearnMoreItem[] | undefined,
): StudyMaterialItem[] {
  if (!Array.isArray(items) || items.length === 0) return [];

  return items.flatMap((raw, index) => {
    const thumbnail = asString(raw.thumbnail);
    const description = asString(raw.description);
    if (!thumbnail || !description) return [];

    const typeRaw = asString(raw.type)?.toLowerCase();
    const type: StudyMaterialItem["type"] =
      typeRaw === "video" || typeRaw === "podcast" || typeRaw === "article"
        ? typeRaw
        : "article";

    const idNum = asNumber(raw.id);
    const id =
      idNum ??
      (typeof raw.id === "string" ? Number.parseInt(raw.id, 10) : index + 1);

    return [
      {
        id: Number.isFinite(id) ? id : index + 1,
        thumbnail,
        type,
        description,
      } satisfies StudyMaterialItem,
    ];
  });
}

export const ConnectHome = () => {
  const teamsMenuSheetRef = useRef<BottomSheet>(null);
  const editRankSheetRef = useRef<BottomSheet>(null);
  const { data: connectHomeData, isLoading: isLoadingConnectHome } =
    useConnectHomeData();
  const { mutateAsync: updateConnectTeamMe, isPending: isUpdatingDisplayRank } =
    useUpdateConnectTeamMe();

  const apiTeams = useMemo(
    () => mapConnectHomeTeams(connectHomeData?.teams),
    [connectHomeData?.teams],
  );
  const [myTeams, setMyTeams] = useState<MyTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<MyTeam | null>(null);

  const {
    data: selectedTeamDetail,
    isLoading: isLoadingTeamDetail,
    isFetching: isFetchingTeamDetail,
  } = useGetConnectTeam(selectedTeam?.id);

  useEffect(() => {
    setMyTeams(apiTeams);
  }, [apiTeams]);

  const displayRankMetrics = useMemo<DisplayRankMetric[]>(() => {
    const metrics = selectedTeamDetail?.metrics;
    if (!Array.isArray(metrics) || metrics.length === 0) return [];

    return metrics.flatMap((metric) => {
      const id = asString(metric.metric);
      const label = asString(metric.label);
      if (!id || !label) return [];
      return [{ id, label: label.toUpperCase() } satisfies DisplayRankMetric];
    });
  }, [selectedTeamDetail?.metrics]);

  const editSheetTeam = useMemo<MyTeam | null>(() => {
    if (!selectedTeam) return null;

    const me = selectedTeamDetail?.me;
    if (!me) return selectedTeam;

    const selectedMetricId =
      asString(me.displayMetric) ?? selectedTeam.selectedMetricId;
    const selectedPeriod = mapApiPeriodToDisplayPeriod(me.displayPeriod);

    return {
      ...selectedTeam,
      selectedMetricId,
      selectedPeriod,
      displayRankLabel: buildDisplayRankLabel(selectedMetricId, selectedPeriod),
    };
  }, [selectedTeam, selectedTeamDetail?.me]);

  const hasJoinedTeams = myTeams.length > 0;
  const visibleTeamCount = connectHomeData?.visibleTeamCount ?? 4;
  const referral = connectHomeData?.referral;
  const learnMoreItems = useMemo(
    () => mapLearnMoreItems(connectHomeData?.learnMore),
    [connectHomeData?.learnMore],
  );

  const closeTeamsMenu = useCallback(() => {
    teamsMenuSheetRef.current?.close();
  }, []);

  const closeEditRankSheet = useCallback(() => {
    editRankSheetRef.current?.close();
    setSelectedTeam(null);
  }, []);

  const handleTeamPress = useCallback((team: MyTeam) => {
    router.push({
      pathname: "/teamprofile",
      params: {
        teamId: team.id,
        teamName: team.name,
        bannerUri: team.avatarUri,
        logoUri: team.avatarUri,
      },
    });
  }, []);

  const handleRankPress = useCallback((team: MyTeam) => {
    setSelectedTeam(team);
    requestAnimationFrame(() => {
      editRankSheetRef.current?.expand();
    });
  }, []);

  const handleApplyDisplayRank = useCallback(
    async (payload: {
      teamId: string;
      metricId: string;
      period: DisplayRankPeriod;
      displayRankLabel: string;
    }) => {
      try {
        await updateConnectTeamMe({
          teamId: payload.teamId,
          body: {
            displayMetric: payload.metricId,
            displayPeriod: mapDisplayPeriodToApi(payload.period),
          },
        });
        // Connect home + team detail caches are invalidated in the mutation.
        closeEditRankSheet();
      } catch {
        // Toast is handled in the mutation.
      }
    },
    [closeEditRankSheet, updateConnectTeamMe],
  );

  const sections = useMemo<ConnectHomeSection[]>(
    () => [
      {
        id: "referral",
        title: "GET ONE MONTH FREE",
        button: [
          {
            title: "REFER A FRIEND",
            description:
              referral?.shareText ??
              "Get one month credit for each friend you refer",
            icon: <ReferUserIcon size={34} />,
            onPress: () => {
              router.push({
                pathname: "/friendreferal",
                params: {
                  code: referral?.code ?? "",
                  shareText: referral?.shareText ?? "",
                },
              });
            },
          },
        ],
      },
      {
        id: "teams",
        title: "TEAMS",
        titleIcon: <ThreeDotsIcon />,
        description: hasJoinedTeams
          ? undefined
          : "Create teams, invite friends, and track each other's progress with leaderboards.",
        showMyTeams: hasJoinedTeams,
        button: hasJoinedTeams
          ? undefined
          : [
              {
                title: "CREATE A TEAM",
                description: "",
                icon: <AddIcon size={26} />,
                onPress: () => {
                  router.push("/createteam");
                },
              },
              {
                title: "ENTER INVITE CODE",
                description: "",
                icon: <EnterInviteCode size={26} />,
                onPress: () => {
                  router.push("/enterinvitecode");
                },
              },
            ],
      },
    ],
    [hasJoinedTeams, referral?.code, referral?.shareText],
  );

  const renderItem = useCallback<ListRenderItem<ConnectHomeSection>>(
    ({ item }) => (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            {item.titleIcon ? (
              <Pressable
                onPress={() => teamsMenuSheetRef.current?.expand()}
                hitSlop={12}
                style={styles.moreButton}
              >
                {item.titleIcon}
              </Pressable>
            ) : null}
          </View>
          {!!item.description && (
            <Text style={styles.sectionDescription}>{item.description}</Text>
          )}
        </View>

        {item.showMyTeams ? (
          <MyTeamsList
            teams={myTeams}
            visibleTeamCount={visibleTeamCount}
            onTeamPress={handleTeamPress}
            onRankPress={handleRankPress}
          />
        ) : (
          item.button?.map((button) => (
            <MoreActionButton
              key={button.title}
              title={button.title}
              description={button.description}
              icon={button.icon}
              onPress={button.onPress}
            />
          ))
        )}
      </View>
    ),
    [handleRankPress, handleTeamPress, myTeams, visibleTeamCount],
  );

  const ListFooter = useCallback(() => {
    if (learnMoreItems.length === 0) return null;
    return (
      <PastAchievementStudyMaterial
        items={learnMoreItems}
        title="LEARN MORE"
        showSeeAll
        onSeeAllPress={() => router.push("/(tabs)/(connect)/learnmorescreen")}
      />
    );
  }, [learnMoreItems]);

  if (isLoadingConnectHome) {
    return (
      <BlackScreenWrapper edges={["top"]}>
        <View style={styles.loadingContainer}>
          <LoadingComponent size="large" />
        </View>
      </BlackScreenWrapper>
    );
  }

  return (
    <BlackScreenWrapper edges={["top"]}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />

      <BottomSheetWrapper
        ref={teamsMenuSheetRef}
        snapPoints={["42%"]}
        bgColor={Colors.light.blackBackground}
        onClose={closeTeamsMenu}
      >
        <View style={styles.sheetContent}>
          <MoreActionButton
            title="CREATE TEAM"
            icon={<AddIcon size={26} color={Colors.light.white} />}
            variant="outline"
            onPress={() => {
              closeTeamsMenu();
              router.push("/createteam");
            }}
          />
          <MoreActionButton
            title="ENTER INVITE CODE"
            icon={<EnterInviteCode size={26} color={Colors.light.white} />}
            variant="sheet"
            onPress={() => {
              closeTeamsMenu();
              router.push("/enterinvitecode");
            }}
          />
          <PrimaryButton text="CANCEL" onPress={closeTeamsMenu} />
        </View>
      </BottomSheetWrapper>

      <EditDisplayRankSheet
        ref={editRankSheetRef}
        team={editSheetTeam}
        metrics={displayRankMetrics}
        isLoadingMetrics={
          Boolean(selectedTeam) &&
          (isLoadingTeamDetail || isFetchingTeamDetail) &&
          displayRankMetrics.length === 0
        }
        isApplying={isUpdatingDisplayRank}
        onClose={closeEditRankSheet}
        onApply={handleApplyDisplayRank}
      />
    </BlackScreenWrapper>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    paddingBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  moreButton: {
    padding: 8,
    margin: -8,
  },
  sectionTitle: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  sectionDescription: {
    color: Colors.light.subtext,
    fontSize: 13,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    lineHeight: 18,
    marginTop: 6,
  },
  sheetContent: {
    width: "100%",
    gap: 4,
  },
});
