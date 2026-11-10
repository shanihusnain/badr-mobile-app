import { getApiErrorMessage, showToast } from "@/src/config/toastConfig";
import {
  connectTeamMessagesQueryKey,
  type ConnectTeamMessage,
  type ConnectTeamMessagesPage,
} from "@/src/api/queries/useGetConnectTeamMessages";
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { api } from "..";

export type SendConnectTeamMessagePayload = {
  teamId: string;
  text: string;
};

const sendConnectTeamMessage = async ({
  teamId,
  text,
}: SendConnectTeamMessagePayload): Promise<ConnectTeamMessage | null> => {
  const response = await api.post(`api/connect/teams/${teamId}/messages`, {
    text,
  });
  return response.data?.data ?? null;
};

const upsertSentMessage = (
  data: InfiniteData<ConnectTeamMessagesPage> | undefined,
  message: ConnectTeamMessage,
): InfiniteData<ConnectTeamMessagesPage> => {
  if (!data?.pages?.length) {
    return {
      pages: [
        {
          chatEnabled: true,
          messages: [message],
          nextBefore: null,
        },
      ],
      pageParams: [undefined],
    };
  }

  const alreadyExists = data.pages.some((page) =>
    page.messages.some((item) => item.id === message.id),
  );
  if (alreadyExists) return data;

  const [firstPage, ...restPages] = data.pages;
  return {
    ...data,
    pages: [
      {
        ...firstPage,
        messages: [message, ...firstPage.messages],
      },
      ...restPages,
    ],
  };
};

export const useSendConnectTeamMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendConnectTeamMessage,
    onSuccess: (message, variables) => {
      // Prefer cache merge over refetch — socket also delivers team:message.
      if (!message) return;
      queryClient.setQueryData<InfiniteData<ConnectTeamMessagesPage>>(
        connectTeamMessagesQueryKey(variables.teamId),
        (current) => upsertSentMessage(current, message),
      );
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to send message"),
      );
    },
  });
};
