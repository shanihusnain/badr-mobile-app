import {
  catchUpConnectTeamMessages,
  connectTeamMessagesQueryKey,
  type ConnectTeamMessage,
  type ConnectTeamMessagesPage,
} from "@/src/api/queries/useGetConnectTeamMessages";
import {
  connectConnectSocket,
  disconnectConnectSocket,
  onConnectSocketReconnect,
  onTeamMessage,
} from "@/src/realtime/connectSocket";
import { getAccessToken } from "@/src/storage/tokenStorage";
import {
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useAuth } from "./useAuth";

const upsertMessageIntoPages = (
  data: InfiniteData<ConnectTeamMessagesPage> | undefined,
  message: ConnectTeamMessage,
): InfiniteData<ConnectTeamMessagesPage> | undefined => {
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

const getActiveMessageTeamIds = (queryClient: QueryClient): string[] => {
  return queryClient
    .getQueryCache()
    .findAll({
      predicate: (query) =>
        query.queryKey[0] === "connect" &&
        query.queryKey[1] === "teams" &&
        query.queryKey[3] === "messages" &&
        query.getObserversCount() > 0,
    })
    .map((query) => query.queryKey[2])
    .filter(
      (teamId): teamId is string =>
        typeof teamId === "string" && teamId.length > 0,
    );
};

export const ConnectSocketProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      disconnectConnectSocket();
      return;
    }

    let cancelled = false;

    const connect = async () => {
      const token = await getAccessToken();
      if (cancelled || !token) return;
      connectConnectSocket(token);
    };

    void connect();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isAuthenticated) return;

    return onTeamMessage((message) => {
      const currentUserId =
        user?.id ?? user?.userId ?? user?.sub ?? null;
      const resolved: ConnectTeamMessage = {
        ...message,
        isMine:
          typeof message.isMine === "boolean" && message.isMine
            ? true
            : Boolean(
                currentUserId &&
                  message.sender?.userId &&
                  message.sender.userId === currentUserId,
              ),
      };

      const teamIds = message.teamId
        ? [message.teamId]
        : getActiveMessageTeamIds(queryClient);

      if (teamIds.length === 0) {
        console.log(
          "[connect-socket] team:message received but no active chat cache to update",
          message.id,
        );
        return;
      }

      teamIds.forEach((teamId) => {
        queryClient.setQueryData<InfiniteData<ConnectTeamMessagesPage>>(
          connectTeamMessagesQueryKey(teamId),
          (current) => upsertMessageIntoPages(current, resolved),
        );
      });
    });
  }, [isAuthenticated, queryClient, user]);

  useEffect(() => {
    if (!isAuthenticated) return;

    return onConnectSocketReconnect(() => {
      // One catch-up GET per active chat query — never poll.
      const activeMessageQueries = queryClient
        .getQueryCache()
        .findAll({
          predicate: (query) =>
            query.queryKey[0] === "connect" &&
            query.queryKey[1] === "teams" &&
            query.queryKey[3] === "messages" &&
            query.getObserversCount() > 0,
        });

      activeMessageQueries.forEach((query) => {
        const teamId = query.queryKey[2];
        if (typeof teamId !== "string" || !teamId) return;
        void catchUpConnectTeamMessages(queryClient, teamId);
      });
    });
  }, [isAuthenticated, queryClient]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState !== "active") return;
      void (async () => {
        const token = await getAccessToken();
        if (!token) return;
        connectConnectSocket(token);
      })();
    };

    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, [isAuthenticated]);

  useEffect(() => {
    return () => {
      disconnectConnectSocket();
    };
  }, []);

  return children;
};
