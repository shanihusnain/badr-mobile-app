import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export type MyDayFilter = {
  key: string;
  label: string;
};

export type MyDayTimeRange = {
  start: string;
  end: string;
  duration: string;
};

export type MyDayDeleteAction = {
  method: string;
  path: string;
  query: Record<string, string> | null;
  body: Record<string, unknown> | null;
  removesWholeDay: boolean;
};

export type MyDayEntry = {
  id: string;
  category: string;
  goalType: string;
  goalName: string;
  line: string;
  time: string;
  timeRange: MyDayTimeRange | null;
  sortMinute: number;
  delete: MyDayDeleteAction | null;
};

export type MyDayPopupCopy = {
  title: string;
  description: string;
  confirm: string;
  cancel: string;
};

export type MyDayDetailsData = {
  date: string;
  title: string;
  hidden: boolean;
  toggleLabel: string;
  sectionTitle: string;
  filters: MyDayFilter[];
  category: string;
  entries: MyDayEntry[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  showMoreLabel: string;
  showLessLabel: string;
  addDailyProgressLabel: string;
  emptyText: string | null;
  hidePopup: MyDayPopupCopy;
  deletePopup: MyDayPopupCopy;
};

const getMyDayDetails = async (
  date: string,
  category: string,
  offset: number,
  limit: number,
): Promise<MyDayDetailsData> => {
  const response = await api.get(`api/home/my-day`, {
    params: {
      date, // YYYY-MM-DD e.g. 2026-10-26
      category,
      offset,
      limit,
    },
  });
  return response.data?.data;
};

export const useGetMyDayDetails = (
  date: string,
  category: string,
  offset: number,
  limit: number,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["home", "my-day", date, category, offset, limit],
    queryFn: () => getMyDayDetails(date, category, offset, limit),
    enabled: (options?.enabled ?? true) && Boolean(date && category),
  });
};
