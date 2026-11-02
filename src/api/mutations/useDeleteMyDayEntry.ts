import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import type { MyDayDeleteAction } from "@/src/api/queries/useGetMyDayDetails";

function normalizePath(path: string): string {
  return path.replace(/^\//, "");
}

const deleteMyDayEntry = async (action: MyDayDeleteAction) => {
  const method = (action.method || "DELETE").toUpperCase();
  const url = normalizePath(action.path);
  const config = {
    params: action.query ?? undefined,
    data: action.body ?? undefined,
  };

  switch (method) {
    case "POST":
      return (await api.post(url, action.body ?? undefined, { params: action.query ?? undefined })).data;
    case "PUT":
      return (await api.put(url, action.body ?? undefined, { params: action.query ?? undefined })).data;
    case "PATCH":
      return (await api.patch(url, action.body ?? undefined, { params: action.query ?? undefined })).data;
    case "DELETE":
    default:
      return (await api.delete(url, config)).data;
  }
};

export const useDeleteMyDayEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMyDayEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home", "my-day"] });
    },
  });
};
