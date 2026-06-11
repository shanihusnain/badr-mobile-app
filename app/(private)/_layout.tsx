import { Stack } from "expo-router";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export default function PrivateLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.light.blackBackground },
        headerTintColor: Colors.light.white,
        headerTitleStyle: {
          fontFamily: fonts.primary.semiBold,
          fontSize: 16,
          color: Colors.light.white,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="setpersonalizedgoals/index"
        options={{ headerShown: true, title: "" }}
      />
      <Stack.Screen
        name="monthlygoalplanner"
        options={{ headerShown: true, title: "MONTHLY GOAL PLANNER" }}
      />
      <Stack.Screen
        name="goaldescriptiondetails/[goal]"
        options={{ headerShown: true, title: "" }}
      />
      <Stack.Screen name="streakcounter" options={{ headerShown: false }} />
      <Stack.Screen
        name="home"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="menstruationlog" options={{ headerShown: false }} />
      <Stack.Screen
        name="GoalProgressLoggingScreen/[goalId]"
        options={{
          headerShown: false,
          title: "GOAL PROGRESS",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
