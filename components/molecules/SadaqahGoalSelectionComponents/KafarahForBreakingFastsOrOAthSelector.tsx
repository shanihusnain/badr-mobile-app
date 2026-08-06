import { globalStyles } from "@/src/globalstyles/globalstyles";
import { LayoutAnimation, View } from "react-native";
import { GoalSelectionOpenCloseButton } from "../GoalSelectionOpenCloseButton";
import { Counter } from "../Counter";
import { Divider } from "@/components/atoms/Divider";
import { useState } from "react";
import { TopSpace } from "@/components/atoms/TopSpace";
import PrimaryButton from "@/components/atoms/Primary-button";
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
  onSave?: () => void;
  isSaving?: boolean;
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };
  return (
    <View style={[globalStyles.goalSelectionWrapper]}>
      <GoalSelectionOpenCloseButton
        isOpen={isOpen}
        title={t("monthlyGoalPlanner.reviewLabels.kafarahBreakingFasts")}
        toggleDropdown={toggleDropdown}
      />
      {isOpen && (
        <>
          <Divider />
          <TopSpace top={16} />
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
              <PrimaryButton
                text={t("monthlyGoalPlanner.save")}
                onPress={onSave}
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
