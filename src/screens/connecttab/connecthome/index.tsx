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
import BottomSheet from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
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
  MOCK_MY_TEAMS,
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

const STUDY_MATERIAL: StudyMaterialItem[] = [
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1564769662533-4f00a87b9756?w=400",
    type: "video",
    description: "Building meaningful connections through shared faith",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/photo-1585036156171-3841649478f8?w=400",
    type: "podcast",
    description: "How community accountability strengthens consistency",
  },
  {
    id: 3,
    thumbnail:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    type: "article",
    description: "Tips for inviting friends and growing together",
  },
];

export const ConnectHome = () => {
  const teamsMenuSheetRef = useRef<BottomSheet>(null);
  const editRankSheetRef = useRef<BottomSheet>(null);
  const [myTeams, setMyTeams] = useState<MyTeam[]>(MOCK_MY_TEAMS);
  const [selectedTeam, setSelectedTeam] = useState<MyTeam | null>(null);
  const hasJoinedTeams = myTeams.length > 0;

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
            description: "Get one month credit for each friend you refer",
            icon: <ReferUserIcon size={34} />,
            onPress: () => {
              router.push("/friendreferal");
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
    [hasJoinedTeams],
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
          <MyTeamsList teams={myTeams} onTeamPress={handleTeamPress} />
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
    [handleTeamPress, myTeams],
  );

  const ListFooter = useCallback(
    () => (
      <PastAchievementStudyMaterial
        items={STUDY_MATERIAL}
        title="LEARN MORE"
        showSeeAll
        onSeeAllPress={() => router.push("/(tabs)/(connect)/learnmorescreen")}
      />
    ),
    [],
  );

  return (
    <BlackScreenWrapper>
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
