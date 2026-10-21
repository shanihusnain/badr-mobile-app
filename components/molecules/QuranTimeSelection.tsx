import { globalStyles } from "@/src/globalstyles/globalstyles";
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { GoalSelectionOpenCloseButton } from "./GoalSelectionOpenCloseButton";
import { Divider } from "../atoms/Divider";
import { TopSpace } from "../atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGoalSelectionOpenState } from "@/hooks/useGoalSelectionOpenState";
import GoalSelectionSaveButton from "@/components/molecules/GoalSelectionSaveButton";
import { useGetQuranGoalByType } from "@/src/api/queries/useGetQuranGoalByType";
import { getHoursFromDetail } from "@/src/utils/quranGoalMap";
import { useTranslation } from "react-i18next";

const MAX_HOURS = 280;

export const QuranTimeSelection = ({
  title,
  descriptionKey,
  onSave,
  quranGoalType,
  isSaving = false,
  openOnMount = false,
  collapseSignal = 0,
  onInputFocus,
  initiallySaved = false,
}: {
  title: string;
  /** i18n key with `_one` / `_other` plural forms (pass count via input). */
  descriptionKey: string;
  onSave?: (hours: number, onDone?: () => void, onFail?: () => void) => void;
  quranGoalType?: "LISTENING" | "TAJWEED";
  isSaving?: boolean;
  openOnMount?: boolean;
  collapseSignal?: number;
  /** Scroll parent list so this input stays visible above the keyboard. */
  onInputFocus?: (layout?: { windowY: number; inputHeight: number }) => void;
  initiallySaved?: boolean;
}) => {
  const { t } = useTranslation();
  const hoursInputRef = useRef<TextInput>(null);
  /**
   * Select-all when focus starts on a non-zero value (intentional tap).
   * Suppress only for a short Android blur→focus bounce right after typing
   * (sheet keep-visible scroll), so the digit just typed is not re-selected.
   */
  const allowSelectAllRef = useRef(false);
  const typedThisFocusRef = useRef(false);
  const lastBlurAtRef = useRef(0);
  const blurClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectAllTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  /** Ignore native caret updates while we apply programmatic select-all / end caret. */
  const ignoreSelectionChangeRef = useRef(false);
  /** First key after select-all: append (native would replace); backspace clears. */
  const appendOnNextInputRef = useRef(false);
  const prevValueOnFocusRef = useRef("");
  /** Bumped on blur to cancel delayed placeCaretAtEnd (avoids clipped digits e.g. 280). */
  const caretTokenRef = useRef(0);
  // Panel open must not trigger keyboard keep-visible — only hours TextInput focus.
  const [isOpen, setIsOpen] = useGoalSelectionOpenState(
    openOnMount,
    undefined,
    collapseSignal,
  );

  const reportHoursInputLayout = useCallback(() => {
    const node = hoursInputRef.current;
    if (!node?.measureInWindow) {
      onInputFocus?.();
      return;
    }
    node.measureInWindow((_x, y, _w, h) => {
      onInputFocus?.({ windowY: y, inputHeight: Math.max(h, 1) });
    });
  }, [onInputFocus]);

  const notifyHoursFocused = useCallback(() => {
    onInputFocus?.();
    requestAnimationFrame(reportHoursInputLayout);
    // No late remeasure — parent keep-visible scrolls once with keyboard height.
  }, [onInputFocus, reportHoursInputLayout]);

  const clearSelectAllTimers = useCallback(() => {
    selectAllTimersRef.current.forEach(clearTimeout);
    selectAllTimersRef.current = [];
  }, []);

  const applySelectAll = useCallback((len: number) => {
    if (!allowSelectAllRef.current || len <= 0) return;
    ignoreSelectionChangeRef.current = true;
    setSelection({ start: 0, end: len });
    // Android often emits a caret onSelectionChange right after focus/scroll;
    // hold ignore long enough that it cannot collapse select-all.
    if (Platform.OS === "android") {
      selectAllTimersRef.current.push(
        setTimeout(() => {
          ignoreSelectionChangeRef.current = false;
        }, 80),
      );
    } else {
      requestAnimationFrame(() => {
        ignoreSelectionChangeRef.current = false;
      });
    }
  }, []);

  const scheduleSelectAll = useCallback(
    (len: number) => {
      allowSelectAllRef.current = true;
      clearSelectAllTimers();
      // Defer until after controlled value commits (iOS / Counter).
      requestAnimationFrame(() => {
        requestAnimationFrame(() => applySelectAll(len));
      });
      // Android keep-visible scroll blurs/refocuses and wipes early selection —
      // re-apply after the bounce settles.
      if (Platform.OS === "android") {
        selectAllTimersRef.current.push(
          setTimeout(() => applySelectAll(len), 50),
          setTimeout(() => applySelectAll(len), 160),
        );
      }
    },
    [applySelectAll, clearSelectAllTimers],
  );

  /** After append, pin caret at end — native often leaves it at prev.length. */
  const placeCaretAtEnd = useCallback((len: number) => {
    const token = ++caretTokenRef.current;
    ignoreSelectionChangeRef.current = true;
    setSelection({ start: len, end: len });
    requestAnimationFrame(() => {
      if (token !== caretTokenRef.current) return;
      setSelection({ start: len, end: len });
      hoursInputRef.current?.setNativeProps?.({
        selection: { start: len, end: len },
      });
      requestAnimationFrame(() => {
        if (token !== caretTokenRef.current) return;
        ignoreSelectionChangeRef.current = false;
      });
    });
  }, []);

  const [inputValue, setInputValue] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);
  const [isHoursFocused, setIsHoursFocused] = useState(false);
  /** Controlled selection — setNativeProps is unreliable with value= (same as Counter). */
  const [selection, setSelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);
  /** Locked once — do not re-derive from hoursCount or typing keeps flipping SAVED!. */
  const [openedAsSaved, setOpenedAsSaved] = useState(initiallySaved);
  const lockedSavedRef = useRef(initiallySaved);

  const { data: goalDetail, isLoading } = useGetQuranGoalByType(quranGoalType, {
    enabled: isOpen && !!quranGoalType,
  });

  useEffect(() => {
    if (!initiallySaved || lockedSavedRef.current) return;
    lockedSavedRef.current = true;
    setOpenedAsSaved(true);
  }, [initiallySaved]);

  useEffect(() => {
    if (!isOpen || hydrated || !goalDetail) return;
    // Toggle-off leaves detail cached with old hours — never hydrate inactive goals.
    if (goalDetail.isActive === false) {
      setInputValue("");
      setHydrated(true);
      return;
    }
    const hours = getHoursFromDetail(goalDetail);
    if (hours > 0) {
      setInputValue(String(Math.min(MAX_HOURS, Math.round(hours))));
      if (!lockedSavedRef.current) {
        lockedSavedRef.current = true;
        setOpenedAsSaved(true);
      }
    }
    setHydrated(true);
  }, [isOpen, goalDetail, hydrated]);

  useEffect(() => {
    if (!isOpen) {
      setHydrated(false);
      // Discard unsaved typing — reopen hydrates from the last saved API value.
      setInputValue("");
      setSelection(undefined);
      lockedSavedRef.current = initiallySaved;
      setOpenedAsSaved(initiallySaved);
      allowSelectAllRef.current = false;
      typedThisFocusRef.current = false;
      clearSelectAllTimers();
      if (blurClearTimerRef.current) {
        clearTimeout(blurClearTimerRef.current);
        blurClearTimerRef.current = null;
      }
    }
  }, [isOpen, initiallySaved, clearSelectAllTimers]);

  const handleHoursChange = (text: string) => {
    // User is typing — never re-select on a later accidental re-focus.
    typedThisFocusRef.current = true;
    allowSelectAllRef.current = false;
    clearSelectAllTimers();

    let digitsOnly = text.replace(/[^0-9]/g, "");
    let dropHighlight = false;

    if (appendOnNextInputRef.current) {
      appendOnNextInputRef.current = false;
      dropHighlight = true;
      const prev = prevValueOnFocusRef.current.replace(/[^0-9]/g, "");

      if (digitsOnly === "") {
        setInputValue("");
        setSelection({ start: 0, end: 0 });
        return;
      }

      if (
        prev.length > 0 &&
        !digitsOnly.startsWith(prev) &&
        digitsOnly !== prev
      ) {
        digitsOnly = prev + digitsOnly;
      }
      prevValueOnFocusRef.current = digitsOnly;
    }

    if (digitsOnly === "") {
      setInputValue("");
      return;
    }
    const parsed = parseInt(digitsOnly, 10);
    if (Number.isNaN(parsed)) {
      setInputValue("");
      return;
    }
    const next = String(Math.min(MAX_HOURS, parsed));
    setInputValue(next);
    if (dropHighlight) {
      placeCaretAtEnd(next.length);
    }
  };

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const hoursCount = parseInt(inputValue || "0", 10) || 0;
  const descriptionText = t(descriptionKey, { count: hoursCount });

  return (
    <View style={[styles.container, { paddingBottom: isOpen ? 6 : 10 }]}>
      <GoalSelectionOpenCloseButton
        isOpen={isOpen}
        title={title}
        toggleDropdown={toggleDropdown}
      />
      {isOpen && (
        <View style={styles.openContent}>
          <Divider />
          <TopSpace top={16} />
          {isLoading ? (
            <View style={{ paddingVertical: 16, alignItems: "center" }}>
              <ActivityIndicator color={Colors.light.green} />
            </View>
          ) : (
            <>
              <Text style={styles.header}>Enter up to {MAX_HOURS} hours.</Text>
              <TopSpace top={12} />
              <View style={styles.outerRow}>
                <Pressable
                  onPress={() => hoursInputRef.current?.focus()}
                  hitSlop={8}
                  style={styles.hoursInputPressable}
                >
                  <TextInput
                    ref={hoursInputRef}
                    value={
                      isHoursFocused && hoursCount === 0 ? "" : inputValue
                    }
                    onChangeText={handleHoursChange}
                    keyboardType="numeric"
                    placeholder={isHoursFocused ? "" : "0"}
                    placeholderTextColor={Colors.light.white}
                    maxLength={3}
                    textAlignVertical="center"
                    // Avoid Android re-selecting when hoursCount flips 0→1 mid-focus.
                    selectTextOnFocus={false}
                    showSoftInputOnFocus
                    // Only while focused — end caret scrolls the box and hides a digit on blur.
                    selection={isHoursFocused ? selection : undefined}
                    onSelectionChange={(e) => {
                      if (!isHoursFocused || ignoreSelectionChangeRef.current)
                        return;
                      setSelection(e.nativeEvent.selection);
                    }}
                    onFocus={() => {
                      if (blurClearTimerRef.current) {
                        clearTimeout(blurClearTimerRef.current);
                        blurClearTimerRef.current = null;
                      }
                      setIsHoursFocused(true);
                      notifyHoursFocused();
                      const msSinceBlur = Date.now() - lastBlurAtRef.current;
                      // Brief Android bounce after typing + sheet scroll — keep caret.
                      const isScrollBounce =
                        typedThisFocusRef.current && msSinceBlur < 200;
                      if (isScrollBounce) {
                        allowSelectAllRef.current = false;
                        clearSelectAllTimers();
                        return;
                      }
                      // Intentional tap (or fresh focus) — allow select-all again.
                      typedThisFocusRef.current = false;
                      const existing =
                        parseInt(inputValue || "0", 10) || 0;
                      if (existing === 0) {
                        allowSelectAllRef.current = false;
                        appendOnNextInputRef.current = false;
                        prevValueOnFocusRef.current = "";
                        clearSelectAllTimers();
                        setInputValue("");
                        setSelection({ start: 0, end: 0 });
                        return;
                      }
                      const existingText = String(existing);
                      prevValueOnFocusRef.current = existingText;
                      appendOnNextInputRef.current = true;
                      scheduleSelectAll(existingText.length);
                    }}
                    onBlur={() => {
                      setIsHoursFocused(false);
                      caretTokenRef.current += 1;
                      ignoreSelectionChangeRef.current = false;
                      setSelection(undefined);
                      lastBlurAtRef.current = Date.now();
                      // Keep intentional select-all timers alive across Android
                      // keep-visible blur→focus; only cancel after the user typed.
                      if (typedThisFocusRef.current) {
                        allowSelectAllRef.current = false;
                        appendOnNextInputRef.current = false;
                        clearSelectAllTimers();
                      }
                      blurClearTimerRef.current = setTimeout(() => {
                        typedThisFocusRef.current = false;
                        // Real blur (onFocus cancels this timer on bounce re-focus).
                        appendOnNextInputRef.current = false;
                        blurClearTimerRef.current = null;
                      }, 350);
                    }}
                    style={[
                      styles.hoursInput,
                      (inputValue.trim().length > 0 || isHoursFocused) &&
                        styles.hoursInputFilled,
                    ]}
                  />
                </Pressable>

                <Text style={styles.descriptionText}>{descriptionText}</Text>
              </View>
              <TopSpace top={56} />

              <GoalSelectionSaveButton
                text="Save"
                disabled={hoursCount <= 0}
                isLoading={isSaving}
                initiallySaved={openedAsSaved}
                valueKey={hydrated ? inputValue : undefined}
                onPress={(markSaved, markFailed) => {
                  const hours = Math.min(
                    MAX_HOURS,
                    parseInt(inputValue || "0", 10) || 0,
                  );
                  if (hours <= 0) {
                    markFailed();
                    return;
                  }

                  onSave?.(
                    hours,
                    () => {
                      lockedSavedRef.current = true;
                      setOpenedAsSaved(true);
                      markSaved();
                    },
                    markFailed,
                  );
                }}
                style={{ width: "100%" }}
              />
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  descriptionText: {
    color: Colors.light.white,
    fontSize: 14,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  hoursInputPressable: {
    borderRadius: 4,
  },
  hoursInput: {
    // Room for 3 digits (e.g. 280) without horizontal clip when unfocused.
    width: 52,
    minHeight: 32,
    paddingTop: 4,
    paddingRight: 4,
    paddingBottom: 4,
    paddingLeft: 4,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    backgroundColor: "transparent",
    borderRadius: 4,
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    includeFontPadding: false,
  },
  hoursInputFilled: {
    borderColor: Colors.light.green,
    backgroundColor: Colors.light.green,
  },
  innerRow: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
  },
  outerRow: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    flexDirection: "row",
  },
  header: {
    fontSize: 12,
    color: Colors.light.white,
    opacity: 0.8,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
    textAlign: "left",
    letterSpacing: 0.1,
  },
  container: {
    ...globalStyles.goalSelectionWrapper,
    alignItems: "flex-start",
  },
  openContent: {
    width: "100%",
    paddingBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    width: 60,
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
    borderRadius: 8,
    color: Colors.light.white,
    fontSize: 12,
    fontWeight: "400",
    fontFamily: fonts.primary.regular,
  },
});
