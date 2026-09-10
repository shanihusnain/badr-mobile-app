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
};

function JournalQuestionRowComponent({
  questionId,
  text,
  answer,
  onAnswerChange,
}: JournalQuestionRowProps) {
  console.log("question id", questionId);
  const handleNoPress = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onAnswerChange(questionId, answer === false ? null : false);
  }, [answer, onAnswerChange, questionId]);

  const handleYesPress = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onAnswerChange(questionId, answer === true ? null : true);
  }, [answer, onAnswerChange, questionId]);

  return (
    <View style={styles.row}>
      <Text style={styles.question}>{text}</Text>
      <View style={styles.actions}>
        <AnswerButton
          variant="no"
          selected={answer === false}
          onPress={handleNoPress}
        />
        <AnswerButton
          variant="yes"
          selected={answer === true}
          onPress={handleYesPress}
        />
      </View>
    </View>
  );
}

type AnswerButtonProps = {
  variant: "yes" | "no";
  selected: boolean;
  onPress: () => void;
};

function AnswerButton({ variant, selected, onPress }: AnswerButtonProps) {
  const isYes = variant === "yes";

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        selected &&
          (isYes ? styles.buttonYesSelected : styles.buttonNoSelected),
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
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
});

export const JournalQuestionRow = memo(JournalQuestionRowComponent);
