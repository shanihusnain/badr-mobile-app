import React, { memo, useCallback } from "react";
import {
  LayoutAnimation,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import type { JournalAnswerValue } from "../types";

type JournalQuestionRowProps = {
  questionId: string;
  text: string;
  answer: JournalAnswerValue;
  onAnswerChange: (questionId: string, answer: JournalAnswerValue) => void;
  showBottomBorder?: boolean;
  disabled?: boolean;
};

function JournalQuestionRowComponent({
  questionId,
  text,
  answer,
  onAnswerChange,
  showBottomBorder = true,
  disabled = false,
}: JournalQuestionRowProps) {
  const handleNoPress = useCallback(() => {
    if (disabled) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onAnswerChange(questionId, answer === false ? null : false);
  }, [answer, disabled, onAnswerChange, questionId]);

  const handleYesPress = useCallback(() => {
    if (disabled) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onAnswerChange(questionId, answer === true ? null : true);
  }, [answer, disabled, onAnswerChange, questionId]);

  return (
    <View style={[styles.row, !showBottomBorder && styles.rowNoBorder]}>
      <Text style={styles.question}>{text}</Text>
      <View style={styles.actions}>
        <AnswerButton
          variant="no"
          selected={answer === false}
          onPress={handleNoPress}
          disabled={disabled}
        />
        <AnswerButton
          variant="yes"
          selected={answer === true}
          onPress={handleYesPress}
          disabled={disabled}
        />
      </View>
    </View>
  );
}

type AnswerButtonProps = {
  variant: "yes" | "no";
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
};

function AnswerButton({
  variant,
  selected,
  onPress,
  disabled = false,
}: AnswerButtonProps) {
  const isYes = variant === "yes";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        selected &&
          (isYes ? styles.buttonYesSelected : styles.buttonNoSelected),
        disabled && styles.buttonDisabled,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={isYes ? "Yes" : "No"}
      hitSlop={4}
    >
      <Feather
        name={isYes ? "check" : "x"}
        size={18}
        color={
          selected
            ? Colors.light.white
            : isYes
              ? Colors.light.blackBackground
              : Colors.light.blackBackground
        }
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.divider,
  },
  rowNoBorder: {
    borderBottomWidth: 0,
  },
  question: {
    flex: 1,
    minWidth: 0,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.white,
  },
  buttonYesSelected: {
    backgroundColor: Colors.light.green,
  },
  buttonNoSelected: {
    backgroundColor: Colors.light.green,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
});

export const JournalQuestionRow = memo(JournalQuestionRowComponent);
