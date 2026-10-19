import React, { memo, useState } from "react";
import { MissedZakats } from "@/components/molecules/SadaqahGoalSelectionComponents/MissedZakats";
import { KafarahForBreakingFastsOrOAthSelector } from "@/components/molecules/SadaqahGoalSelectionComponents/KafarahForBreakingFastsOrOAthSelector";
import { FidyaSelector } from "@/components/molecules/SadaqahGoalSelectionComponents/FidyaSelector";

type FocusLayout = { windowY: number; inputHeight: number };

type EditorChrome = {
  openOnMount: boolean;
  collapseSignal: number;
  onInputFocus: (layout?: FocusLayout) => void;
  isSaving: boolean;
  initiallySaved: boolean;
};

/**
 * Local counter state so increment/decrement does not re-render GoalPlannerSheet.
 * Values are passed to onSave only when the user taps Save.
 */
export const SadaqahKafarahLocalEditor = memo(function SadaqahKafarahLocalEditor({
  openOnMount,
  collapseSignal,
  onInputFocus,
  isSaving,
  initiallySaved,
  onSave,
}: EditorChrome & {
  onSave: (
    meals: number,
    cloths: number,
    done?: () => void,
    fail?: () => void,
  ) => void;
}) {
  const [mealCount, setMealCount] = useState(0);
  const [clothCount, setClothCount] = useState(0);

  return (
    <KafarahForBreakingFastsOrOAthSelector
      openOnMount={openOnMount}
      collapseSignal={collapseSignal}
      onInputFocus={onInputFocus}
      mealCount={mealCount}
      setMealCount={setMealCount}
      clothCount={clothCount}
      setClothCount={setClothCount}
      handleMealDecrease={() => setMealCount((prev) => Math.max(0, prev - 1))}
      handleMealIncrease={() => setMealCount((prev) => prev + 1)}
      handleClothDecrease={() => setClothCount((prev) => Math.max(0, prev - 1))}
      handleClothIncrease={() => setClothCount((prev) => prev + 1)}
      isSaving={isSaving}
      initiallySaved={initiallySaved}
      onSave={(done, fail) => onSave(mealCount, clothCount, done, fail)}
    />
  );
});

export const SadaqahFidyaLocalEditor = memo(function SadaqahFidyaLocalEditor({
  openOnMount,
  collapseSignal,
  onInputFocus,
  isSaving,
  initiallySaved,
  title,
  onSave,
}: EditorChrome & {
  title: string;
  onSave: (meals: number, done?: () => void, fail?: () => void) => void;
}) {
  const [count, setCount] = useState(0);

  return (
    <FidyaSelector
      openOnMount={openOnMount}
      collapseSignal={collapseSignal}
      onInputFocus={onInputFocus}
      count={count}
      setCount={setCount}
      handleDecrease={() => setCount((prev) => Math.max(0, prev - 1))}
      handleIncrease={() => setCount((prev) => prev + 1)}
      title={title}
      isSaving={isSaving}
      initiallySaved={initiallySaved}
      onSave={(done, fail) => onSave(count, done, fail)}
    />
  );
});

export const SadaqahMissedZakatLocalEditor = memo(
  function SadaqahMissedZakatLocalEditor({
    openOnMount,
    collapseSignal,
    onInputFocus,
    isSaving,
    initiallySaved,
    control,
    name,
    title,
    countTitle,
    onSave,
    onSetAsDefaultCurrency,
  }: EditorChrome & {
    control: any;
    name: string;
    title: string;
    countTitle: string;
    onSave: (amount: number, done?: () => void, fail?: () => void) => void;
    onSetAsDefaultCurrency?: (code: string) => void;
  }) {
    const [count, setCount] = useState(0);

    return (
      <MissedZakats
        openOnMount={openOnMount}
        collapseSignal={collapseSignal}
        onInputFocus={onInputFocus}
        count={count}
        setCount={setCount}
        control={control}
        name={name}
        title={title}
        handleDecrease={() => setCount((prev) => Math.max(0, prev - 1))}
        handleIncrease={() => setCount((prev) => prev + 1)}
        countTitle={countTitle}
        isSaving={isSaving}
        initiallySaved={initiallySaved}
        onSave={(done, fail) => onSave(count, done, fail)}
        onSetAsDefaultCurrency={onSetAsDefaultCurrency}
      />
    );
  },
);
