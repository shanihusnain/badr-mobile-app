import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Local goal-editor value that reverts to the last committed save when the
 * panel collapses without saving (Save button unmounts on close and would
 * otherwise remount treating the dirty value as the saved baseline).
 *
 * `onRevert` syncs lifted parent state (e.g. sadaqah counters) back to saved.
 * Parent/API seeds are only adopted while collapsed so live edits are not
 * treated as the new baseline.
 */
export function useDiscardUnsavedOnCollapse<T>(
  isOpen: boolean,
  initialValue: T,
  onRevert?: (saved: T) => void,
): [T, (next: T) => void, (committed: T) => void] {
  const [value, setValue] = useState(initialValue);
  const savedRef = useRef(initialValue);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const onRevertRef = useRef(onRevert);
  onRevertRef.current = onRevert;

  // Adopt parent/API seed only while the panel is closed.
  useEffect(() => {
    if (isOpenRef.current) return;
    savedRef.current = initialValue;
    setValue(initialValue);
  }, [initialValue]);

  // Collapse without save → restore last committed value.
  useEffect(() => {
    if (isOpen) return;
    const saved = savedRef.current;
    setValue(saved);
    onRevertRef.current?.(saved);
  }, [isOpen]);

  const commitSaved = useCallback((committed: T) => {
    savedRef.current = committed;
    setValue(committed);
  }, []);

  return [value, setValue, commitSaved];
}
