import { TopSpace } from "@/components/atoms/TopSpace";
import GoalSelectionSaveButton from "@/components/molecules/GoalSelectionSaveButton";
import { CurrencyAndAmountSelector } from "../CurrencyAndAmountSelector";
import { Counter } from "../Counter";
import { LayoutAnimation, View } from "react-native";
import { useWatch } from "react-hook-form";
import { useGoalSelectionOpenState } from "@/hooks/useGoalSelectionOpenState";
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
  openOnMount = false,
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
  openOnMount?: boolean;
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useGoalSelectionOpenState(openOnMount);
  const selectedCurrency = useWatch({ control, name });
  const hasCurrency = Boolean(String(selectedCurrency ?? "").trim());
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
                disabled={isSaving || count < 1 || !hasCurrency}
              />
            </>
          ) : null}
        </>
      )}
    </View>
  );
};
