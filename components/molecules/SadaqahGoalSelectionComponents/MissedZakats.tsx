import { TopSpace } from "@/components/atoms/TopSpace";
import PrimaryButton from "@/components/atoms/Primary-button";
import { CurrencyAndAmountSelector } from "../CurrencyAndAmountSelector";
import { Counter } from "../Counter";
import { LayoutAnimation, View } from "react-native";
import { useState } from "react";
import { GoalSelectionOpenCloseButton } from "../GoalSelectionOpenCloseButton";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { useTranslation } from "react-i18next";
import { Divider } from "@/components/atoms/Divider";

export const MissedZakats = ({
  control,
  name,
  title,
  countTitle,
  count,
  setCount,
  handleDecrease,
  handleIncrease,
  onSave,
  isSaving,
}: {
  control: any;
  name: string;
  title?: string;
  countTitle: string;
  count: number;
  setCount: (count: number) => void;
  handleDecrease: () => void;
  handleIncrease: () => void;
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
    <View style={globalStyles.goalSelectionWrapper}>
      <GoalSelectionOpenCloseButton
        title={title ?? t("monthlyGoalPlanner.amount")}
        isOpen={isOpen}
        toggleDropdown={toggleDropdown}
      />

      {isOpen && (
        <>
          <Divider />
          <CurrencyAndAmountSelector control={control} name={name} />

          <TopSpace top={16} />
          <Counter
            countTitle={countTitle}
            handleDecrease={handleDecrease}
            handleIncrease={handleIncrease}
            count={count}
            setCount={setCount}
          />
          {onSave ? (
            <>
              <TopSpace top={16} />
              <PrimaryButton
                text={t("monthlyGoalPlanner.save")}
                onPress={onSave}
                isLoading={isSaving}
                disabled={isSaving || count < 1}
              />
            </>
          ) : null}
        </>
      )}
    </View>
  );
};
