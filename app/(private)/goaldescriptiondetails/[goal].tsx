import { GoalDescriptionDetails } from "@/src/private/goalDescriptionDetails";
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

export default function GoalDescriptionDetailsScreen() {
  const params = useLocalSearchParams();
  return (
    <ErrorBoundary>
      <GoalDescriptionDetails goal={params.goal as string} />
    </ErrorBoundary>
  );
}
