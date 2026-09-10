import Header from "@/components/Header";
import { HeaderWithImageTitleAndBell } from "@/components/atoms/HeaderWithImageTitleAndBell";
import { getPlanJournalHabitTitleById } from "@/src/screens/private/plan/planJournalConsistencyMockData";
import { Stack } from "expo-router";

function getRouteIdParam(params: object | undefined): string | undefined {
  const { id } = (params ?? {}) as { id?: string | string[] };

  return Array.isArray(id) ? id[0] : id;
}

export default function PlanLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          header: () => <HeaderWithImageTitleAndBell />,
        }}
      />
      <Stack.Screen
        name="journalinsight/[id]"
        options={{
          headerShown: true,
          header: ({ route }) => {
            const title = getPlanJournalHabitTitleById(
              getRouteIdParam(route.params),
            );

            return (
              <HeaderWithImageTitleAndBell
                title={title.toUpperCase()}
                showBack={true}
              />
            );
          },
        }}
      />
    </Stack>
  );
}
