import React from "react";
import { View } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Colors } from "@/constants/theme";
import { aboutStyles as styles } from "./style";
import { DocumentIcon, DocumentLockIcon, DocumentSearchIcon } from "@/assets/icons";
import AboutListItem from "./components/AboutListItem";

const ABOUT_ITEMS = [
    { id: "open_source", label: "OPEN SOURCE LINCENSES", icon: <DocumentIcon height={24} width={20} color={Colors.light.subtext} /> },
    { id: "privacy_policy", label: "PRIVACY POLICY", icon: <DocumentLockIcon size={24} color={Colors.light.subtext} /> },
    { id: "terms_of_use", label: "TERMS OF USE", icon: <DocumentSearchIcon height={20} width={20} color={Colors.light.subtext} /> },
];

export default function AboutScreen() {
    const handleItemPress = (id: string) => {
        // Handle navigation per item if needed
    };

    return (
        <BlackScreenWrapper>
            <View style={styles.content}>
                {ABOUT_ITEMS.map((item) => (
                    <AboutListItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        onPress={() => handleItemPress(item.id)}
                    />
                ))}
            </View>
        </BlackScreenWrapper>
    );
}
