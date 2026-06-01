import { TopSpace } from "@/components/atoms/TopSpace";
import { CurrencyAndAmountSelector } from "../CurrencyAndAmountSelector";
import { Counter } from "../Counter";
import { LayoutAnimation, Pressable, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/theme";
import { useState } from "react";
import { GoalSelectionOpenCloseButton } from "../GoalSelectionOpenCloseButton";
import { globalStyles } from "@/src/globalstyles/globalstyles";

export const MissedZakats = ({
  control,
  name,
  countTitle,
  count,
  setCount,
  handleDecrease,
  handleIncrease,
}: {
  control: any;
  name: string;
  countTitle: string;
  count: number;
  setCount: (count: number) => void;
  handleDecrease: () => void;
  handleIncrease: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };
  return (
    <View style={globalStyles.goalSelectionWrapper}>
      <GoalSelectionOpenCloseButton
        title={"Select target for this month"}
        isOpen={isOpen}
        toggleDropdown={toggleDropdown}
      />

      {isOpen && (
        <>
          <CurrencyAndAmountSelector control={control} name={name} />

          <TopSpace top={16} />
          <Counter
            countTitle={countTitle}
            handleDecrease={handleDecrease}
            handleIncrease={handleIncrease}
            count={count}
            setCount={setCount}
          />
        </>
      )}
    </View>
  );
};
