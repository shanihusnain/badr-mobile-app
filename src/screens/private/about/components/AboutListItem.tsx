import React from "react";
import { Pressable, Text } from "react-native";
import { aboutStyles as styles } from "../style";

type AboutListItemProps = {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
};

export default function AboutListItem({ icon, label, onPress }: AboutListItemProps) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.listItem,
                { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onPress}
        >
            {icon}
            <Text style={styles.listItemText}>{label}</Text>
        </Pressable>
    );
}
