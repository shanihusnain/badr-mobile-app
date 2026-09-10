import { HeaderWithCrossTitleDynamicIcon } from "@/components/atoms/HeaderWithCrossTitleDynamicIcon";
import { TopSpace } from "@/components/atoms/TopSpace";
import { JournalConsistencySection } from "@/components/molecules/JournalConsistencySection";
import { useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import {
  BEHAVIOR_DETAIL_DELTA_LABELS,
  BEHAVIOR_DETAIL_PERIOD_LABELS,
} from "./behaviorDetailMockData";
import {
  BehaviorDetailImpactCard,
  BehaviorDetailRecommendationsCard,
} from "./components/BehaviorDetailContentCards";
import { BehaviorDetailHero } from "./components/BehaviorDetailHero";
import { BehaviorDetailPeriodChart } from "./components/BehaviorDetailPeriodChart";
import { BehaviorDetailStreakCard } from "./components/BehaviorDetailStreakCard";
import { BehaviorDetailWeekDays } from "./components/BehaviorDetailWeekDays";
import { behaviorDetailStyles as styles } from "./styles";
import { useBehaviorDetailDescriptionProps } from "./useBehaviorDetailDescriptionProps";

const HERO_IMAGE_HEIGHT = 220;
const SCREEN_HEADER_HEIGHT = 100;

export const BehaviorDetailDescription = ({
  behavior,
}: {
  behavior: string;
}) => {
  const navigation = useNavigation();
  const {
    periods,
    period,
    setPeriod,
    activeSnapshot,
    deltaIsPositive,
    canGoToPreviousPeriod,
    canGoToNextPeriod,
    handlePreviousPeriodRange,
    handleNextPeriodRange,
    content,
    activePeriodView,
  } = useBehaviorDetailDescriptionProps(behavior);

  const isWeekly = period.id === 1;
  const showChart = !isWeekly && !!activePeriodView.chartBars?.length;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <View style={styles.scrollContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]}
          contentContainerStyle={styles.scrollContent}
        >
          <BehaviorDetailHero
            title={behavior}
            imageSource={content.heroImage}
            height={SCREEN_HEADER_HEIGHT + HERO_IMAGE_HEIGHT}
            periodCount={activePeriodView.periodCount}
            showHeroRing={!isWeekly}
          />

          <View style={styles.scrollBody}>
            <TopSpace top={4} />
            <JournalConsistencySection
              activeSnapshot={activeSnapshot}
              periods={periods}
              period={period}
              deltaIsPositive={deltaIsPositive}
              canGoToPreviousPeriod={canGoToPreviousPeriod}
              canGoToNextPeriod={canGoToNextPeriod}
              onSelectPeriod={setPeriod}
              onPreviousPeriodRange={handlePreviousPeriodRange}
              onNextPeriodRange={handleNextPeriodRange}
              periodLabelFormatter={(item) =>
                BEHAVIOR_DETAIL_PERIOD_LABELS[item.id]
              }
              deltaLabelFormatter={(item) =>
                BEHAVIOR_DETAIL_DELTA_LABELS[item.id]
              }
              useAbsoluteDelta
            />

            <Text style={styles.summaryText}>
              {activePeriodView.summaryDescription}
            </Text>

            {isWeekly && activePeriodView.weekDays ? (
              <BehaviorDetailWeekDays weekDays={activePeriodView.weekDays} />
            ) : null}

            {showChart ? (
              <BehaviorDetailPeriodChart
                bars={activePeriodView.chartBars ?? []}
                yMax={activePeriodView.chartYMax ?? 8}
              />
            ) : null}

            <BehaviorDetailStreakCard
              currentStreak={activePeriodView.currentStreak}
              longestStreak={activePeriodView.longestStreak}
            />

            <BehaviorDetailImpactCard
              title={content.impactTitle}
              body={content.impactBody}
              quote={content.impactQuote}
            />

            <BehaviorDetailRecommendationsCard
              title={content.recommendationsTitle}
              intro={content.recommendationsIntro}
              recommendations={content.recommendations}
              quote={content.recommendationsQuote}
              closing={content.recommendationsClosing}
            />
          </View>
        </ScrollView>
      </View>

      <View style={styles.screenHeader} pointerEvents="box-none">
        <HeaderWithCrossTitleDynamicIcon
          title="BEHAVIOR DETAILS"
          navigation={navigation}
          bgcolor="transparent"
        />
      </View>
    </View>
  );
};
