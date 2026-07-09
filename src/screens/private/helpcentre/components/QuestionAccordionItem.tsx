import React, { type ReactNode } from "react";
import { Pressable, View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { helpCentreStyles as styles } from "../style";

type QuestionAccordionItemProps = {
    question: string;
    answer: ReactNode;
    isExpanded: boolean;
    onPress: () => void;
};

export default function QuestionAccordionItem({
    question,
    answer,
    isExpanded,
    onPress,
}: QuestionAccordionItemProps) {
    return (
        <Pressable style={styles.questionItem} onPress={onPress}>
            <View style={styles.questionRow}>
                <Text style={styles.questionText}>{question}</Text>
                <Feather
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={Colors.light.white}
                />
            </View>
            {isExpanded ? <View style={styles.answerContainer}>{answer}</View> : null}
        </Pressable>
    );
}
