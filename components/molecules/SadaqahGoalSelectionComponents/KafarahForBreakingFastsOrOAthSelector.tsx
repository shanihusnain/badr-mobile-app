import { globalStyles } from "@/src/globalstyles/globalstyles";
import { LayoutAnimation, View } from "react-native";
import { GoalSelectionOpenCloseButton } from "../GoalSelectionOpenCloseButton";
import { Counter } from "../Counter";
import { set } from "zod";
import { Divider } from "@/components/atoms/Divider";
import { useState } from "react";
import { TopSpace } from "@/components/atoms/TopSpace";

export const KafarahForBreakingFastsOrOAthSelector = ({
  mealCount,
  setMealCount,
  handleMealDecrease,
  handleMealIncrease,
  clothCount,
  setClothCount,
  handleClothDecrease,
  handleClothIncrease,
}: {
  mealCount: number;
  setMealCount: (count: number) => void;
  handleMealDecrease: () => void;
  handleMealIncrease: () => void;
  clothCount: number;
  setClothCount: (count: number) => void;
  handleClothDecrease: () => void;
  handleClothIncrease: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };
  return (
    <View style={[globalStyles.goalSelectionWrapper]}>
      <GoalSelectionOpenCloseButton
        isOpen={isOpen}
        title={"Kafarah for breaking fasts or oaths"}
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
              countTitle="Meal(s)"
              width={"50%"}
            />

            <Counter
              count={clothCount}
              setCount={setClothCount}
              handleDecrease={handleClothDecrease}
              handleIncrease={handleClothIncrease}
              countTitle="Cloth(s)"
              width={"50%"}
            />
          </View>
        </>
      )}
    </View>
  );
};
