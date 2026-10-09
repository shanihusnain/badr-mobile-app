import { TopSpace } from "@/components/atoms/TopSpace";
import GoalSelectionSaveButton from "@/components/molecules/GoalSelectionSaveButton";
import { CurrencyAndAmountSelector } from "../CurrencyAndAmountSelector";
import { Counter } from "../Counter";
import { LayoutAnimation, View } from "react-native";
import { useController, useWatch } from "react-hook-form";
import { useGoalSelectionOpenState } from "@/hooks/useGoalSelectionOpenState";
import { useDiscardUnsavedOnCollapse } from "@/hooks/useDiscardUnsavedOnCollapse";
import { GoalSelectionOpenCloseButton } from "../GoalSelectionOpenCloseButton";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useRef } from "react";

export const MissedZakats = ({
  control,
  name,
  title,
  countTitle,
  count,
  setCount,
  onSave,
  isSaving,
  onSetAsDefaultCurrency,
  openOnMount = false,
  collapseSignal = 0,
  onInputFocus,
  initiallySaved = false,
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
  const selectedCurrency = useWatch({ control, name });
  const { field: currencyField } = useController({ control, name });
  const savedCurrencyRef = useRef(selectedCurrency);

  const onRevertCount = useCallback(
    (saved: number) => {
      setCount(saved);
      currencyField.onChange(savedCurrencyRef.current);
    },
    [setCount, currencyField],
  );

  const [draftCount, setDraftCount, commitSaved] = useDiscardUnsavedOnCollapse(
    isOpen,
    count,
    onRevertCount,
  );

  // Capture saved currency when panel is closed (API hydrate / after save).
  useEffect(() => {
    if (!isOpen) {
      savedCurrencyRef.current = selectedCurrency;
    }
  }, [isOpen, selectedCurrency]);

  const hasCurrency = Boolean(String(selectedCurrency ?? "").trim());
  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const applyCount = (next: number) => {
    setDraftCount(next);
    setCount(next);
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
            handleDecrease={() => applyCount(Math.max(0, draftCount - 1))}
            handleIncrease={() => applyCount(draftCount + 1)}
            count={draftCount}
            setCount={applyCount}
            onInputFocus={onInputFocus}
          />
          {onSave ? (
            <>
              <TopSpace top={16} />
              <GoalSelectionSaveButton
                text={t("monthlyGoalPlanner.save")}
                onPress={(markSaved, markFailed) => {
                  const toSave = draftCount;
                  onSave?.(() => {
                    savedCurrencyRef.current = selectedCurrency;
                    commitSaved(toSave);
                    markSaved();
                  }, markFailed);
                }}
                isLoading={isSaving}
                disabled={isSaving || draftCount < 1 || !hasCurrency}
                initiallySaved={initiallySaved}
                valueKey={`${draftCount}-${String(selectedCurrency ?? "")}`}
              />
            </>
          ) : null}
        </>
      )}
    </View>
  );
};
