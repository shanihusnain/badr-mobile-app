import { useEffect, useMemo } from "react";
import {
  isPrayerGoalDayDetailForDate,
  isSinglePrayerDayDetail,
  useGetPrayerGoalDayDetail,
  type SinglePrayerDayDetail,
} from "@/src/api/queries/useGetPrayerGoalDayDetail";
import {
  buildSinglePrayerDayDetailPrefill,
  type SinglePrayerDayDetailPrefill,
} from "@/src/utils/prayerDayDetailPrefill";

type Options = {
  prayerType: string | null | undefined;
  selectedDate: string;
  /** Usually `flowMode === "active"`. */
  enabled: boolean;
  /** Apply prefill whenever day-detail resolves for the selected date. */
  onPrefill: (prefill: SinglePrayerDayDetailPrefill) => void;
};

/**
 * Fetches day-detail for a single-prayer goal and calls `onPrefill`
 * when the payload matches `selectedDate` (edit past logs / empty-day defaults).
 */
export function useSinglePrayerDayDetailPrefill({
  prayerType,
  selectedDate,
  enabled,
  onPrefill,
}: Options) {
  const {
    data: dayDetailRaw,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetPrayerGoalDayDetail(prayerType, selectedDate, {
    enabled: enabled && !!selectedDate && !!prayerType,
  });

  const dayDetail = useMemo((): SinglePrayerDayDetail | null => {
    if (!isPrayerGoalDayDetailForDate(dayDetailRaw, selectedDate)) return null;
    return isSinglePrayerDayDetail(dayDetailRaw) ? dayDetailRaw : null;
  }, [dayDetailRaw, selectedDate]);

  const dayDetailLoadingState =
    enabled && !isError && dayDetail == null && (isLoading || isFetching);

  useEffect(() => {
    if (!dayDetail) return;
    onPrefill(buildSinglePrayerDayDetailPrefill(dayDetail));
  }, [dayDetail, onPrefill]);

  return {
    dayDetail,
    dayDetailLoadingState,
    refetchDayDetail: refetch,
  };
}
