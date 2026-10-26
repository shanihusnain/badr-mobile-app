import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import {
  JOURNAL_DAY_QUERY_KEY,
  journalDayQueryKey,
  type JournalDayData,
} from "../queries/useGetJournalDay";

export type JournalDayEntryUpdate = {
  behaviorId: string;
  status: "COMPLETED" | "INCOMPLETE";
};

export type UpdateJournalDayParams = {
  date: string;
  entries: JournalDayEntryUpdate[];
  note: string;
};

const updateJournalDay = async ({
  date,
  entries,
  note,
}: UpdateJournalDayParams): Promise<JournalDayData> => {
  const response = await api.put(`api/journal/days/${date}`, {
    entries,
    note,
  });
  return response.data?.data;
};

export const useUpdateJournalDay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateJournalDay,
    onSuccess: (data, variables) => {
      if (data) {
        queryClient.setQueryData(journalDayQueryKey(variables.date), data);
      }
      queryClient.invalidateQueries({
        queryKey: [JOURNAL_DAY_QUERY_KEY, variables.date],
      });
    },
    onError: (error) => {
      console.error("Error updating journal day:", error);
    },
  });
};
