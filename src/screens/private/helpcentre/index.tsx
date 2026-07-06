import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { helpCentreStyles as styles } from "./style";
import PrimaryButton from "@/components/atoms/Primary-button";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";

type BoldTextProps = { children: string };

const BoldText = ({ children }: BoldTextProps) => (
    <Text style={styles.answerBold}>{children}</Text>
);

const COMMON_QUESTIONS = [
    {
        question: "How do I check my membership details?",
        answer: (
            <Text style={styles.answerText}>
                Tap <BoldText>More</BoldText> in the navigation menu, then select{" "}
                <BoldText>Badr Membership</BoldText>. On that screen, you'll find your membership type, status, renewal date, and options to manage or extend your plan.
            </Text>
        ),
    },
    {
        question: "How do I manage my billing and payments?",
        answer: (
            <Text style={styles.answerText}>
                <BoldText>Badr</BoldText> memberships are billed upfront, and pricing depends on the membership you choose (monthly, 6-month, or annual). When you sign up, you're charged immediately for the full period. This charge repeats unless you cancel ahead of time.
            </Text>
        ),
    },
    {
        question: "How do I cancel or request a refund?",
        answer: (
            <Text style={styles.answerText}>
                <BoldText>Badr</BoldText> does not offer refunds for prepaid plans. You can cancel anytime before your billing date by tapping <BoldText>More</BoldText> in the navigation menu, then selecting <BoldText>Badr Membership</BoldText>. On that screen, you'll find your membership type, renewal date, and options to manage or cancel your plan.
            </Text>
        ),
    },
    {
        question: "Why is my Badr data missing or delayed?",
        answer: (
            <Text style={styles.answerText}>
                This may occur if your internet connection has caused delayed syncing of data to the <BoldText>Badr</BoldText> app. Keep the <BoldText>Badr</BoldText> app open in the background on your phone to allow the data to sync.
            </Text>
        ),
    },
    {
        question: "Can I export all my data on the app?",
        answer: (
            <Text style={styles.answerText}>
                Yes, you're in full control of your data. To export your data, tap <BoldText>More</BoldText> in the navigation menu, then select <BoldText>App Settings</BoldText>, followed by <BoldText>Data Export</BoldText>, and tap the <BoldText>Create Export</BoldText> button. You'll receive an email when your export is ready, which can take up to 24 hours.
            </Text>
        ),
    },
    {
        question: "Can I use the app while my phone is offline?",
        answer: (
            <Text style={styles.answerText}>
                The <BoldText>Badr</BoldText> app requires an internet connection (Wi-Fi or cellular) to log new data or access content, such as videos, podcasts, and articles. However, any content or data synced before going offline will still be available for you to view.
            </Text>
        ),
    },
];

export default function HelpCentreScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

    const handleToggle = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const handleChatWithBadr = () => {
        // Handle chat action
    };

    return (
        <BlackScreenWrapper>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                <Text style={styles.sectionTitle}>How can we help?</Text>

                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color={Colors.light.white} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Help"
                        placeholderTextColor={Colors.light.subtext}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <Text style={styles.sectionTitleUppercase}>COMMON QUESTIONS</Text>

                {COMMON_QUESTIONS.map((item, index) => {
                    const isExpanded = expandedIndex === index;
                    return (
                        <Pressable
                            key={index}
                            style={styles.questionItem}
                            onPress={() => handleToggle(index)}
                        >
                            <View style={styles.questionRow}>
                                <Text style={styles.questionText}>{item.question}</Text>
                                <Feather
                                    name={isExpanded ? "chevron-up" : "chevron-down"}
                                    size={18}
                                    color={Colors.light.white}
                                />
                            </View>
                            {isExpanded && (
                                <View style={styles.answerContainer}>
                                    {item.answer}
                                </View>
                            )}
                        </Pressable>
                    );
                })}

                <Text style={styles.sectionTitle}>Haven't found what you're looking for?</Text>

                <Pressable style={styles.browseTopicsButton}>
                    <Text style={styles.browseTopicsText}>Browse all topics</Text>
                    <Feather name="chevron-right" size={20} color={Colors.light.white} />
                </Pressable>

                <Text style={styles.sectionTitle}>Still need help?</Text>

                <View style={styles.chatButtonContainer}>
                    <PrimaryButton
                        text="CHAT WITH BADR"
                        onPress={handleChatWithBadr}
                    />
                </View>

            </ScrollView>
        </BlackScreenWrapper>
    );
}
