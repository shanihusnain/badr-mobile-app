import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { api } from "..";

export type ConnectTeamMessageSender = {
  userId: string;
  name: string;
  username?: string;
  avatarUrl?: string | null;
};

export type ConnectTeamMessage = {
  id: string;
  type: "SYSTEM" | "USER" | string;
  text: string;
  isMine: boolean;
  createdAt?: string;
  sender?: ConnectTeamMessageSender | null;
};

/** One page from GET api/connect/teams/:teamId/messages */
export type ConnectTeamMessagesPage = {
  chatEnabled: boolean;
  /** Newest first */
  messages: ConnectTeamMessage[];
  nextBefore?: string | null;
};

/** Flattened cache shape used by screens */
export type ConnectTeamMessagesData = {
  chatEnabled: boolean;
  messages: ConnectTeamMessage[];
  nextBefore?: string | null;
};

export const connectTeamMessagesQueryKey = (teamId: string) =>
  ["connect", "teams", teamId, "messages"] as const;

export const getConnectTeamMessages = async (
  teamId: string,
  before?: string,
): Promise<ConnectTeamMessagesPage> => {
  const response = await api.get(`api/connect/teams/${teamId}/messages`, {
    params: before ? { before } : undefined,
  });

  const data = response.data?.data;
  return {
    chatEnabled: data?.chatEnabled ?? true,
    messages: Array.isArray(data?.messages) ? data.messages : [],
    nextBefore: data?.nextBefore ?? null,
  };
};

/** One GET of the newest page after a socket reconnect — merges into infinite cache. */
export const catchUpConnectTeamMessages = async (
  queryClient: QueryClient,
  teamId: string,
) => {
  const page = await getConnectTeamMessages(teamId);
  queryClient.setQueryData<InfiniteData<ConnectTeamMessagesPage>>(
    connectTeamMessagesQueryKey(teamId),
    (current) => {
      if (!current?.pages?.length) {
        return { pages: [page], pageParams: [undefined] };
      }

      const newestIds = new Set(page.messages.map((message) => message.id));
      const olderPages = current.pages.slice(1).map((olderPage) => ({
        ...olderPage,
        messages: olderPage.messages.filter(
          (message) => !newestIds.has(message.id),
        ),
      }));

      return {
        ...current,
        pages: [page, ...olderPages],
      };
    },
  );
};

export const useGetConnectTeamMessages = (
  teamId: string | null | undefined,
  enabled = true,
) => {
  const query = useInfiniteQuery({
    queryKey: connectTeamMessagesQueryKey(teamId ?? ""),
    queryFn: ({ pageParam }) =>
      getConnectTeamMessages(teamId!, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextBefore || undefined,
    enabled: Boolean(teamId) && enabled,
    // Live updates come from the connect socket — never poll.
    refetchInterval: false,
  });

  const data = useMemo<ConnectTeamMessagesData | null>(() => {
    if (!query.data?.pages?.length) return null;

    const messages = query.data.pages.flatMap((page) => page.messages);
    const firstPage = query.data.pages[0];
    const lastPage = query.data.pages[query.data.pages.length - 1];

    return {
      chatEnabled: firstPage.chatEnabled,
      messages,
      nextBefore: lastPage.nextBefore ?? null,
    };
  }, [query.data]);

  return {
    ...query,
    data,
  };
};
