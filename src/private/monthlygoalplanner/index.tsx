import { fonts } from "@/assets/fonts";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { router, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import Header from "@/components/Header";
import type { GoalCardData } from "./components/GoalCard";
import { GoalCardCarousel } from "./components/GoalCardCarousel";
import { GoalPlannerSummary } from "./components/GoalPlannerSummary";
import { styles } from "./styles";
import { useTranslation } from "react-i18next";

// ── Static data — defined outside component to avoid recreation on every render ──

type StepItem = {
  id: number;
  title: string;
  category?: string;
  status: "completed" | "pending";
};

// ── Sub-components ──

const StepRow = ({ item }: { item: StepItem }) => (
  <View style={styles.stepRow}>
    <View style={styles.stepRowLeft}>
      {item.category && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      )}
      <Text style={styles.stepTitle}>{item.title}</Text>
    </View>
    {item.status === "completed" && (
      <Ionicons
        name="checkmark-circle-outline"
        size={24}
        color={Colors.light.white}
      />
    )}
  </View>
);
const keyExtractor = (item: StepItem) => String(item.id);
const renderItem = ({ item }: { item: StepItem }) => <StepRow item={item} />;
const ItemSeparator = () => <TopSpace top={12} />;

export const MonthlyGoalPlannerScreen = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const navigation = useNavigation();

  const goalCards: GoalCardData[] = [
    {
      id: "1",
      title: t("monthlyGoalPlanner.card1Title"),
      description: t("monthlyGoalPlanner.card1Desc"),
    },
    {
      id: "2",
      title: t("monthlyGoalPlanner.card2Title"),
      description: t("monthlyGoalPlanner.card2Desc"),
    },
    {
      id: "3",
      title: t("monthlyGoalPlanner.card3Title"),
      description: t("monthlyGoalPlanner.card3Desc"),
    },
    {
      id: "4",
      title: t("monthlyGoalPlanner.card4Title"),
      description: t("monthlyGoalPlanner.card4Desc"),
    },
    {
      id: "5",
      title: t("monthlyGoalPlanner.card5Title"),
      description: t("monthlyGoalPlanner.card5Desc"),
    },
    {
      id: "6",
      title: t("monthlyGoalPlanner.card6Title"),
      description: t("monthlyGoalPlanner.card6Desc"),
    },
  ];

  const steps: StepItem[] = [
    { id: 1, title: t("monthlyGoalPlanner.step1Title"), status: "completed" },
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
      header: () => (
        <Header
          title={t("monthlyGoalPlanner.title")}
        />
      ),
    });
  }, [navigation, t]);

  return (
    <BlackScreenWrapper>
      <FlatList
        data={steps}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        style={styles.stepsList}
        contentContainerStyle={styles.stepsContent}
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>
              {t("monthlyGoalPlanner.heading")}
            </Text>
            <TopSpace top={16} />
            <Text style={styles.subheading}>
              {t("monthlyGoalPlanner.subheading")}
            </Text>
            <TopSpace top={24} />
            <GoalCardCarousel data={goalCards} />
            <GoalPlannerSummary />
          </>
        }
      />
    </BlackScreenWrapper>
  );
};
