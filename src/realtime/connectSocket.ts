import type { ConnectTeamMessage } from "@/src/api/queries/useGetConnectTeamMessages";
import { io, type Socket } from "socket.io-client";

export type ConnectTeamSocketMessage = ConnectTeamMessage & {
  /** Present when backend includes it; otherwise client routes to active chats */
  teamId?: string;
};

export type ConnectTeamTypingEvent = {
  teamId?: string;
  typing: boolean;
  userId: string;
  name?: string;
  avatarUrl?: string | null;
};

type TeamMessageListener = (message: ConnectTeamSocketMessage) => void;
type TeamTypingListener = (event: ConnectTeamTypingEvent) => void;
type VoidListener = () => void;

let socket: Socket | null = null;
let hasConnectedOnce = false;
let intentionalDisconnect = false;

const teamMessageListeners = new Set<TeamMessageListener>();
const teamTypingListeners = new Set<TeamTypingListener>();
const reconnectListeners = new Set<VoidListener>();

const getConnectSocketUrl = (): string => {
  const base = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
  return `${base}/connect`;
};

const normalizeToken = (token: string): string =>
  token.replace(/^Bearer\s+/i, "").trim();

const emitTeamMessage = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return;

  const raw = payload as Partial<ConnectTeamSocketMessage> & {
    team_id?: string;
  };
  const teamId = raw.teamId ?? raw.team_id;
  const id = raw.id;
  const text = raw.text;

  // Backend currently emits without teamId — still deliver if id + text exist.
  if (!id || typeof text !== "string") {
    console.log("[connect-socket] ignored team:message (missing id/text)", payload);
    return;
  }

  const message: ConnectTeamSocketMessage = {
    id,
    teamId,
    type: raw.type ?? "USER",
    text,
    isMine: Boolean(raw.isMine),
    createdAt: raw.createdAt,
    sender: raw.sender ?? null,
  };

  teamMessageListeners.forEach((listener) => listener(message));
};

const emitTeamTypingEvent = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return;

  const raw = payload as Record<string, unknown>;
  const teamId =
    (typeof raw.teamId === "string" && raw.teamId) ||
    (typeof raw.team_id === "string" && raw.team_id) ||
    undefined;

  const typing =
    typeof raw.typing === "boolean"
      ? raw.typing
      : typeof raw.isTyping === "boolean"
        ? raw.isTyping
        : true;

  const sender =
    raw.sender && typeof raw.sender === "object"
      ? (raw.sender as Record<string, unknown>)
      : null;

  const userId =
    (typeof raw.userId === "string" && raw.userId) ||
    (typeof raw.user_id === "string" && raw.user_id) ||
    (typeof sender?.userId === "string" && sender.userId) ||
    (typeof sender?.id === "string" && sender.id) ||
    // Backend may omit user — still show a bubble for this team.
    (teamId ? `team:${teamId}` : "unknown");

  const name =
    (typeof raw.name === "string" && raw.name) ||
    (typeof sender?.name === "string" && sender.name) ||
    "Someone";

  const avatarUrl =
    (typeof raw.avatarUrl === "string" && raw.avatarUrl) ||
    (typeof sender?.avatarUrl === "string" && sender.avatarUrl) ||
    null;

  const event: ConnectTeamTypingEvent = {
    teamId,
    typing,
    userId,
    name,
    avatarUrl,
  };

  teamTypingListeners.forEach((listener) => listener(event));
};

const attachSocketHandlers = (instance: Socket) => {
  instance.on("connect", () => {
    console.log("[connect-socket] connected", {
      id: instance.id,
      url: getConnectSocketUrl(),
    });
    if (hasConnectedOnce && !intentionalDisconnect) {
      console.log("[connect-socket] reconnected — catching up messages");
      reconnectListeners.forEach((listener) => listener());
    }
    hasConnectedOnce = true;
    intentionalDisconnect = false;
  });

  instance.on("disconnect", (reason) => {
    console.log("[connect-socket] disconnected", reason);
  });

  instance.on("connect_error", (error) => {
    console.log("[connect-socket] connect_error", error.message);
  });

  instance.on("team:message", (payload) => {
    console.log("[connect-socket] team:message", payload);
    emitTeamMessage(payload);
  });

  instance.on("team:typing", (payload) => {
    console.log("[connect-socket] team:typing", payload);
    emitTeamTypingEvent(payload);
  });

  // Also accept common alternate event names until backend contract is confirmed.
  instance.on("typing", (payload) => {
    console.log("[connect-socket] typing", payload);
    emitTeamTypingEvent(
      normalizeIncomingTypingPayload(payload, true),
    );
  });
  instance.on("stop_typing", (payload) => {
    console.log("[connect-socket] stop_typing", payload);
    emitTeamTypingEvent(
      normalizeIncomingTypingPayload(payload, false),
    );
  });
  instance.on("user_typing", (payload) => {
    console.log("[connect-socket] user_typing", payload);
    emitTeamTypingEvent(
      normalizeIncomingTypingPayload(payload, true),
    );
  });
  instance.on("user_stop_typing", (payload) => {
    console.log("[connect-socket] user_stop_typing", payload);
    emitTeamTypingEvent(
      normalizeIncomingTypingPayload(payload, false),
    );
  });

  instance.onAny((event, ...args) => {
    if (event === "team:message" || event.startsWith("team:")) return;
    console.log("[connect-socket] event", event, args?.[0]);
  });
};

const normalizeIncomingTypingPayload = (
  payload: unknown,
  typingFallback: boolean,
) => {
  if (!payload || typeof payload !== "object") {
    return { typing: typingFallback };
  }
  const raw = payload as Record<string, unknown>;
  return {
    ...raw,
    typing:
      typeof raw.typing === "boolean"
        ? raw.typing
        : typeof raw.isTyping === "boolean"
          ? raw.isTyping
          : typingFallback,
  };
};

/** Tell other team members this user started/stopped typing. */
export const emitTeamTyping = (payload: {
  teamId: string;
  typing: boolean;
}) => {
  if (!socket?.connected) {
    console.log("[connect-socket] skip typing emit — socket not connected");
    return;
  }
  if (!payload.teamId) {
    console.log("[connect-socket] skip typing emit — missing teamId");
    return;
  }

  console.log("[connect-socket] emit team:typing", payload);
  socket.emit("team:typing", payload);
  // Compatibility emits in case backend listens under different names.
  if (payload.typing) {
    socket.emit("typing", payload);
  } else {
    socket.emit("stop_typing", payload);
  }
};
/**
 * Connect once after login. Server auto-joins the user to all team rooms.
 */
export const connectConnectSocket = (accessToken: string) => {
  const token = normalizeToken(accessToken);
  if (!token) return;

  intentionalDisconnect = false;

  if (socket) {
    const auth = socket.auth as { token?: string } | undefined;
    if (auth?.token !== token) {
      socket.auth = { token };
    }
    if (!socket.connected) {
      socket.connect();
    }
    return;
  }

  const url = getConnectSocketUrl();
  console.log("[connect-socket] connecting", url);

  socket = io(url, {
    auth: { token },
    autoConnect: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  attachSocketHandlers(socket);
};

export const updateConnectSocketAuth = (accessToken: string) => {
  const token = normalizeToken(accessToken);
  if (!token || !socket) return;

  socket.auth = { token };
  if (socket.connected) {
    socket.disconnect().connect();
  }
};

export const disconnectConnectSocket = () => {
  if (!socket) return;
  intentionalDisconnect = true;
  hasConnectedOnce = false;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
};

export const getConnectSocket = () => socket;

export const onTeamMessage = (listener: TeamMessageListener): (() => void) => {
  teamMessageListeners.add(listener);
  return () => {
    teamMessageListeners.delete(listener);
  };
};

export const onTeamTyping = (listener: TeamTypingListener): (() => void) => {
  teamTypingListeners.add(listener);
  return () => {
    teamTypingListeners.delete(listener);
  };
};

/** Fires after a reconnect (not the first successful connect). */
export const onConnectSocketReconnect = (
  listener: VoidListener,
): (() => void) => {
  reconnectListeners.add(listener);
  return () => {
    reconnectListeners.delete(listener);
  };
};
