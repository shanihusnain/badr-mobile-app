import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import type { JournalFillingQuestion } from "../journalFillingQuestions";
import { JournalQuestionRow } from "./JournalQuestionRow";
import type { JournalAnswerValue } from "../types";

type JournalSectionProps = {
  title: string;
  questions: JournalFillingQuestion[];
  answers: Record<string, JournalAnswerValue>;
  onAnswerChange: (questionId: string, answer: JournalAnswerValue) => void;
};

function JournalSectionComponent({
  title,
  questions,
  answers,
  onAnswerChange,
}: JournalSectionProps) {
  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Text style={styles.title}>{title}</Text>

        <View
          style={{
            height: 1,
            backgroundColor: Colors.light.divider,
            flex: 1,
          }}
        />
      </View>
      {questions.map((question) => (
        <JournalQuestionRow
          key={question.id}
          questionId={question.id}
          text={question.text}
          answer={answers[question.id] ?? null}
          onAnswerChange={onAnswerChange}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  title: {
    color: Colors.light.graylightshade,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    marginBottom: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.divider,
    marginBottom: 4,
  },
});

export const JournalSection = memo(JournalSectionComponent);
