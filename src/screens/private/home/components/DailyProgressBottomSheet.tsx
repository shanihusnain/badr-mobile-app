import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { IbadahsProgressCard } from "./IbadahsProgressCard";
import { DetailedIbadahsProgressCard } from "./DetailedIbadahsProgressCards";
import { getGoalsByCategory } from "./goalsData";
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
      icon: (
        <FontAwesome6
          name="person-praying"
          size={20}
          color={Colors.light.white}
        />
      ),
      iconBgColor: Colors.light.ringPrayer + "33",
      percentage: "34%",
      progressColor: Colors.light.ringPrayer,
    },
    {
      key: "QURAN",
      title: t("homeScreen.quranCategory"),
      subtitle: t("homeScreen.quran4Goals"),
      icon: <Ionicons name="book" size={20} color={Colors.light.white} />,
      iconBgColor: Colors.light.ringQuran + "33",
      percentage: "40%",
      progressColor: Colors.light.ringQuran,
    },

    {
      key: "FASTING",
      title: t("homeScreen.fastingCategory"),
      subtitle: t("homeScreen.fasting4Goals"),
      icon: (
        <MaterialCommunityIcons
          name="food-off"
          size={20}
          color={Colors.light.white}
        />
      ),
      iconBgColor: Colors.light.green + "33",
      percentage: "65%",
      progressColor: Colors.light.green,
    },
    {
      key: "SADAQAH",
      title: t("homeScreen.sadaqahCategory"),
      subtitle: t("homeScreen.sadaqah6Goals"),
      icon: (
        <FontAwesome6
          name="hand-holding-heart"
          size={18}
          color={Colors.light.white}
        />
      ),
      iconBgColor: Colors.light.ringSadaqah + "33",
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

  const handleGoalPress = (goalId: string) => {
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
      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <BackButton onPress={handleBack} />
        <Text style={styles.sheetTitle}>{getTitle()}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ── Main view ── */}
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

      {/* ── Categories view ── */}
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

      {/* ── Detail view ── */}
      {currentView === "detail" && selectedCategory && (
        <View style={styles.listContainer}>
          {getGoalsByCategory(
            selectedCategory as "PRAYER" | "QURAN" | "FASTING" | "SADAQAH",
          ).map((goal) => (
            <DetailedIbadahsProgressCard
              key={goal.id}
              title={goal.title}
              subtitleCount={goal.count}
              subtitleLabel={goal.label}
              icon={
                <FontAwesome6
                  name="person-praying"
                  size={18}
                  color={CATEGORY_ICON_COLOR[selectedCategory]}
                />
              }
              iconBgColor={CATEGORY_ICON_COLOR[selectedCategory] + "22"}
              percentage={goal.percentage}
              progressColor={goal.progressColor}
              isSelected={selectedDetailCard === goal.id}
              onPress={() => {
                console.log("goal.id", goal.id);
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
