import { BehaviorDetailDescription } from "@/src/screens/private/behaviordetaildescription";
import { useLocalSearchParams } from "expo-router";

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function BehaviorDescriptionDetailsScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    period?: string | string[];
    endDate?: string | string[];
  }>();

  const id = firstParam(params.id);
  if (!id) return null;

  return (
    <BehaviorDetailDescription
      behavior={id}
      periodLabel={firstParam(params.period)}
      endDate={firstParam(params.endDate)}
    />
  );
}
