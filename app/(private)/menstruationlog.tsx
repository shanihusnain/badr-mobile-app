import MenstruationLog from "../../src/private/menstruationlog";
import { useLocalSearchParams } from "expo-router";

/**
 * Route screen for Log Menstruation.
 *
 * Testing cycle bounds: navigate with a query param, e.g. from Home:
 *   router.push({
 *     pathname: "/menstruationlog",
 *     params: { cycleStartDate: "2026-05-08" },
 *   });
 *
 * Production: pass cycleStartDate from Redux/AsyncStorage once the
 * monthly goal planner persists the user's cycle start.
 */
export default function MenstruationLogScreen() {
  const { cycleStartDate } = useLocalSearchParams<{
    cycleStartDate?: string;
  }>();

  const resolvedCycleStart =
    typeof cycleStartDate === "string" ? cycleStartDate : undefined;

  return <MenstruationLog cycleStartDate={resolvedCycleStart} />;
}
