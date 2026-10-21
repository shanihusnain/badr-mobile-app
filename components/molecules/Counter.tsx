import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  type TextInput as TextInputType,
} from "react-native";
import { Pressable, View } from "react-native";
import { TopSpace } from "../atoms/TopSpace";

export const Counter = ({
  countTitle,
  handleDecrease,
  handleIncrease,
  count,
  setCount,
  width,
  onInputFocus,
}: {
  countTitle: string;
  handleDecrease: () => void;
  handleIncrease: () => void;
  count: number;
  setCount: (value: number) => void;
  width?: string | number | any;
  onInputFocus?: (layout?: { windowY: number; inputHeight: number }) => void;
}) => {
  const inputRef = useRef<TextInputType>(null);
  const wrapperRef = useRef<View>(null);
  const [isFocused, setIsFocused] = useState(false);
  // Local draft while editing — empty string when focused on 0 so caret sits centered.
  const [draft, setDraft] = useState<string>(count.toString());
  /** Controlled selection — setNativeProps is unreliable on iOS with value=. */
  const [selection, setSelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);

  /** First key after select-all: append (native would replace); backspace clears. */
  const appendOnNextInputRef = useRef(false);
  const prevValueOnFocusRef = useRef("");
  const ignoreSelectionChangeRef = useRef(false);
  const allowSelectAllRef = useRef(false);
  const selectAllTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  /** Bumped on blur to cancel delayed placeCaretAtEnd (avoids clipped digits). */
  const caretTokenRef = useRef(0);

  useEffect(() => {
    if (!isFocused) {
      setDraft(count.toString());
    }
  }, [count, isFocused]);

  useEffect(() => {
    return () => {
      selectAllTimersRef.current.forEach(clearTimeout);
      selectAllTimersRef.current = [];
    };
  }, []);

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
      requestAnimationFrame(() => {
        requestAnimationFrame(() => applySelectAll(len));
      });
      // Android keep-visible scroll can wipe early selection — re-apply.
      if (Platform.OS === "android") {
        selectAllTimersRef.current.push(
          setTimeout(() => applySelectAll(len), 50),
          setTimeout(() => applySelectAll(len), 160),
        );
      }
    },
    [applySelectAll, clearSelectAllTimers],
  );

  /** After append, pin caret at end — native onSelectionChange often leaves it at prev.length. */
  const placeCaretAtEnd = useCallback((len: number) => {
    const token = ++caretTokenRef.current;
    ignoreSelectionChangeRef.current = true;
    setSelection({ start: len, end: len });
    requestAnimationFrame(() => {
      if (token !== caretTokenRef.current) return;
      setSelection({ start: len, end: len });
      inputRef.current?.setNativeProps?.({
        selection: { start: len, end: len },
      });
      requestAnimationFrame(() => {
        if (token !== caretTokenRef.current) return;
        ignoreSelectionChangeRef.current = false;
      });
    });
  }, []);

  const reportInputLayout = useCallback(() => {
    const node = wrapperRef.current;
    if (!node?.measureInWindow) {
      onInputFocus?.();
      return;
    }
    node.measureInWindow((_x, y, _w, h) => {
      onInputFocus?.({ windowY: y, inputHeight: Math.max(h, 1) });
    });
  }, [onInputFocus]);

  const handleFocus = () => {
    setIsFocused(true);
    // Mark focused immediately, then measure once for parent keep-visible.
    onInputFocus?.();
    requestAnimationFrame(reportInputLayout);
    if (count === 0) {
      appendOnNextInputRef.current = false;
      prevValueOnFocusRef.current = "";
      allowSelectAllRef.current = false;
      clearSelectAllTimers();
      setDraft("");
      setSelection({ start: 0, end: 0 });
      return;
    }
    const text = String(count);
    setDraft(text);
    prevValueOnFocusRef.current = text;
    appendOnNextInputRef.current = true;
    scheduleSelectAll(text.length);
  };

  const handleBlur = () => {
    setIsFocused(false);
    appendOnNextInputRef.current = false;
    allowSelectAllRef.current = false;
    clearSelectAllTimers();
    // Cancel pending end-caret; controlled selection while blurred scrolls/clips digits.
    caretTokenRef.current += 1;
    ignoreSelectionChangeRef.current = false;
    setSelection(undefined);
    const digitsOnly = draft.replace(/[^0-9]/g, "");
    const next = digitsOnly === "" ? 0 : parseInt(digitsOnly, 10) || 0;
    setCount(next);
    setDraft(String(next));
  };

  const handleChangeText = (text: string) => {
    allowSelectAllRef.current = false;
    clearSelectAllTimers();

    let digitsOnly = text.replace(/[^0-9]/g, "");
    let dropHighlight = false;

    if (appendOnNextInputRef.current) {
      appendOnNextInputRef.current = false;
      dropHighlight = true;
      const prev = prevValueOnFocusRef.current.replace(/[^0-9]/g, "");

      if (digitsOnly === "") {
        // Backspace cleared the selection.
        setDraft("");
        setCount(0);
        setSelection({ start: 0, end: 0 });
        return;
      }

      // Native select-all replaces with the typed digit(s) — force append instead.
      if (
        prev.length > 0 &&
        !digitsOnly.startsWith(prev) &&
        digitsOnly !== prev
      ) {
        digitsOnly = prev + digitsOnly;
      }
      // Baseline for any further guard; caret must sit after the new length.
      prevValueOnFocusRef.current = digitsOnly;
    }

    setDraft(digitsOnly);
    setCount(digitsOnly === "" ? 0 : parseInt(digitsOnly, 10) || 0);
    if (dropHighlight) {
      placeCaretAtEnd(digitsOnly.length);
    }
  };

  return (
    <View style={{ alignItems: "center", width: width ?? "60%" }}>
      <View ref={wrapperRef} style={styles.wrapper} collapsable={false}>
        <Pressable
          onPress={handleDecrease}
          disabled={count <= 0}
          hitSlop={8}
          style={[styles.btnHit, count <= 0 && styles.btnDisabled]}
        >
          <Text style={styles.btnText}>-</Text>
        </Pressable>
        <TextInput
          ref={inputRef}
          value={draft}
          onChangeText={handleChangeText}
          keyboardType="numeric"
          style={styles.input}
          underlineColorAndroid="transparent"
          // No placeholder: Android draws the caret after placeholder text,
          // which looks like the cursor is stuck at the end of "0".
          placeholder=""
          // Only while focused — end selection scrolls narrow fields and hides a digit on blur.
          selection={isFocused ? selection : undefined}
          onSelectionChange={(e) => {
            if (!isFocused || ignoreSelectionChangeRef.current) return;
            setSelection(e.nativeEvent.selection);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <Pressable onPress={handleIncrease} hitSlop={8} style={styles.btnHit}>
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
      <TopSpace top={8} />
      <Text style={styles.title}>{countTitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
  input: {
    // Wider so 3+ digit counts stay fully visible when unfocused.
    width: 56,
    height: "100%",
    textAlign: "center",
    ...Platform.select({
      android: { textAlignVertical: "center" as const },
      default: {},
    }),
    fontSize: 16,
    lineHeight: 18,
    fontWeight: "500",
    color: Colors.light.green,
    fontFamily: fonts.primary.medium,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    margin: 0,
    includeFontPadding: false,
  },
  btnHit: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 20,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: "600",
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    textAlign: "center",
    includeFontPadding: false,
  },
  wrapper: {
    borderColor: Colors.light.white,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: 120,
    height: 32,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 0,
    overflow: "hidden",
  },
});
