import { fonts } from "@/assets/fonts";
import {
  AddIcon,
  EnterInviteCode,
  ReferUserIcon,
  ThreeDotsIcon,
} from "@/assets/icons";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import MoreActionButton from "@/components/atoms/MoreActionButton";
import PrimaryButton from "@/components/atoms/Primary-button";
import { BottomSheetWrapper } from "@/components/molecules/BottomSheetWrapper";
import {
  PastAchievementStudyMaterial,
  type StudyMaterialItem,
} from "@/components/molecules/PastAchievementStudyMaterial";
import { Colors } from "@/constants/theme";
import {
  useConnectHomeData,
  type ConnectHomeLearnMoreItem,
  type ConnectHomeTeam,
} from "@/src/api/queries/useConnectHomeData";
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

/** Defensive map until backend documents a populated team object. */
function mapConnectHomeTeams(teams: ConnectHomeTeam[] | undefined): MyTeam[] {
  if (!Array.isArray(teams) || teams.length === 0) return [];

  return teams.flatMap((raw) => {
    const id =
      asString(raw.id) ??
      (typeof raw.id === "number" ? String(raw.id) : undefined);
    const name = asString(raw.name);
    if (!id || !name) return [];

    const selectedMetricId = asString(raw.selectedMetricId) ?? "qiyam";
    const periodRaw = asString(raw.selectedPeriod);
    const selectedPeriod: DisplayRankPeriod =
      periodRaw === "week" || periodRaw === "month" || periodRaw === "today"
        ? periodRaw
        : "today";

    return [
      {
        id,
        name,
        avatarUri:
          asString(raw.avatarUri) ??
          asString(raw.avatarUrl) ??
          asString(raw.logoUri) ??
          asString(raw.logoUrl) ??
          "",
        selectedMetricId,
        selectedPeriod,
        displayRankLabel:
          asString(raw.displayRankLabel) ??
          buildDisplayRankLabel(selectedMetricId, selectedPeriod),
        rankPosition: asNumber(raw.rankPosition) ?? 0,
        rankTotal: asNumber(raw.rankTotal) ?? 0,
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
  const { data: connectHomeData } = useConnectHomeData();

  const apiTeams = useMemo(
    () => mapConnectHomeTeams(connectHomeData?.teams),
    [connectHomeData?.teams],
  );
  const [myTeams, setMyTeams] = useState<MyTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<MyTeam | null>(null);

  useEffect(() => {
    setMyTeams(apiTeams);
  }, [apiTeams]);

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
    setSelectedTeam(team);
    requestAnimationFrame(() => {
      editRankSheetRef.current?.expand();
    });
  }, []);

  const handleApplyDisplayRank = useCallback(
    (payload: {
      teamId: string;
      metricId: string;
      period: DisplayRankPeriod;
      displayRankLabel: string;
    }) => {
      setMyTeams((current) =>
        current.map((team) =>
          team.id === payload.teamId
            ? {
                ...team,
                selectedMetricId: payload.metricId,
                selectedPeriod: payload.period,
                displayRankLabel: payload.displayRankLabel,
              }
            : team,
        ),
      );
      closeEditRankSheet();
    },
    [closeEditRankSheet],
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
    [handleTeamPress, myTeams, visibleTeamCount],
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
        team={selectedTeam}
        onClose={closeEditRankSheet}
        onApply={handleApplyDisplayRank}
      />
    </BlackScreenWrapper>
  );
};

const styles = StyleSheet.create({
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
