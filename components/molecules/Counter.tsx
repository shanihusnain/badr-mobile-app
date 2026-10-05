import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, type TextInput } from "react-native";
import { Pressable, View } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
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
  onInputFocus?: () => void;
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  // Local draft while editing — empty string when focused on 0 so caret sits centered.
  const [draft, setDraft] = useState<string>(count.toString());

  useEffect(() => {
    if (!isFocused) {
      setDraft(count.toString());
    }
  }, [count, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    onInputFocus?.();
    if (count === 0) {
      setDraft("");
      // Remount-safe caret reset: empty + no placeholder keeps caret in the center.
      requestAnimationFrame(() => {
        inputRef.current?.setNativeProps?.({
          selection: { start: 0, end: 0 },
        });
      });
      return;
    }
    setDraft(count.toString());
    // Select all so typing replaces the current number.
    requestAnimationFrame(() => {
      const len = String(count).length;
      inputRef.current?.setNativeProps?.({
        selection: { start: 0, end: len },
      });
    });
  };

  const handleBlur = () => {
    setIsFocused(false);
    const digitsOnly = draft.replace(/[^0-9]/g, "");
    const next = digitsOnly === "" ? 0 : parseInt(digitsOnly, 10) || 0;
    setCount(next);
    setDraft(String(next));
  };

  const handleChangeText = (text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, "");
    setDraft(digitsOnly);
    setCount(digitsOnly === "" ? 0 : parseInt(digitsOnly, 10) || 0);
  };

  return (
    <View style={{ alignItems: "center", width: width ?? "60%" }}>
      <View style={styles.wrapper}>
        <Pressable
          onPress={handleDecrease}
          disabled={count <= 0}
          hitSlop={8}
          style={[styles.btnHit, count <= 0 && styles.btnDisabled]}
        >
          <Text style={styles.btnText}>-</Text>
        </Pressable>
        <BottomSheetTextInput
          ref={inputRef as any}
          value={draft}
          onChangeText={handleChangeText}
          keyboardType="numeric"
          style={styles.input}
          underlineColorAndroid="transparent"
          // No placeholder: Android draws the caret after placeholder text,
          // which looks like the cursor is stuck at the end of "0".
          placeholder=""
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
    width: 48,
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
