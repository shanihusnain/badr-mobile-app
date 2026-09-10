import { JornalInsight } from "@/src/screens/private/journalinsight";
import { useLocalSearchParams } from "expo-router";

export default function JournalInsightScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const habitId = Array.isArray(id) ? id[0] : id;

  if (!habitId) {
    return null;
  }

  return <JornalInsight id={habitId} />;
}
