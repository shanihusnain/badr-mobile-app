import { Colors } from "@/constants/theme";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { LayoutAnimation, View } from "react-native";
import { GoalSelectionOpenCloseButton } from "../GoalSelectionOpenCloseButton";
import { Counter } from "../Counter";
import { useState } from "react";
import { TopSpace } from "@/components/atoms/TopSpace";
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
}: {
  mealCount: number;
  setMealCount: (count: number) => void;
  handleMealDecrease: () => void;
  handleMealIncrease: () => void;
  clothCount: number;
  setClothCount: (count: number) => void;
  handleClothDecrease: () => void;
  handleClothIncrease: () => void;
  onSave?: (onDone?: () => void) => void;
  isSaving?: boolean;
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };
  return (
    <View
      style={[
        globalStyles.goalSelectionWrapper,
        { paddingBottom: isOpen ? 14 : 6 },
      ]}
    >
      <GoalSelectionOpenCloseButton
        isOpen={isOpen}
        title={t("monthlyGoalPlanner.reviewLabels.kafarahBreakingFasts")}
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
              countTitle={t("monthlyGoalPlanner.meals")}
              width={"50%"}
            />

            <Counter
              count={clothCount}
              setCount={setClothCount}
              handleDecrease={handleClothDecrease}
              handleIncrease={handleClothIncrease}
              countTitle={t("monthlyGoalPlanner.cloths")}
              width={"50%"}
            />
          </View>
          {onSave ? (
            <>
              <TopSpace top={16} />
              <GoalSelectionSaveButton
                text={t("monthlyGoalPlanner.save")}
                onPress={(markSaved) => onSave?.(markSaved)}
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
