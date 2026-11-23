import Header from "@/components/Header";
import { HeaderWithImageTitleAndBell } from "@/components/atoms/HeaderWithImageTitleAndBell";
import { getPlanJournalHabitTitleById } from "@/src/screens/private/plan/planJournalConsistencyMockData";
import { Stack } from "expo-router";

function getRouteTitle(params: object | undefined): string {
  const { id, title } = (params ?? {}) as {
    id?: string | string[];
    title?: string | string[];
  };

  const titleParam = Array.isArray(title) ? title[0] : title;
  if (titleParam) return titleParam;

  return getPlanJournalHabitTitleById(Array.isArray(id) ? id[0] : id);
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
            const title = getRouteTitle(route.params);

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
