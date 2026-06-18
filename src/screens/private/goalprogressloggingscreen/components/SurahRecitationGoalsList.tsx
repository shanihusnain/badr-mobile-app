import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import { GoalData } from "../../home/components/goalsData";
import { isSurahRecitationGoalId, getSurahRecitationCycleMode } from "../quranRecitationTarget";
import {
  getSurahRecitationGoals,
  type SurahRecitationGoal,
} from "../quranRecitationSurahGoals";
import type { QuranRecitationLogEntry } from "../types";
import { CARD_GAP, CARD_WIDTH_RATIO } from "./SurahRecitationGoals.styles";
import { SurahRecitationGoalCard } from "./SurahRecitationGoalCard";

type Props = {
  goalData: GoalData;
  activeFlowGoalId: string | null;
  onStartFlow: (goalId: string) => void;
  onFlowClose: () => void;
  onLogComplete?: (entry: QuranRecitationLogEntry) => void;
};

export function SurahRecitationGoalsList({
  goalData,
  activeFlowGoalId,
  onStartFlow,
  onFlowClose,
  onLogComplete,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const goals = useMemo(() => {
    const allGoals = getSurahRecitationGoals();
    if (!isSurahRecitationGoalId(goalData.id)) {
      return allGoals;
    }

    const frequency = getSurahRecitationCycleMode(goalData.id);
    return allGoals.filter((goal) => goal.frequency === frequency);
  }, [goalData.id]);
  const cardWidth = screenWidth * CARD_WIDTH_RATIO;
  const [activeGoalId, setActiveGoalId] = useState(goals[0]?.id ?? "");

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstVisible = viewableItems.find((item) => item.isViewable);
      if (firstVisible?.item && typeof firstVisible.item === "object") {
        const goal = firstVisible.item as SurahRecitationGoal;
        setActiveGoalId(goal.id);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const renderItem = useCallback(
    ({ item }: { item: SurahRecitationGoal }) => (
      <SurahRecitationGoalCard
        goal={item}
        goalData={goalData}
        cardWidth={cardWidth}
        isInView={item.id === activeGoalId}
        isFlowActive={item.id === activeFlowGoalId}
        onStartFlow={onStartFlow}
        onFlowClose={onFlowClose}
        onLogComplete={onLogComplete}
      />
    ),
    [
      activeFlowGoalId,
      activeGoalId,
      cardWidth,
      goalData,
      onFlowClose,
      onStartFlow,
      onLogComplete,
    ],
  );

  const keyExtractor = useCallback((item: SurahRecitationGoal) => item.id, []);

  const itemSeparator = useCallback(
    () => <View style={{ width: CARD_GAP }} />,
    [],
  );

  return (
    <FlatList
      horizontal
      data={goals}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={itemSeparator}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      decelerationRate="fast"
      snapToInterval={cardWidth + CARD_GAP}
      snapToAlignment="start"
      removeClippedSubviews={false}
      style={{ overflow: "visible" }}
      contentContainerStyle={{ paddingRight: 16 }}
    />
  );
}
