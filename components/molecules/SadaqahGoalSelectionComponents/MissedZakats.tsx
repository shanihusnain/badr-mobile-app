import { Colors } from "@/constants/theme";
import { TopSpace } from "@/components/atoms/TopSpace";
import GoalSelectionSaveButton from "@/components/molecules/GoalSelectionSaveButton";
import { CurrencyAndAmountSelector } from "../CurrencyAndAmountSelector";
import { Counter } from "../Counter";
import { LayoutAnimation, View } from "react-native";
import { useState } from "react";
import { GoalSelectionOpenCloseButton } from "../GoalSelectionOpenCloseButton";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { useTranslation } from "react-i18next";

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
  onSetAsDefaultCurrency,
}: {
  control: any;
  name: string;
  title?: string;
  countTitle: string;
  count: number;
  setCount: (count: number) => void;
  handleDecrease: () => void;
  handleIncrease: () => void;
  onSave?: (onDone?: () => void, onFail?: () => void) => void;
  isSaving?: boolean;
  onSetAsDefaultCurrency?: (currencyOptionValue: string) => void;
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
        { paddingBottom: isOpen ? 16 : 14 },
      ]}
    >
      <GoalSelectionOpenCloseButton
        title={title ?? t("monthlyGoalPlanner.amount")}
        isOpen={isOpen}
        toggleDropdown={toggleDropdown}
      />

      {isOpen && (
        <>
          <CurrencyAndAmountSelector
            control={control}
            name={name}
            onSetAsDefaultCurrency={onSetAsDefaultCurrency}
          />

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
              <GoalSelectionSaveButton
                text={t("monthlyGoalPlanner.save")}
                onPress={(markSaved, markFailed) =>
                  onSave?.(markSaved, markFailed)
                }
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
