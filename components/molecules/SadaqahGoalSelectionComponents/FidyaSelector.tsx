import { globalStyles } from "@/src/globalstyles/globalstyles";
import { LayoutAnimation, View } from "react-native";
import { GoalSelectionOpenCloseButton } from "../GoalSelectionOpenCloseButton";
import { Counter } from "../Counter";
import { useState } from "react";
import { Divider } from "@/components/atoms/Divider";
import { TopSpace } from "@/components/atoms/TopSpace";
import { useTranslation } from "react-i18next";

export const FidyaSelector = ({
  count,
  setCount,
  handleDecrease,
  handleIncrease,
  title,
  countTitle,
}: {
  count: number;
  setCount: (value: number) => void;
  handleDecrease: () => void;
  handleIncrease: () => void;
  title: string;
  countTitle?: string;
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };
  return (
    <View style={globalStyles.goalSelectionWrapper}>
      <GoalSelectionOpenCloseButton
        isOpen={isOpen}
        title={title}
        toggleDropdown={toggleDropdown}
      />
      {isOpen && (
        <>
          <Divider />
          <TopSpace top={16} />
          <Counter
            count={count}
            setCount={setCount}
            handleDecrease={handleDecrease}
            handleIncrease={handleIncrease}
            countTitle={countTitle ?? t("monthlyGoalPlanner.meals")}
            width={"50%"}
          />
        </>
      )}
    </View>
  );
};
