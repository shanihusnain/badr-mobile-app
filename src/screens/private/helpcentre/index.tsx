import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { helpCentreStyles as styles } from "./style";
import PrimaryButton from "@/components/atoms/Primary-button";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";
import QuestionAccordionItem from "./components/QuestionAccordionItem";
import {
  splitAnswerWithBold,
  useGetHelpCentre,
} from "@/src/api/queries/useGetHelpCentre";

export default function HelpCentreScreen() {
  const { data, isLoading } = useGetHelpCentre();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const questions = useMemo(() => {
    const list = data?.questions ?? [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;
    return list.filter((item) => {
      const haystack = `${item.question} ${item.answer}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [data?.questions, searchQuery]);

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleChatWithBadr = () => {
    // Chat entry point reserved for a later wire-up.
  };

  if (isLoading && !data) {
    return (
      <BlackScreenWrapper>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <LoadingComponent size="large" />
        </View>
      </BlackScreenWrapper>
    );
  }

  return (
    <BlackScreenWrapper>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>
          {data?.searchTitle ?? "How can we help?"}
        </Text>

        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={Colors.light.white} />
          <TextInput
            style={styles.searchInput}
            placeholder={data?.searchPlaceholder ?? "Search Help"}
            placeholderTextColor={Colors.light.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.sectionTitleUppercase}>
          {data?.commonQuestionsTitle ?? "COMMON QUESTIONS"}
        </Text>

        {questions.map((item, index) => {
          const parts = splitAnswerWithBold(item.answer, item.bold);
          return (
            <QuestionAccordionItem
              key={item.question}
              question={item.question}
              answer={
                <Text style={styles.answerText}>
                  {parts.map((part, partIndex) =>
                    part.bold ? (
                      <Text key={`${item.question}-${partIndex}`} style={styles.answerBold}>
                        {part.text}
                      </Text>
                    ) : (
                      <Text key={`${item.question}-${partIndex}`}>{part.text}</Text>
                    ),
                  )}
                </Text>
              }
              isExpanded={expandedIndex === index}
              onPress={() => handleToggle(index)}
            />
          );
        })}

        <Text style={styles.sectionTitle}>
          {data?.browseTitle ?? "Haven't found what you're looking for?"}
        </Text>

        <Pressable style={styles.browseTopicsButton}>
          <Text style={styles.browseTopicsText}>
            {data?.browseLabel ?? "Browse all topics"}
          </Text>
          <Feather name="chevron-right" size={20} color={Colors.light.white} />
        </Pressable>

        <Text style={styles.sectionTitle}>
          {data?.stillNeedHelpTitle ?? "Still need help?"}
        </Text>

        <View style={styles.chatButtonContainer}>
          <PrimaryButton
            text={data?.chatButton ?? "CHAT WITH BADR"}
            onPress={handleChatWithBadr}
          />
        </View>
      </ScrollView>
    </BlackScreenWrapper>
  );
}
