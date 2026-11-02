import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "..";

const showHideMyDay = async (hidden: boolean) => {
  const response = await api.put(`api/home/my-day/visibility`, { hidden });
  return response.data;
};

export const useHandleToggleShowMyday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: showHideMyDay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home", "my-day"] });
    },
  });
};
