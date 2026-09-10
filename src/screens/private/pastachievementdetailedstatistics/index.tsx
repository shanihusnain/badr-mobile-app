import { ScrollView, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/theme";
import { PrayerPastAchievements } from "@/components/molecules/PrayerPastAchievements";
import type { GoalId } from "@/src/screens/private/home/components/goalsData";
import { getGoalById } from "@/src/screens/private/home/components/goalsData";
import { SadaqahPastAchievements } from "@/components/molecules/SadaqahPastAchievements";
import { QuranRecitationPastAchievements } from "@/components/molecules/QuranRecitationPastAchievements";
import { QuranJuzPastAchievements } from "@/components/molecules/QuranJuzPastAchievements";
import { QuranHoursPastAchievements } from "@/components/molecules/QuranHoursPastAchievements";
import { RecitationSurahProvider } from "@/src/screens/private/goalprogressloggingscreen/recitationSurahContext";
import { isSurahRecitationGoalId } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationTarget";
import {
  isJuzRecitationGoalId,
  isQuranHoursGoalId,
  isCompletionGoalId,
} from "@/src/screens/private/goalprogressloggingscreen/types";
import { QuranCompletionPastAchievements } from "@/components/molecules/QuranCompletionPastAchievements";
import { QuranMemorisationPastAchievements } from "@/components/molecules/QuranMemorisationPastAchievements";
import { MemorisationSurahProvider } from "@/src/screens/private/goalprogressloggingscreen/memorisationSurahContext";
import { MemorisationHizbProvider } from "@/src/screens/private/goalprogressloggingscreen/memorisationHizbContext";
import { MemorisationJuzProvider } from "@/src/screens/private/goalprogressloggingscreen/memorisationJuzContext";
import { isSurahMemorisationGoalId } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationTarget";
import { isHizbMemorisationGoalId } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationHizbTarget";
import { isJuzMemorisationGoalId } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationJuzTarget";
import { QuranMemorisationJuzPastAchievements } from "@/components/molecules/QuranMemorisationJuzPastAchievements";
import { MissedRamadanFastsPastAchievements } from "@/components/molecules/MissedRamadanFastsPastAchievements";
import { isMissedRamadanFastsGoalId } from "@/src/screens/private/goalprogressloggingscreen/missedRamadanFastsTarget";
import { isProphetDawoodFastsGoalId } from "@/src/screens/private/goalprogressloggingscreen/prophetDawoodFastsTarget";
import { isWhiteDaysFastsGoalId } from "@/src/screens/private/goalprogressloggingscreen/whiteDaysFastsTarget";
import { isMondayThursdayFastsGoalId } from "@/src/screens/private/goalprogressloggingscreen/mondayThursdayFastsTarget";
import { MondayThursdayFastsPastAchievements } from "@/components/molecules/MondayThursdayFastsPastAchievements";
import { WhiteDaysFastsPastAchievements } from "@/components/molecules/WhiteDaysFastsPastAchievements";
import {
  parseJuzAnalyticsView,
  parseJuzFilterId,
  parseMissedRamadanAnalyticsView,
  parseProphetDawoodAnalyticsView,
  parseWhiteDaysAnalyticsView,
  parseMondayThursdayAnalyticsView,
  parsePastAchievementPeriod,
  parseRecitationAnalyticsView,
  type PastAchievementDetailedRouteParams,
} from "./routeParams";

type PastAchievementDetailedStatisticsScreenProps =
  PastAchievementDetailedRouteParams & {
    goalId: GoalId;
  };

export default function PastAchievementDetailedStatisticsScreen({
  goalId,
  period,
  analyticsView,
  selectedSurahId,
  selectedJuzFilter,
  selectedHizbFilter,
  selectedMemorisationJuzFilter,
}: PastAchievementDetailedStatisticsScreenProps) {
  const goalData = getGoalById(goalId);
  console.log("pastachivement screen called");
  if (!goalData) {
    return null;
  }

  const initialPeriod = parsePastAchievementPeriod(period);
  const initialRecitationAnalyticsView =
    parseRecitationAnalyticsView(analyticsView);
  const initialJuzAnalyticsView = parseJuzAnalyticsView(analyticsView);
  const initialJuzFilter = parseJuzFilterId(selectedJuzFilter);

  let content = null;
  if (goalData.category === "PRAYER") {
    content = <PrayerPastAchievements goalId={goalId} isDetailed={true} />;
  } else if (goalData.category === "SADAQAH") {
    content = <SadaqahPastAchievements goalId={goalId} isDetailed={true} />;
  } else if (isSurahRecitationGoalId(goalId)) {
    content = (
      <RecitationSurahProvider goalId={goalId} initialSurahId={selectedSurahId}>
        <QuranRecitationPastAchievements
          goalId={goalId}
          isDetailed={true}
          initialPeriod={initialPeriod}
          initialAnalyticsView={initialRecitationAnalyticsView}
          initialSurahId={selectedSurahId}
        />
      </RecitationSurahProvider>
    );
  } else if (isJuzRecitationGoalId(goalId)) {
    content = (
      <QuranJuzPastAchievements
        goalId={goalId}
        isDetailed={true}
        initialPeriod={initialPeriod}
        initialAnalyticsView={initialJuzAnalyticsView}
        initialJuzFilter={initialJuzFilter}
      />
    );
  } else if (isCompletionGoalId(goalId)) {
    content = (
      <QuranCompletionPastAchievements
        goalId={goalId}
        isDetailed={true}
        initialPeriod={initialPeriod}
        initialAnalyticsView={initialJuzAnalyticsView}
      />
    );
  } else if (isQuranHoursGoalId(goalId)) {
    content = (
      <QuranHoursPastAchievements
        goalId={goalId}
        isDetailed={true}
        initialPeriod={initialPeriod}
      />
    );
  } else if (isSurahMemorisationGoalId(goalId)) {
    content = (
      <MemorisationSurahProvider>
        <QuranMemorisationPastAchievements
          goalId={goalId}
          isDetailed={true}
          initialPeriod={initialPeriod}
          initialAnalyticsView={initialRecitationAnalyticsView}
          initialSurahId={selectedSurahId}
        />
      </MemorisationSurahProvider>
    );
  } else if (isHizbMemorisationGoalId(goalId)) {
    content = (
      <MemorisationHizbProvider>
        <QuranMemorisationPastAchievements
          goalId={goalId}
          isDetailed={true}
          initialPeriod={initialPeriod}
          initialAnalyticsView={initialRecitationAnalyticsView}
          initialHizbId={selectedHizbFilter}
        />
      </MemorisationHizbProvider>
    );
  } else if (isJuzMemorisationGoalId(goalId)) {
    content = (
      <MemorisationJuzProvider>
        <QuranMemorisationJuzPastAchievements
          goalId={goalId}
          isDetailed={true}
          initialPeriod={initialPeriod}
          initialAnalyticsView={initialRecitationAnalyticsView}
          initialJuzId={selectedMemorisationJuzFilter}
        />
      </MemorisationJuzProvider>
    );
  } else if (isMissedRamadanFastsGoalId(goalId)) {
    content = (
      <MissedRamadanFastsPastAchievements
        isDetailed={true}
        initialPeriod={initialPeriod}
        initialAnalyticsView={parseMissedRamadanAnalyticsView(analyticsView)}
      />
    );
  } else if (isProphetDawoodFastsGoalId(goalId)) {
    content = (
      <MissedRamadanFastsPastAchievements
        variant="prophetDawood"
        isDetailed={true}
        initialPeriod={initialPeriod}
        initialAnalyticsView={parseProphetDawoodAnalyticsView(analyticsView)}
      />
    );
  } else if (isWhiteDaysFastsGoalId(goalId)) {
    content = (
      <WhiteDaysFastsPastAchievements
        isDetailed={true}
        initialPeriod={initialPeriod}
        initialAnalyticsView={parseWhiteDaysAnalyticsView(analyticsView)}
      />
    );
  } else if (isMondayThursdayFastsGoalId(goalId)) {
    content = (
      <MondayThursdayFastsPastAchievements
        isDetailed={true}
        initialPeriod={initialPeriod}
        initialAnalyticsView={parseMondayThursdayAnalyticsView(analyticsView)}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.inner}>{content}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.blackBackground,
  },
  content: {
    paddingBottom: 40,
  },
  inner: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
