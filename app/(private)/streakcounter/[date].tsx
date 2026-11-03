import StreakCounter from "@/src/screens/private/streakcounter";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: string }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: "" };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error: error.message };
    }

    render() {
        if (this.state.hasError) {
            return (
                <View
                    style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                >
                    <Text style={{ color: "red" }}>{this.state.error}</Text>
                </View>
            );
        }

        return this.props.children;
    }
}

export default function StreakCounterRoute() {
    const params = useLocalSearchParams();
    const date =
        typeof params.date === "string"
            ? params.date
            : Array.isArray(params.date)
                ? params.date[0]
                : undefined;

    return (
        <ErrorBoundary>
            <StreakCounter date={date} />
        </ErrorBoundary>
    );
}
