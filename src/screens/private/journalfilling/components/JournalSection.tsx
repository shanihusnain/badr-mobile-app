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
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.titleLine} />
      </View>
      {questions.map((question, index) => {
        const isLastQuestion = index === questions.length - 1;
        // No full divider above the next heading, and none above Notes.
        const showBottomBorder = !isLastQuestion;

        return (
          <JournalQuestionRow
            key={question.id}
            questionId={question.id}
            text={question.text}
            answer={answers[question.id] ?? null}
            onAnswerChange={onAnswerChange}
            showBottomBorder={showBottomBorder}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  title: {
    color: Colors.light.graylightshade,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
  },
  titleLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.divider,
  },
});

export const JournalSection = memo(JournalSectionComponent);
