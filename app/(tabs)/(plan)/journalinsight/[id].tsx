import { JornalInsight } from "@/src/screens/private/journalinsight";
import { useLocalSearchParams } from "expo-router";

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function JournalInsightScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    period?: string | string[];
    endDate?: string | string[];
  }>();

  const habitId = firstParam(params.id);
  const periodLabel = firstParam(params.period);
  const endDate = firstParam(params.endDate);

  if (!habitId) {
    return null;
  }

  return (
    <JornalInsight
      id={habitId}
      periodLabel={periodLabel}
      endDate={endDate}
    />
  );
}
