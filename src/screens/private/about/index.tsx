import React from "react";
import { View, Text, Pressable } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { aboutStyles as styles } from "./style";
import { useRouter } from "expo-router";
import { DocumentIcon, DocumentLockIcon, DocumentSearchIcon } from "@/assets/icons";

const ABOUT_ITEMS = [
    { id: "open_source", label: "OPEN SOURCE LINCENSES", icon: <DocumentIcon height={24} width={20} color={Colors.light.subtext} /> },
    { id: "privacy_policy", label: "PRIVACY POLICY", icon: <DocumentLockIcon size={24} color={Colors.light.subtext} /> },
    { id: "terms_of_use", label: "TERMS OF USE", icon: <DocumentSearchIcon height={20} width={20} color={Colors.light.subtext} /> },
];

export default function AboutScreen() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    const handleItemPress = (id: string) => {
        // Handle navigation per item if needed
    };

    return (
        <BlackScreenWrapper>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={handleBack}>
                    <Feather name="chevron-left" size={20} color={Colors.light.white} />
                </Pressable>
                <View style={styles.headerTitleContainer} pointerEvents="none">
                    <Text style={styles.headerTitle}>ABOUT</Text>
                </View>
            </View>

            <View style={styles.content}>
                {ABOUT_ITEMS.map((item) => (
                    <Pressable
                        key={item.id}
                        style={({ pressed }) => [
                            styles.listItem,
                            { opacity: pressed ? 0.7 : 1 },
                        ]}
                        onPress={() => handleItemPress(item.id)}
                    >
                        {item.icon}
                        <Text style={styles.listItemText}>{item.label}</Text>
                    </Pressable>
                ))}
            </View>
        </BlackScreenWrapper>
    );
}
