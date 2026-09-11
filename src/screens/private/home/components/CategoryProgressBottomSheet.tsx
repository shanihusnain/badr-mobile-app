import React, { forwardRef, useCallback, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { BottomSheetWrapper } from "@/components/molecules/BottomSheetWrapper";
import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { TopSpace } from "@/components/atoms/TopSpace";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { BackChevron } from "@/assets/icons";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { useGetGoalCycleCategories } from "@/src/api/queries/useGetGoalCycleCategories";
import { useGetGoalCycleCategoryGoals } from "@/src/api/queries/useGetGoalCycleCategoryGoals";
import {
  goalTypeToGoalId,
  toUiIbadahCategory,
  type UiIbadahCategory,
} from "@/src/utils/goalCycleCategoryMap";
import {
  CATEGORY_ICON_COLOR,
  getProgressMessageTier,
  type GoalCategorySlug,
} from "@/src/screens/private/goalprogressoverview/goalCategoryOverview";
import {
  DetailedIbadahsProgressCard,
  getDetailedIbadahIcon,
} from "./DetailedIbadahsProgressCards";
import type { GoalId } from "./goalsData";
import { styles as homeStyles } from "../styles";

type Props = {
  category: string | null;
  onClose: () => void;
  onChange?: (index: number) => void;
};

const CATEGORY_SHEET_TITLE_KEYS: Record<
  UiIbadahCategory,
  | "homeScreen.filterPrayer"
  | "homeScreen.filterQuran"
  | "homeScreen.filterFasting"
  | "homeScreen.filterSadaqah"
> = {
  PRAYER: "homeScreen.filterPrayer",
  QURAN: "homeScreen.filterQuran",
  FASTING: "homeScreen.filterFasting",
  SADAQAH: "homeScreen.filterSadaqah",
};

const CATEGORY_LABEL_KEYS: Record<
  GoalCategorySlug,
  | "goalProgressOverview.categoryPrayer"
  | "goalProgressOverview.categoryQuran"
  | "goalProgressOverview.categoryFasting"
  | "goalProgressOverview.categorySadaqah"
> = {
  prayer: "goalProgressOverview.categoryPrayer",
  quran: "goalProgressOverview.categoryQuran",
  fasting: "goalProgressOverview.categoryFasting",
  sadaqah: "goalProgressOverview.categorySadaqah",
};

type BoldDigitTextPart = { text: string; bold: boolean };

const splitTextWithBoldDigits = (text: string): BoldDigitTextPart[] => {
  const parts: BoldDigitTextPart[] = [];
  const digitPattern = /\d+%?/g;
  let lastIndex = 0;

  for (const match of text.matchAll(digitPattern)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, index), bold: false });
    }

    parts.push({ text: match[0], bold: true });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), bold: false });
  }

  return parts.length > 0 ? parts : [{ text, bold: false }];
};

const renderTextWithBoldDigits = (text: string, baseStyle: TextStyle) =>
  splitTextWithBoldDigits(text).map((part, index) => (
    <Text
      key={`${part.text}-${index}`}
      style={part.bold ? [baseStyle, homeStyles.boldDigits] : baseStyle}
    >
      {part.text}
    </Text>
  ));

function getCategoryGoalIcon(category: UiIbadahCategory, color: string) {
  switch (category) {
    case "QURAN":
      return <Ionicons name="book" size={18} color={color} />;
    case "FASTING":
      return <MaterialCommunityIcons name="food-off" size={18} color={color} />;
    case "SADAQAH":
      return <FontAwesome6 name="hand-holding-heart" size={16} color={color} />;
    case "PRAYER":
    default:
      return <FontAwesome6 name="person-praying" size={18} color={color} />;
  }
}

export const CategoryProgressBottomSheet = forwardRef<BottomSheet, Props>(
  function CategoryProgressBottomSheet({ category, onClose, onChange }, ref) {
    const router = useRouter();
    const { t } = useTypedTranslation();
    const formatNumber = useLocaleNumber();

    const { data: categorySummaries = [], isLoading: isCategoriesLoading } =
      useGetGoalCycleCategories({ enabled: !!category });
    const { data: categoryGoals, isLoading: isCategoryGoalsLoading } =
      useGetGoalCycleCategoryGoals(category, {
        enabled: !!category,
      });

    const selectedSummary = useMemo(() => {
      if (!category) return null;
      return (
        categorySummaries.find(
          (item) => item.category.toLowerCase() === category.toLowerCase(),
        ) ?? null
      );
    }, [category, categorySummaries]);

    const uiCategory = category ? toUiIbadahCategory(category) : null;
    const completedPct = Math.round(selectedSummary?.completedPct ?? 0);
    const totalGoals = selectedSummary?.totalGoals ?? 0;
    const progressColor = uiCategory
      ? CATEGORY_ICON_COLOR[uiCategory]
      : Colors.light.ringPrayer;
    const title = uiCategory ? t(CATEGORY_SHEET_TITLE_KEYS[uiCategory]) : "";

    const detailGoals = useMemo(() => {
      if (!category) return [];
      if (isCategoryGoalsLoading) {
        const placeholderCount = totalGoals > 0 ? totalGoals : 4;
        return Array.from({ length: placeholderCount }, (_, index) => ({
          goalId: `loading-${index}` as GoalId,
          title: "---",
          completed: 0,
          target: 0,
          unit: "",
          percentage: "0%",
          loading: true,
        }));
      }

      const goals = categoryGoals?.goals ?? [];
      return goals.flatMap((goal) => {
        const goalId = goalTypeToGoalId(category, goal.goalType);
        const target = goal.target ?? 0;
        if (!goalId || target <= 0) return [];
        return [
          {
            goalId,
            title:
              goalId === "prayer-tahiyyatMasjid"
                ? goal.displayName.replace(/\s+Prayer$/i, "")
                : goal.displayName,
            completed: goal.completed ?? 0,
            target,
            unit: goal.unit ?? "",
            percentage: `${Math.round(goal.completedPct ?? 0)}%`,
            loading: false,
          },
        ];
      });
    }, [
      category,
      categoryGoals?.goals,
      isCategoryGoalsLoading,
      totalGoals,
    ]);

    const categorySlug = (category?.toLowerCase() ??
      "prayer") as GoalCategorySlug;
    const messageTier = getProgressMessageTier(completedPct);
    const goalsCountLabel = t("goalProgressOverview.goalsCount", {
      count: formatNumber(totalGoals),
    });
    const headline = t(`goalProgressOverview.tiers.${messageTier}.title`);
    const description = t(
      `goalProgressOverview.tiers.${messageTier}.description`,
      {
        percentage: formatNumber(completedPct),
        count: formatNumber(totalGoals),
        category: t(
          CATEGORY_LABEL_KEYS[categorySlug] ??
            "goalProgressOverview.categoryPrayer",
        ),
      },
    );

    const handleGoalPress = useCallback(
      (goalId: GoalId) => {
        router.push({
          pathname: "/goalprogressloggingscreen/[goalId]" as any,
          params: { goalId },
        });
        onClose();
      },
      [onClose, router],
    );

    const handleChange = useCallback(
      (index: number) => {
        onChange?.(index);
      },
      [onChange],
    );

    return (
      <BottomSheetWrapper
        ref={ref}
        snapPoints={["92%", "92%"]}
        bgColor={Colors.light.blackBackground}
        onChange={handleChange}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.backButton}>
              <BackChevron />
            </Pressable>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>

          <TopSpace top={40} />

          <View style={styles.summaryCard}>
            <TopSpace top={30} />
            <TaperedCircleBorder
              size={180}
              progressColor={progressColor}
              style={styles.ring}
              variant="illuminated"
              percentage={`${completedPct}%`}
            >
              <Text style={styles.goalsCountText}>
                {isCategoriesLoading ? "---" : goalsCountLabel}
              </Text>
              <TopSpace top={6} />
              <View style={styles.percentRow}>
                <Text style={styles.percentText}>
                  {isCategoriesLoading ? "—" : formatNumber(completedPct)}
                </Text>
                <Text style={styles.percentSymbol}>%</Text>
              </View>
            </TaperedCircleBorder>

            <TopSpace top={40} />
            <Text style={styles.headline}>{headline}</Text>
            <TopSpace top={12} />
            <Text style={homeStyles.commitmentDescription}>
              {renderTextWithBoldDigits(
                description,
                homeStyles.commitmentDescription,
              )}
            </Text>
          </View>

          <TopSpace top={26} />
          <Text style={styles.sectionTitle}>
            {title ? `${title} tracker` : ""}
          </Text>
          <TopSpace top={16} />

          {isCategoryGoalsLoading && detailGoals.length === 0 ? (
            <View style={styles.loadingWrap}>
              <LoadingComponent size="medium" />
            </View>
          ) : (
            detailGoals.map((goal) => (
              <DetailedIbadahsProgressCard
                key={goal.goalId}
                title={goal.title}
                subtitleCount={String(goal.completed)}
                subtitleLabel={`/${goal.target} ${goal.unit}`.trim()}
                icon={
                  goal.loading || uiCategory !== "PRAYER"
                    ? getCategoryGoalIcon(uiCategory ?? "PRAYER", progressColor)
                    : getDetailedIbadahIcon(goal.goalId, Colors.light.white)
                }
                iconBgColor={progressColor + "22"}
                percentage={goal.percentage}
                progressColor={progressColor}
                loading={goal.loading}
                onPress={
                  goal.loading ? undefined : () => handleGoalPress(goal.goalId)
                }
              />
            ))
          )}
        </ScrollView>
      </BottomSheetWrapper>
    );
  },
);

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 40,
    padding: 3,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    color: Colors.light.white,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: Colors.light.calendarBg,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 10,
  },
  ring: {
    alignSelf: "center",
  },
  goalsCountText: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    fontFamily: fonts.primary.regular,
  },
  percentRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  percentText: {
    color: Colors.light.white,
    fontSize: 60,
    fontWeight: "400",
    textAlign: "center",
    fontFamily: fonts.primary.regular,
  },
  percentSymbol: {
    fontSize: 30,
    fontWeight: "400",
    textAlign: "center",
    fontFamily: fonts.primary.regular,
    color: Colors.light.white,
  },
  headline: {
    textAlign: "left",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    color: Colors.light.white,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    color: Colors.light.white,
    textAlign: "left",
    lineHeight: 20,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: "center",
  },
});
