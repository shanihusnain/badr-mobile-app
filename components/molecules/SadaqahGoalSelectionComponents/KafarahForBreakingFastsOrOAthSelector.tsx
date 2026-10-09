import { globalStyles } from "@/src/globalstyles/globalstyles";
import { LayoutAnimation, View } from "react-native";
import { GoalSelectionOpenCloseButton } from "../GoalSelectionOpenCloseButton";
import { Counter } from "../Counter";
import { TopSpace } from "@/components/atoms/TopSpace";
import { useGoalSelectionOpenState } from "@/hooks/useGoalSelectionOpenState";
import { useDiscardUnsavedOnCollapse } from "@/hooks/useDiscardUnsavedOnCollapse";
import GoalSelectionSaveButton from "@/components/molecules/GoalSelectionSaveButton";
import { useTranslation } from "react-i18next";
import { useCallback, useMemo } from "react";

type KafarahDraft = { meals: number; cloths: number };

export const KafarahForBreakingFastsOrOAthSelector = ({
  mealCount,
  setMealCount,
  clothCount,
  setClothCount,
  onSave,
  isSaving,
  openOnMount = false,
  collapseSignal = 0,
  onInputFocus,
  initiallySaved = false,
}: {
  mealCount: number;
  setMealCount: (count: number) => void;
  handleMealDecrease: () => void;
  handleMealIncrease: () => void;
  clothCount: number;
  setClothCount: (count: number) => void;
  handleClothDecrease: () => void;
  handleClothIncrease: () => void;
  onSave?: (onDone?: () => void, onFail?: () => void) => void;
  isSaving?: boolean;
  openOnMount?: boolean;
  collapseSignal?: number;
  onInputFocus?: () => void;
  initiallySaved?: boolean;
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useGoalSelectionOpenState(
    openOnMount,
    onInputFocus,
    collapseSignal,
  );

  const seed = useMemo<KafarahDraft>(
    () => ({ meals: mealCount, cloths: clothCount }),
    [mealCount, clothCount],
  );

  const onRevert = useCallback(
    (saved: KafarahDraft) => {
      setMealCount(saved.meals);
      setClothCount(saved.cloths);
    },
    [setMealCount, setClothCount],
  );

  const [draft, setDraft, commitSaved] = useDiscardUnsavedOnCollapse(
    isOpen,
    seed,
    onRevert,
  );

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const applyMeals = (meals: number) => {
    const next = { ...draft, meals };
    setDraft(next);
    setMealCount(meals);
  };

  const applyCloths = (cloths: number) => {
    const next = { ...draft, cloths };
    setDraft(next);
    setClothCount(cloths);
  };

  return (
    <View
      style={[
        globalStyles.goalSelectionWrapper,
        { paddingBottom: isOpen ? 16 : 14 },
      ]}
    >
      <GoalSelectionOpenCloseButton
        isOpen={isOpen}
        title={t("monthlyGoalPlanner.kafarahTargetTitle")}
        toggleDropdown={toggleDropdown}
      />
      {isOpen && (
        <>
          <TopSpace top={24} />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Counter
              count={draft.meals}
              setCount={applyMeals}
              handleDecrease={() => applyMeals(Math.max(0, draft.meals - 1))}
              handleIncrease={() => applyMeals(draft.meals + 1)}
              countTitle={t("monthlyGoalPlanner.meals", { count: draft.meals })}
              width={"50%"}
              onInputFocus={onInputFocus}
            />

            <Counter
              count={draft.cloths}
              setCount={applyCloths}
              handleDecrease={() => applyCloths(Math.max(0, draft.cloths - 1))}
              handleIncrease={() => applyCloths(draft.cloths + 1)}
              countTitle={t("monthlyGoalPlanner.cloths", {
                count: draft.cloths,
              })}
              width={"50%"}
              onInputFocus={onInputFocus}
            />
          </View>
          {onSave ? (
            <>
              <TopSpace top={16} />
              <GoalSelectionSaveButton
                text={t("monthlyGoalPlanner.save")}
                onPress={(markSaved, markFailed) => {
                  const toSave = draft;
                  onSave?.(() => {
                    commitSaved(toSave);
                    markSaved();
                  }, markFailed);
                }}
                isLoading={isSaving}
                disabled={isSaving || (draft.meals < 1 && draft.cloths < 1)}
                initiallySaved={initiallySaved}
                valueKey={`${draft.meals}-${draft.cloths}`}
              />
            </>
          ) : null}
        </>
      )}
    </View>
  );
};
