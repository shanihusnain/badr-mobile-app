import { useEffect, useRef } from "react";
import { useGetFastingGoalFastTimes } from "@/src/api/queries/useGetFastingGoalFastTimes";
import { parseHhMmToStartTimeParts } from "../components/TimePickerSteps";

type TimeSetters = {
  setStartHour: (value: string) => void;
  setStartMinute: (value: string) => void;
  setStartPeriod: (value: "am" | "pm") => void;
  setEndHour: (value: string) => void;
  setEndMinute: (value: string) => void;
  setEndPeriod: (value: "am" | "pm") => void;
};

/**
 * Prefills start/end pickers from Fajr/Maghrib for `date`.
 * Re-applies when the date changes; user can still edit afterward.
 */
export function usePrefillFastingTimesFromApi(
  fastingType: string | null | undefined,
  date: string | null | undefined,
  setters: TimeSetters,
  options?: { enabled?: boolean },
) {
  const query = useGetFastingGoalFastTimes(fastingType, date, options);
  const appliedForDateRef = useRef<string | null>(null);
  const settersRef = useRef(setters);
  settersRef.current = setters;

  useEffect(() => {
    appliedForDateRef.current = null;
  }, [date]);

  useEffect(() => {
    const payload = query.data;
    if (!payload || !date) return;
    if (payload.date.slice(0, 10) !== String(date).slice(0, 10)) return;
    if (appliedForDateRef.current === payload.date) return;

    const start = parseHhMmToStartTimeParts(payload.startTime);
    const end = parseHhMmToStartTimeParts(payload.endTime);
    if (!start || !end) return;

    const {
      setStartHour,
      setStartMinute,
      setStartPeriod,
      setEndHour,
      setEndMinute,
      setEndPeriod,
    } = settersRef.current;

    setStartHour(start.hour);
    setStartMinute(start.minute);
    setStartPeriod(start.period);
    setEndHour(end.hour);
    setEndMinute(end.minute);
    setEndPeriod(end.period);
    appliedForDateRef.current = payload.date;
  }, [date, query.data]);

  return query;
}
