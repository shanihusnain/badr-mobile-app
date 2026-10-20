import React, { memo, useEffect, useRef, useState } from "react";
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
 * Seed local counter once from parent/API hydrate. Remount (e.g. leave/return
 * tab) resets the seed gate so values reload from the latest initial props.
 */
function useSeededCount(initialCount: number | undefined) {
  const [count, setCount] = useState(() =>
    typeof initialCount === "number" && initialCount > 0 ? initialCount : 0,
  );
  const seededFromRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof initialCount !== "number" || !(initialCount > 0)) return;
    if (seededFromRef.current === initialCount) return;
    // Prefer API/parent seed when local is still empty, or when parent value changed.
    setCount((prev) => {
      if (prev <= 0 || seededFromRef.current == null) {
        seededFromRef.current = initialCount;
        return initialCount;
      }
      if (seededFromRef.current !== initialCount && prev === seededFromRef.current) {
        // Parent re-hydrated a new saved value and user hadn't diverged.
        seededFromRef.current = initialCount;
        return initialCount;
      }
      return prev;
    });
  }, [initialCount]);

  return [count, setCount] as const;
}

/**
 * Local counter state so increment/decrement does not re-render GoalPlannerSheet.
 * Values are passed to onSave only when the user taps Save.
 * `initial*` props hydrate from API when the editor mounts or remounts.
 */
export const SadaqahKafarahLocalEditor = memo(function SadaqahKafarahLocalEditor({
  openOnMount,
  collapseSignal,
  onInputFocus,
  isSaving,
  initiallySaved,
  initialMealCount = 0,
  initialClothCount = 0,
  onSave,
}: EditorChrome & {
  initialMealCount?: number;
  initialClothCount?: number;
  onSave: (
    meals: number,
    cloths: number,
    done?: () => void,
    fail?: () => void,
  ) => void;
}) {
  const [mealCount, setMealCount] = useSeededCount(initialMealCount);
  const [clothCount, setClothCount] = useSeededCount(initialClothCount);

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
  initialCount = 0,
  onSave,
}: EditorChrome & {
  title: string;
  initialCount?: number;
  onSave: (meals: number, done?: () => void, fail?: () => void) => void;
}) {
  const [count, setCount] = useSeededCount(initialCount);

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
      onSave={(value, done, fail) => onSave(value, done, fail)}
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
    initialCount = 0,
    onSave,
    onSetAsDefaultCurrency,
  }: EditorChrome & {
    control: any;
    name: string;
    title: string;
    countTitle: string;
    initialCount?: number;
    onSave: (amount: number, done?: () => void, fail?: () => void) => void;
    onSetAsDefaultCurrency?: (code: string) => void;
  }) {
    const [count, setCount] = useSeededCount(initialCount);

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
        onSave={(amount, done, fail) => onSave(amount, done, fail)}
        onSetAsDefaultCurrency={onSetAsDefaultCurrency}
      />
    );
  },
);
