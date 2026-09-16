import { Colors } from "@/constants/theme";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { LayoutAnimation, View } from "react-native";
import { GoalSelectionOpenCloseButton } from "../GoalSelectionOpenCloseButton";
import { Counter } from "../Counter";
import { TopSpace } from "@/components/atoms/TopSpace";
import { useGoalSelectionOpenState } from "@/hooks/useGoalSelectionOpenState";
import GoalSelectionSaveButton from "@/components/molecules/GoalSelectionSaveButton";
import { useTranslation } from "react-i18next";

export const KafarahForBreakingFastsOrOAthSelector = ({
  mealCount,
  setMealCount,
  handleMealDecrease,
  handleMealIncrease,
  clothCount,
  setClothCount,
  handleClothDecrease,
  handleClothIncrease,
  onSave,
  isSaving,
  openOnMount = false,
  onInputFocus,
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
  onInputFocus?: () => void;
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useGoalSelectionOpenState(openOnMount, onInputFocus);
  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
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
              count={mealCount}
              setCount={setMealCount}
              handleDecrease={handleMealDecrease}
              handleIncrease={handleMealIncrease}
              countTitle={t("monthlyGoalPlanner.meals", { count: mealCount })}
              width={"50%"}
              onInputFocus={onInputFocus}
            />

            <Counter
              count={clothCount}
              setCount={setClothCount}
              handleDecrease={handleClothDecrease}
              handleIncrease={handleClothIncrease}
              countTitle={t("monthlyGoalPlanner.cloths", { count: clothCount })}
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
                  const handleSaved = () => {
                    markSaved?.();
                    setTimeout(() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setIsOpen(false);
                    }, 2000);
                  };
                  onSave?.(handleSaved, markFailed);
                }}
                isLoading={isSaving}
                disabled={isSaving || (mealCount < 1 && clothCount < 1)}
              />
            </>
          ) : null}
        </>
      )}
    </View>
  );
};
