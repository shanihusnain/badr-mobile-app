import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import Header from "@/components/Header";
import type { GoalCardData } from "./components/GoalCard";
import { GoalCardCarousel } from "./components/GoalCardCarousel";
import { GoalPlannerSummary } from "./components/GoalPlannerSummary";
import { styles } from "./styles";
import { useTranslation } from "react-i18next";
import BottomSheet from "@gorhom/bottom-sheet";
import { GoalPlannerSheet } from "./components/GoalPlannerSheet";
import type { Tab } from "./components/GoalPlannerSheet";
import { ShootIcon } from "@/assets/icons/ShootIcon";
import { MonthlyGoalPlannerReviewCardIcon } from "@/assets/icons/MonthlyGoalPlannerReviewCardIcon";
import { MonthlyGoalPlannerSaveCardIcon } from "@/assets/icons/MonthlyGoalPlannerSaveCardIcon";
// import { TickWithCircleIcon } from "@/assets/icons/TickWithCircleIcon";
import { MonthlyGoalPlannerComittedCardIcon } from "@/assets/icons/MonthlyGoalPlannerComittedCardIcon";
import { MonthlyGoalPlannerPlanIcon } from "@/assets/icons/MonthlyGoalPlannerPlanIcon";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { TickIconWithCircle } from "@/assets/icons/TickIconWithCircle";
import { WhiteTick } from "@/assets/icons";

type StepItem = {
  id: number;
  title: string;
  category?: string;
  status: "completed" | "pending";
};

// ── Sub-components ──

const StepRow = ({
  item,
  onPress,
}: {
  item: StepItem;
  onPress: (id: number) => void;
}) => (
  <Pressable style={styles.stepRow} onPress={() => onPress(item.id)}>
    <View style={styles.stepRowLeft}>
      {item.category && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      )}
      <Text style={styles.stepTitle}>{item.title}</Text>
    </View>
    {/* {item.status === "completed" ? ( */}
    <View
      style={{
        width: 12,
        height: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        borderColor: Colors.light.white,
      }}
    >
      {/* <TickWithCircleIcon /> */}
      <WhiteTick />
    </View>
    {/* ) : (
      <Ionicons name="chevron-forward" size={20} color={Colors.light.grey} />
    )} */}
  </Pressable>
);

const keyExtractor = (item: StepItem) => String(item.id);
const ItemSeparator = () => <TopSpace top={12} />;

export const MonthlyGoalPlannerScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedTab, setSelectedTab] = useState<Tab>("cycle");

  // Map each step id to its corresponding sheet tab
  const STEP_TAB_MAP: Record<number, Tab> = {
    1: "cycle",
    2: "prayer",
    3: "quran",
    4: "fasting",
    5: "sadaqah",
    6: "review",
  };

  const handleStepPress = useCallback((stepId: number) => {
    setSelectedTab(STEP_TAB_MAP[stepId] ?? "cycle");
    bottomSheetRef.current?.expand();
  }, []);

  const handleSheetClose = useCallback(() => {}, []);

  const renderItem = useCallback(
    ({ item }: { item: StepItem }) => (
      <StepRow item={item} onPress={handleStepPress} />
    ),
    [handleStepPress],
  );

  const goalCards: GoalCardData[] = [
    {
      id: "1",
      title: t("monthlyGoalPlanner.card1Title"),
      description: t("monthlyGoalPlanner.card1Desc"),
      icon: <ShootIcon size={32} Color={Colors.light.green} />,
    },
    {
      id: "2",
      title: t("monthlyGoalPlanner.card2Title"),
      description: t("monthlyGoalPlanner.card2Desc"),
      icon: (
        <MonthlyGoalPlannerReviewCardIcon
          size={32}
          color={Colors.light.green}
        />
      ),
    },
    {
      id: "3",
      title: t("monthlyGoalPlanner.card3Title"),
      description: t("monthlyGoalPlanner.card3Desc"),
      icon: (
        <MonthlyGoalPlannerSaveCardIcon size={32} color={Colors.light.green} />
      ),
    },
    {
      id: "4",
      title: t("monthlyGoalPlanner.card4Title"),
      description: t("monthlyGoalPlanner.card4Desc"),
      icon: <TickIconWithCircle />,
    },
    {
      id: "5",
      title: t("monthlyGoalPlanner.card5Title"),
      description: t("monthlyGoalPlanner.card5Desc"),
      icon: (
        <MonthlyGoalPlannerComittedCardIcon
          size={34}
          color={Colors.light.green}
        />
      ),
    },
    {
      id: "6",
      title: t("monthlyGoalPlanner.card6Title"),
      description: t("monthlyGoalPlanner.card6Desc"),
      icon: <MonthlyGoalPlannerPlanIcon size={36} color={Colors.light.green} />,
    },
  ];

  const steps: StepItem[] = [
    { id: 1, title: t("monthlyGoalPlanner.step1Title"), status: "pending" },
    {
      id: 2,
      title: t("monthlyGoalPlanner.step2Title"),
      category: t("monthlyGoalPlanner.step2Category"),
      status: "completed",
    },
    {
      id: 3,
      title: t("monthlyGoalPlanner.step3Title"),
      category: t("monthlyGoalPlanner.step3Category"),
      status: "completed",
    },
    {
      id: 4,
      title: t("monthlyGoalPlanner.step4Title"),
      category: t("monthlyGoalPlanner.step4Category"),
      status: "completed",
    },
    {
      id: 5,
      title: t("monthlyGoalPlanner.step5Title"),
      category: t("monthlyGoalPlanner.step5Category"),
      status: "completed",
    },
    { id: 6, title: t("monthlyGoalPlanner.step6Title"), status: "completed" },
  ];

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => <Header title={t("monthlyGoalPlanner.title")} />,
    });
  }, [navigation, t]);

  const handleBeginNowPress = useCallback(() => {
    //open the bottom sheet
    bottomSheetRef.current?.expand();
  }, [bottomSheetRef]);

  return (
    <View style={{ flex: 1 }}>
      <BlackScreenWrapper edges={["bottom", "left", "right"]}>
        <FlatList
          data={steps}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={ItemSeparator}
          style={[styles.stepsList, { flex: 1 }]}
          contentContainerStyle={styles.stepsContent}
          ListHeaderComponent={
            <>
              <Text style={globalStyles.onboardingHeading}>
                {t("monthlyGoalPlanner.heading")}
              </Text>
              <TopSpace top={16} />
              <Text style={styles.subheading}>
                {t("monthlyGoalPlanner.subheading")}
              </Text>
              <TopSpace top={24} />
              <GoalCardCarousel data={goalCards} />
              <GoalPlannerSummary />
              <TopSpace top={10} />
            </>
          }
        />
        <Pressable
          onPress={handleBeginNowPress}
          style={{ alignSelf: "center", marginBottom: 16 }}
        >
          <Text style={globalStyles.greenCTA}>BEGIN NOW</Text>
        </Pressable>
      </BlackScreenWrapper>
      <GoalPlannerSheet
        ref={bottomSheetRef}
        onClose={handleSheetClose}
        initialTab={selectedTab}
      />
    </View>
  );
};
