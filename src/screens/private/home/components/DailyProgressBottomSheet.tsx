import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { IbadhasPrayerProgressCardsIcon } from "@/assets/icons/IbadhasPrayerProgressCardsIcon";
import { IbadhasQuranProgressCardsIcon } from "@/assets/icons/IbadhasQuranProgressCardsIcon";
import { IbadhasFastingProgressCardsIcon } from "@/assets/icons/IbadhasFastingProgressCardsIcon";
import { HeartOnHandIcon } from "@/assets/icons/HeartOnHandIcon";
import { DashBoardHandHeartIcon } from "@/assets/icons/DashBoardHandHeartIcon";
import { useRouter } from "expo-router";
import { IbadahsProgressCard } from "./IbadahsProgressCard";
import {
  DetailedIbadahsProgressCard,
  getDetailedIbadahIcon,
} from "./DetailedIbadahsProgressCards";
import {
  getResolvedGoalsByCategory,
  type GoalData,
  type GoalId,
} from "./goalsData";
import BackButton from "@/components/atoms/Backbutton";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";

type ViewType = "main" | "categories" | "detail";

type Props = {
  onClose?: () => void;
};

const CATEGORY_ICON_COLOR: Record<string, string> = {
  PRAYER: Colors.light.ringPrayer,
  QURAN: Colors.light.ringQuran,
  FASTING: Colors.light.green,
  SADAQAH: Colors.light.ringSadaqah,
};

function getCategoryGoalIcon(category: string, color: string) {
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

function getGoalDisplayTitle(
  goal: GoalData,
  t: ReturnType<typeof useTypedTranslation>["t"],
): string {
  if (goal.id === "quran-recitationBySurah-daily") {
    return t("homeScreen.quranRecitationBySurahDaily");
  }
  if (goal.id === "quran-recitationBySurah-weekly") {
    return t("homeScreen.quranRecitationBySurahWeekly");
  }
  return goal.title;
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

  const categories = [
    {
      key: "PRAYER",
      title: t("homeScreen.prayerCategory"),
      subtitle: t("homeScreen.prayer10Goals"),
      icon: <IbadhasPrayerProgressCardsIcon color={Colors.light.white} size={20} />,
      iconBgColor: Colors.light.calendarBg,
      percentage: "34%",
      progressColor: Colors.light.ringPrayer,
    },
    {
      key: "QURAN",
      title: t("homeScreen.quranCategory"),
      subtitle: t("homeScreen.quran7Goals"),
      icon: <IbadhasQuranProgressCardsIcon color={Colors.light.white} size={20} />,
      iconBgColor: Colors.light.calendarBg,
      percentage: "40%",
      progressColor: Colors.light.ringQuran,
    },
    {
      key: "FASTING",
      title: t("homeScreen.fastingCategory"),
      subtitle: t("homeScreen.fasting4Goals"),
      icon: <IbadhasFastingProgressCardsIcon color={Colors.light.white} size={20} />,
      iconBgColor: Colors.light.calendarBg,
      percentage: "65%",
      progressColor: Colors.light.green,
    },
    {
      key: "SADAQAH",
      title: t("homeScreen.sadaqahCategory"),
      subtitle: t("homeScreen.sadaqah6Goals"),
      icon: <DashBoardHandHeartIcon color={Colors.light.white} size={18} />,
      iconBgColor: Colors.light.calendarBg,
      percentage: "85%",
      progressColor: Colors.light.ringSadaqah,
    },
  ];

  const getCategoryTitle = (category: string): string => {
    const map: Record<string, string> = {
      PRAYER: t("homeScreen.selectPrayerGoal"),
      QURAN: t("homeScreen.selectQuranGoal"),
      FASTING: t("homeScreen.selectFastingGoal"),
      SADAQAH: t("homeScreen.selectSadaqahGoal"),
    };
    return map[category] ?? "";
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

      {currentView === "detail" && selectedCategory && (
        <View style={styles.listContainer}>
          {getResolvedGoalsByCategory(
            selectedCategory as "PRAYER" | "QURAN" | "FASTING" | "SADAQAH",
          ).map((goal) => (
            <DetailedIbadahsProgressCard
              key={goal.id}
              title={getGoalDisplayTitle(goal, t)}
              subtitleCount={goal.count}
              subtitleLabel={goal.label}
              icon={
                selectedCategory === "PRAYER"
                  ? getDetailedIbadahIcon(goal.id, Colors.light.white)
                  : getCategoryGoalIcon(
                      selectedCategory,
                      CATEGORY_ICON_COLOR[selectedCategory],
                    )
              }
              iconBgColor={CATEGORY_ICON_COLOR[selectedCategory] + "22"}
              percentage={goal.percentage}
              progressColor={goal.progressColor}
              isSelected={selectedDetailCard === goal.id}
              onPress={() => {
                setSelectedDetailCard(goal.id);
                handleGoalPress(goal.id);
              }}
              titleFontSize={goal.titleFontSize}
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
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  mainCardLeft: { flexDirection: "row", alignItems: "center" },
  gridIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.selectcategory,
    alignItems: "center",
    justifyContent: "center",
  },
  mainCardTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 14,
  },
  listContainer: { paddingBottom: 20 },
});
