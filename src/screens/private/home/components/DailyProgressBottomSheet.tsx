import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { IbadhasPrayerProgressCardsIcon } from "@/assets/icons/IbadhasPrayerProgressCardsIcon";
import { IbadhasQuranProgressCardsIcon } from "@/assets/icons/IbadhasQuranProgressCardsIcon";
import { IbadhasFastingProgressCardsIcon } from "@/assets/icons/IbadhasFastingProgressCardsIcon";
import { DashBoardHandHeartIcon } from "@/assets/icons/DashBoardHandHeartIcon";
import { useRouter } from "expo-router";
import { IbadahsProgressCard } from "./IbadahsProgressCard";
import {
  DetailedIbadahsProgressCard,
  getDetailedIbadahIcon,
} from "./DetailedIbadahsProgressCards";
import type { GoalId } from "./goalsData";
import BackButton from "@/components/atoms/Backbutton";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import { useGetGoalCycleCategories } from "@/src/api/queries/useGetGoalCycleCategories";
import { useGetGoalCycleCategoryGoals } from "@/src/api/queries/useGetGoalCycleCategoryGoals";
import {
  goalTypeToGoalId,
  toUiIbadahCategory,
  type UiIbadahCategory,
} from "@/src/utils/goalCycleCategoryMap";

type ViewType = "main" | "categories" | "detail";

type Props = {
  onClose?: () => void;
};

const CATEGORY_ICON_COLOR: Record<UiIbadahCategory, string> = {
  PRAYER: Colors.light.ringPrayer,
  QURAN: Colors.light.ringQuran,
  FASTING: Colors.light.green,
  SADAQAH: Colors.light.ringSadaqah,
};

function getCategoryGoalIcon(category: UiIbadahCategory, color: string) {
  switch (category) {
    case "QURAN":
      return <Ionicons name="book" size={18} color={color} />;
    case "FASTING":
      return (
        <MaterialCommunityIcons name="food-off" size={18} color={color} />
      );
    case "SADAQAH":
      return (
        <FontAwesome6 name="hand-holding-heart" size={16} color={color} />
      );
    case "PRAYER":
    default:
      return (
        <FontAwesome6 name="person-praying" size={18} color={color} />
      );
  }
}

function getCategoryCardIcon(category: UiIbadahCategory) {
  switch (category) {
    case "QURAN":
      return (
        <IbadhasQuranProgressCardsIcon color={Colors.light.white} size={20} />
      );
    case "FASTING":
      return (
        <IbadhasFastingProgressCardsIcon color={Colors.light.white} size={20} />
      );
    case "SADAQAH":
      return <DashBoardHandHeartIcon color={Colors.light.white} size={18} />;
    case "PRAYER":
    default:
      return (
        <IbadhasPrayerProgressCardsIcon color={Colors.light.white} size={20} />
      );
  }
}

export const DailyProgressBottomSheet = ({ onClose }: Props) => {
  const router = useRouter();
  const { t, i18n } = useTypedTranslation();
  const [currentView, setCurrentView] = useState<ViewType>("main");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedDetailCard, setSelectedDetailCard] = useState<string | null>(
    null,
  );

  const { data: categorySummaries = [] } = useGetGoalCycleCategories({
    enabled: currentView === "categories" || currentView === "detail",
  });
  const { data: categoryGoals } = useGetGoalCycleCategoryGoals(
    selectedCategory,
    { enabled: currentView === "detail" && !!selectedCategory },
  );

  const categories = useMemo(() => {
    const titleMap: Record<UiIbadahCategory, string> = {
      PRAYER: t("homeScreen.prayerCategory"),
      QURAN: t("homeScreen.quranCategory"),
      FASTING: t("homeScreen.fastingCategory"),
      SADAQAH: t("homeScreen.sadaqahCategory"),
    };

    return categorySummaries.flatMap((item) => {
      const uiCategory = toUiIbadahCategory(item.category);
      const total = item.totalGoals ?? 0;
      if (!uiCategory || total <= 0) return [];
      return [
        {
          key: item.category.toLowerCase(),
          uiCategory,
          title: titleMap[uiCategory],
          subtitle: `${total} ${total === 1 ? "goal" : "goals"}`,
          icon: getCategoryCardIcon(uiCategory),
          iconBgColor: Colors.light.calendarBg,
          percentage: `${Math.round(item.completedPct ?? 0)}%`,
          progressColor: CATEGORY_ICON_COLOR[uiCategory],
        },
      ];
    });
  }, [categorySummaries, t]);

  const detailGoals = useMemo(() => {
    const goals = categoryGoals?.goals ?? [];
    const categorySlug = selectedCategory ?? "";
    return goals.flatMap((goal) => {
      const goalId = goalTypeToGoalId(categorySlug, goal.goalType);
      const target = goal.target ?? 0;
      if (!goalId || target <= 0) return [];
      return [
        {
          goalId,
          title: goal.displayName,
          completed: goal.completed ?? 0,
          target: goal.target ?? 0,
          unit: goal.unit ?? "",
          percentage: `${Math.round(goal.completedPct ?? 0)}%`,
        },
      ];
    });
  }, [categoryGoals?.goals, selectedCategory]);

  const selectedUiCategory = selectedCategory
    ? toUiIbadahCategory(selectedCategory)
    : null;

  const getCategoryTitle = (apiCategory: string): string => {
    const ui = toUiIbadahCategory(apiCategory);
    const map: Record<UiIbadahCategory, string> = {
      PRAYER: t("homeScreen.selectPrayerGoal"),
      QURAN: t("homeScreen.selectQuranGoal"),
      FASTING: t("homeScreen.selectFastingGoal"),
      SADAQAH: t("homeScreen.selectSadaqahGoal"),
    };
    return ui ? map[ui] : "";
  };

  const handleBack = () => {
    if (currentView === "detail") {
      setCurrentView("categories");
      setSelectedDetailCard(null);
    } else if (currentView === "categories") {
      setCurrentView("main");
      setSelectedCategory(null);
      setSelectedCard(null);
    } else {
      onClose?.();
    }
  };

  const handleCategoryPress = (categoryKey: string) => {
    setSelectedCard(categoryKey);
    setSelectedCategory(categoryKey);
    setCurrentView("detail");
  };

  const handleGoalPress = (goalId: GoalId) => {
    router.push({
      pathname: "/goalprogressloggingscreen/[goalId]" as any,
      params: { goalId },
    });
    onClose?.();
  };

  const getTitle = (): string => {
    if (currentView === "main") return t("homeScreen.logDailyProgress");
    if (currentView === "categories") return t("homeScreen.selectCategory");
    if (currentView === "detail" && selectedCategory)
      return getCategoryTitle(selectedCategory);
    return "";
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <BackButton onPress={handleBack} />
        <Text style={styles.sheetTitle}>{getTitle()}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {currentView === "main" && (
        <View style={styles.mainViewContainer}>
          <TouchableOpacity
            style={styles.mainCard}
            onPress={() => setCurrentView("categories")}
            activeOpacity={0.7}
          >
            <View style={styles.mainCardLeft}>
              <View style={styles.gridIconWrapper}>
                <Ionicons name="grid" size={18} color={Colors.light.white} />
              </View>
              <Text style={styles.mainCardTitle}>
                {t("homeScreen.selectCategory")}
              </Text>
            </View>
            <Ionicons
              name={i18n.language === "ar" ? "chevron-back" : "chevron-forward"}
              size={20}
              color={Colors.light.white}
            />
          </TouchableOpacity>
        </View>
      )}

      {currentView === "categories" && (
        <View style={styles.listContainer}>
          {categories.map((category) => (
            <IbadahsProgressCard
              key={category.key}
              title={category.title}
              subtitle={category.subtitle}
              icon={category.icon}
              iconBgColor={category.iconBgColor}
              percentage={category.percentage}
              progressColor={category.progressColor}
              isSelected={selectedCard === category.key}
              onPress={() => handleCategoryPress(category.key)}
            />
          ))}
        </View>
      )}

      {currentView === "detail" && selectedUiCategory && (
        <View style={styles.listContainer}>
          {detailGoals.map((goal) => (
            <DetailedIbadahsProgressCard
              key={goal.goalId}
              title={goal.title}
              subtitleCount={String(goal.completed)}
              subtitleLabel={`/${goal.target} ${goal.unit}`.trim()}
              icon={
                selectedUiCategory === "PRAYER"
                  ? getDetailedIbadahIcon(goal.goalId, Colors.light.white)
                  : getCategoryGoalIcon(
                      selectedUiCategory,
                      CATEGORY_ICON_COLOR[selectedUiCategory],
                    )
              }
              iconBgColor={CATEGORY_ICON_COLOR[selectedUiCategory] + "22"}
              percentage={goal.percentage}
              progressColor={CATEGORY_ICON_COLOR[selectedUiCategory]}
              isSelected={selectedDetailCard === goal.goalId}
              onPress={() => {
                setSelectedDetailCard(goal.goalId);
                handleGoalPress(goal.goalId);
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  headerSpacer: { width: 30 },
  sheetTitle: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
    letterSpacing: 0.5,
  },
  mainViewContainer: { paddingBottom: 20 },
  mainCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  mainCardLeft: { flexDirection: "row", alignItems: "center" },
  gridIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.selectcategory,
    alignItems: "center",
    justifyContent: "center",
  },
  mainCardTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 15,
    lineHeight: 18,
    marginLeft: 14,
  },
  listContainer: { paddingBottom: 20 },
});
