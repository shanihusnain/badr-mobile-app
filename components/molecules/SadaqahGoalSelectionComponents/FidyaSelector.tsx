import { globalStyles } from "@/src/globalstyles/globalstyles";
import { LayoutAnimation, View } from "react-native";
import { GoalSelectionOpenCloseButton } from "../GoalSelectionOpenCloseButton";
import { Counter } from "../Counter";
import { TopSpace } from "@/components/atoms/TopSpace";
import { useGoalSelectionOpenState } from "@/hooks/useGoalSelectionOpenState";
import { useDiscardUnsavedOnCollapse } from "@/hooks/useDiscardUnsavedOnCollapse";
import GoalSelectionSaveButton from "@/components/molecules/GoalSelectionSaveButton";
import { useTranslation } from "react-i18next";

export const FidyaSelector = ({
  count,
  setCount,
  handleDecrease,
  handleIncrease,
  title,
  countTitle,
  onSave,
  isSaving,
  openOnMount = false,
  collapseSignal = 0,
  onInputFocus,
  initiallySaved = false,
}: {
  count: number;
  setCount: (value: number) => void;
  handleDecrease: () => void;
  handleIncrease: () => void;
  title: string;
  countTitle?: string;
  /** Receives the live draft count so Save is not blocked by stale parent state. */
  onSave?: (
    count: number,
    onDone?: () => void,
    onFail?: () => void,
  ) => void;
  isSaving?: boolean;
  openOnMount?: boolean;
  collapseSignal?: number;
  onInputFocus?: (layout?: { windowY: number; inputHeight: number }) => void;
  initiallySaved?: boolean;
}) => {
  const { t } = useTranslation();
  // Do not pass onInputFocus as onOpened — panel open must not trigger
  // keyboard keep-visible (only Counter TextInput focus should).
  const [isOpen, setIsOpen] = useGoalSelectionOpenState(
    openOnMount,
    undefined,
    collapseSignal,
  );
  const [draftCount, setDraftCount, commitSaved] = useDiscardUnsavedOnCollapse(
    isOpen,
    count,
    setCount,
  );

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
        isOpen={isOpen}
        title={title}
        toggleDropdown={toggleDropdown}
      />
      {isOpen && (
        <>
          <TopSpace top={24} />
          <Counter
            count={draftCount}
            setCount={applyCount}
            handleDecrease={() => applyCount(Math.max(0, draftCount - 1))}
            handleIncrease={() => applyCount(draftCount + 1)}
            countTitle={
              countTitle ?? t("monthlyGoalPlanner.meals", { count: draftCount })
            }
            width={"50%"}
            onInputFocus={onInputFocus}
          />
          {onSave ? (
            <>
              <TopSpace top={16} />
              <GoalSelectionSaveButton
                text={t("monthlyGoalPlanner.save")}
                onPress={(markSaved, markFailed) => {
                  const toSave = draftCount;
                  onSave?.(
                    toSave,
                    () => {
                      commitSaved(toSave);
                      markSaved();
                    },
                    markFailed,
                  );
                }}
                isLoading={isSaving}
                disabled={isSaving || draftCount < 1}
                initiallySaved={initiallySaved}
                valueKey={draftCount}
              />
            </>
          ) : null}
        </>
      )}
    </View>
  );
};
