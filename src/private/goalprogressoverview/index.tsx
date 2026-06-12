import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { StyleSheet, Text, TextStyle, View, ScrollView } from "react-native";
import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { Colors } from "@/constants/theme";
import { TopSpace } from "@/components/atoms/TopSpace";
import { fonts } from "@/assets/fonts";
import { useTranslation } from "react-i18next";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import { useRouter } from "expo-router";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { DetailedIbadahsProgressCard } from "@/src/private/home/components/DetailedIbadahsProgressCards";
import {
  FastingOverviewCalendarSection,
  OVERVIEW_FASTING_TRACK_TABS,
} from "@/src/private/home/components/FastingOverviewCalendarSection";
import { GoalData } from "@/src/private/home/components/goalsData";
import {
  CATEGORY_ICON_COLOR,
  getCategoryProgressOverview,
  getProgressMessageTier,
  GoalCategorySlug,
} from "./goalCategoryOverview";

type TextPart = { text: string; bold: boolean };

const splitTextWithBoldDigits = (text: string): TextPart[] => {
  const parts: TextPart[] = [];
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
      key={index}
      style={part.bold ? [baseStyle, styles.boldDigits] : baseStyle}
    >
      {part.text}
    </Text>
  ));

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

const renderCategoryIcon = (category: GoalData["category"], color: string) => {
  switch (category) {
    case "PRAYER":
      return (
        <FontAwesome6 name="person-praying" size={18} color={color} />
      );
    case "QURAN":
      return <Ionicons name="book" size={18} color={color} />;
    case "FASTING":
      return (
        <MaterialCommunityIcons name="food-off" size={18} color={color} />
      );
    case "SADAQAH":
      return (
        <FontAwesome6 name="hand-holding-heart" size={18} color={color} />
      );
    default:
      return null;
  }
};

interface GoalProgressOverViewProps {
  goal: string;
}

export const GoalProgressOverView = ({ goal }: GoalProgressOverViewProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const formatNumber = useLocaleNumber();
  const overview = getCategoryProgressOverview(goal);

  if (!overview) {
    return (
      <BlackScreenWrapper>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {t("goalProgressOverview.notFound")}
          </Text>
        </View>
      </BlackScreenWrapper>
    );
  }

  const goalsCountLabel = t("goalProgressOverview.goalsCount", {
    count: formatNumber(overview.goalsCount),
  });

  const messageTier = getProgressMessageTier(overview.averagePercentage);
  const messageParams = {
    percentage: formatNumber(overview.averagePercentage),
    count: formatNumber(overview.goalsCount),
    category: t(CATEGORY_LABEL_KEYS[overview.slug]),
  };

  const headline = t(`goalProgressOverview.tiers.${messageTier}.title`);
  const description = t(
    `goalProgressOverview.tiers.${messageTier}.description`,
    messageParams,
  );

  const categoryIconColor = CATEGORY_ICON_COLOR[overview.category];

  const handleGoalPress = (goalId: string) => {
    router.push({
      pathname: "/goalprogressloggingscreen/[goalId]",
      params: { goalId },
    });
  };

  return (
    <BlackScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
        <TaperedCircleBorder
          percentage={`${overview.averagePercentage}%`}
          progressColor={overview.progressColor}
          size={220}
          style={{ alignSelf: "center" }}
          borderColor={Colors.light.dullWhiteOpacity}
        >
          <Text style={styles.goalsCountText}>{goalsCountLabel}</Text>

          <View style={styles.percentTextContainer}>
            <Text style={styles.percentText}>
              {formatNumber(overview.averagePercentage)}
            </Text>
            <Text style={styles.percentSymbol}>%</Text>
          </View>
        </TaperedCircleBorder>
        <TopSpace top={30} />
        <Text style={styles.headline}>{headline}</Text>
        <TopSpace top={10} />
        <Text style={styles.description}>
          {renderTextWithBoldDigits(description, styles.description)}
        </Text>
        </View>
        <TopSpace top={26} />
        <Text style={styles.sectionTitle}>
          {t("progressLogging.myProgress")}
        </Text>
        <TopSpace top={16} />
        <View style={styles.goalsList}>
          {overview.goals.map((goalItem) => (
            <DetailedIbadahsProgressCard
              key={goalItem.id}
              title={goalItem.title}
              subtitleCount={goalItem.count}
              subtitleLabel={goalItem.label}
              icon={renderCategoryIcon(overview.category, categoryIconColor)}
              iconBgColor={categoryIconColor + "22"}
              percentage={goalItem.percentage}
              progressColor={goalItem.progressColor}
              onPress={() => handleGoalPress(goalItem.id)}
              titleFontSize={goalItem.titleFontSize}
            />
          ))}
        </View>
        {overview.slug === "fasting" ? (
          <>
            <TopSpace top={16} />
            <FastingOverviewCalendarSection
              trackTabs={OVERVIEW_FASTING_TRACK_TABS}
            />
          </>
        ) : null}
      </ScrollView>
    </BlackScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  card: {
    paddingHorizontal: 10,
    paddingTop: 50,
    paddingBottom: 34,
    borderRadius: 10,
    backgroundColor: Colors.light.darkgrey,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyStateText: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    textAlign: "center",
  },
  goalsCountText: {
    fontWeight: "400",
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    color: Colors.light.white,
    textAlign: "center",
  },
  headline: {
    fontWeight: "600",
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    color: Colors.light.white,
  },
  description: {
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    color: Colors.light.white,
    opacity: 0.9,
    lineHeight: 20,
  },
  boldDigits: {
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    opacity: 1,
    fontSize: 14,
    color: Colors.light.white,
    lineHeight: 20,
  },
  percentTextContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  percentText: {
    fontWeight: "400",
    fontSize: 60,
    fontFamily: fonts.primary.regular,
    color: Colors.light.white,
  },
  percentSymbol: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 30,
    fontWeight: "400",
  },
  sectionTitle: {
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    fontSize: 18,
    color: Colors.light.white,
  },
  goalsList: {
    paddingBottom: 8,
  },
});
