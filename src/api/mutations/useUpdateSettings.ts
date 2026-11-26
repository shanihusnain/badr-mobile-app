import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import type {
  AppSettings,
  AppSettingsPatch,
} from "@/src/api/queries/useGetSettings";

const updateSettings = async (
  patch: AppSettingsPatch,
): Promise<AppSettings> => {
  const response = await api.patch("api/settings", patch);
  return response.data?.data;
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSettings,
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: ["settings"] });
      const previous = queryClient.getQueryData<AppSettings>(["settings"]);
      if (previous) {
        queryClient.setQueryData<AppSettings>(["settings"], {
          ...previous,
          ...patch,
        });
      }
      return { previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["settings"], context.previous);
      }
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(["settings"], data);
      }
    },
  });
};
