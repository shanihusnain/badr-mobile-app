import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import { GoalData } from "../../home/components/goalsData";
import {
  getSurahMemorisationGoals,
  type SurahMemorisationGoal,
} from "../quranMemorisationSurahGoals";
import type { QuranMemorisationLogEntry } from "../types";
import { CARD_GAP, CARD_WIDTH_RATIO } from "./SurahRecitationGoals.styles";
import { SurahMemorisationGoalCard } from "./SurahMemorisationGoalCard";
import { useOptionalMemorisationSurahContext } from "../memorisationSurahContext";

type Props = {
  goalData: GoalData;
  activeFlowGoalId: string | null;
  refreshKey?: number;
  onStartFlow: (goalId: string) => void;
  onFlowClose: () => void;
  onLogComplete?: (entry: QuranMemorisationLogEntry) => void;
};

export function SurahMemorisationGoalsList({
  goalData,
  activeFlowGoalId,
  refreshKey = 0,
  onStartFlow,
  onFlowClose,
  onLogComplete,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const memorisationContext = useOptionalMemorisationSurahContext();
  const goals = useMemo(
    () => getSurahMemorisationGoals(),
    [refreshKey],
  );
  const cardWidth = screenWidth * CARD_WIDTH_RATIO;
  const [activeGoalId, setActiveGoalId] = useState(
    () => memorisationContext?.activeSurahId ?? goals[0]?.id ?? "",
  );

  const setActiveSurahIdRef = useRef(memorisationContext?.setActiveSurahId);
  setActiveSurahIdRef.current = memorisationContext?.setActiveSurahId;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstVisible = viewableItems.find((item) => item.isViewable);
      if (firstVisible?.item && typeof firstVisible.item === "object") {
        const goal = firstVisible.item as SurahMemorisationGoal;
        setActiveGoalId(goal.id);
        setActiveSurahIdRef.current?.(goal.id);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const renderItem = useCallback(
    ({ item }: { item: SurahMemorisationGoal }) => (
      <SurahMemorisationGoalCard
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

  const keyExtractor = useCallback(
    (item: SurahMemorisationGoal) => item.id,
    [],
  );

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
