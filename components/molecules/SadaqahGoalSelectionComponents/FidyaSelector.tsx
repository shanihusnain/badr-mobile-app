import { Colors } from "@/constants/theme";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { LayoutAnimation, View } from "react-native";
import { GoalSelectionOpenCloseButton } from "../GoalSelectionOpenCloseButton";
import { Counter } from "../Counter";
import { TopSpace } from "@/components/atoms/TopSpace";
import { useGoalSelectionOpenState } from "@/hooks/useGoalSelectionOpenState";
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
}: {
  count: number;
  setCount: (value: number) => void;
  handleDecrease: () => void;
  handleIncrease: () => void;
  title: string;
  countTitle?: string;
  onSave?: (onDone?: () => void, onFail?: () => void) => void;
  isSaving?: boolean;
  openOnMount?: boolean;
  collapseSignal?: number;
  onInputFocus?: () => void;
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useGoalSelectionOpenState(openOnMount, onInputFocus, collapseSignal);
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
        isOpen={isOpen}
        title={title}
        toggleDropdown={toggleDropdown}
      />
      {isOpen && (
        <>
          <TopSpace top={24} />
          <Counter
            count={count}
            setCount={setCount}
            handleDecrease={handleDecrease}
            handleIncrease={handleIncrease}
            countTitle={
              countTitle ?? t("monthlyGoalPlanner.meals", { count })
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
                  onSave?.(markSaved, markFailed);
                }}
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
