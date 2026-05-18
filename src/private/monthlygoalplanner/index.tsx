import { fonts } from "@/assets/fonts";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { router, useNavigation } from "expo-router";
import { useCallback, useEffect } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import type { GoalCardData } from "./components/GoalCard";
import { GoalCardCarousel } from "./components/GoalCardCarousel";
import { GoalPlannerSummary } from "./components/GoalPlannerSummary";
import { styles } from "./styles";

// ── Static data — defined outside component to avoid recreation on every render ──

const GOAL_CARDS: GoalCardData[] = [
  {
    id: "1",
    title: "Reflect and Set Goals",
    description:
      "Dedicate 20-30 minutes to choose ibadat practices that align with your aspirations. Cherish this time as a chance to deepen your connection with Allah (SWT) and set meaningful intentions.",
  },
  {
    id: "2",
    title: "Review Options Before Choosing",
    description:
      "Before adding a goal to your plan, tap each option to learn more. This helps you understand its purpose and importance, so you can choose goals that align with your spiritual priorities.",
  },
  {
    id: "3",
    title: "Save and Resume Anytime",
    description:
      "Select and save goals individually, giving you the freedom to pause and return anytime. With progress saved, you can explore options at your own pace for a stress-free, thoughtful experience.",
  },
  {
    id: "4",
    title: "Confirm Goals and Begin Your 4-Week Cycle",
    description:
      "After selecting goals, confirm them to start your 4-week cycle the next day. You'll have the entire 4 weeks to achieve them, helping you track progress and build consistency.",
  },
  {
    id: "5",
    title: "Stay Committed to Your Plan",
    description:
      "Once confirmed, goals can't be edited and remain locked for 4 weeks, promoting commitment to your targets and supporting a mindful, fulfilling spiritual routine.",
  },
  {
    id: "6",
    title: "Plan Ahead for Smooth Transitions",
    description:
      "Set new goals as your 4-week cycle nears its end. Don't worry-we'll send a reminder! If you don't update them, your current goals will automatically renew for another 4 weeks.",
  },
];

type StepItem = {
  id: number;
  title: string;
  category?: string;
  status: "completed" | "pending";
};

const STEPS: StepItem[] = [
  { id: 1, title: "Select Cycle Start Date", status: "completed" },
  {
    id: 2,
    title: "Category 1 Prayer Goals",
    category: "Category 1",
    status: "completed",
  },
  {
    id: 3,
    title: "Category 2 Quran Goals",
    category: "Category 2",
    status: "completed",
  },
  {
    id: 4,
    title: "Category 3 Fasting Goals",
    category: "Category 3",
    status: "completed",
  },
  {
    id: 5,
    title: "Category 4 Sadaqah Goals",
    category: "Category 4",
    status: "completed",
  },
  { id: 6, title: "Review and Confirm", status: "completed" },
];

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
  const navigation = useNavigation();

  const backButton = useCallback(
    () => (
      <Pressable onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="arrow-back" size={22} color={Colors.light.white} />
      </Pressable>
    ),
    [],
  );

  useEffect(() => {
    navigation.setOptions({
      title: "MONTHLY GOAL PLANNER",
      headerTitleAlign: "center",
      headerLeft: backButton,
    });
  }, [navigation, backButton]);

  return (
    <BlackScreenWrapper>
      <FlatList
        data={STEPS}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        style={styles.stepsList}
        contentContainerStyle={styles.stepsContent}
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>
              LET'S BEGIN SETTING YOUR MONTHLY GOALS!
            </Text>
            <TopSpace top={16} />
            <Text style={styles.subheading}>
              Now that you've learned how the goal-setting feature works, here's
              a summary before you get started.
            </Text>
            <TopSpace top={24} />
            <GoalCardCarousel data={GOAL_CARDS} />
            <GoalPlannerSummary />
          </>
        }
      />
    </BlackScreenWrapper>
  );
};
