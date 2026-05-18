import { Stack } from "expo-router";

export default function PrivateLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="setpersonalizedgoals/index"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
