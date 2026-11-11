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

  // INCOMING from server — other members must see this when someone types.
  instance.on("team:typing", (payload) => {
    console.log("[connect-socket] incoming team:typing", payload);
    emitTeamTypingEvent(payload);
  });

  // Debug: surface unexpected events (helps verify backend broadcast names).
  instance.onAny((event, ...args) => {
    if (
      event === "team:message" ||
      event === "team:typing" ||
      event === "connect" ||
      event === "disconnect"
    ) {
      return;
    }
    console.log("[connect-socket] event", event, args?.[0]);
  });
};

export type EmitTeamTypingPayload = {
  teamId: string;
  typing: boolean;
  /** Included so a simple server rebroadcast can identify the typer. */
  userId?: string;
  name?: string;
  avatarUrl?: string | null;
};

/**
 * Tell other team members this user started/stopped typing.
 * Server must broadcast to other room members (not the sender).
 */
export const emitTeamTyping = (payload: EmitTeamTypingPayload) => {
  if (!socket?.connected) {
    console.log("[connect-socket] skip typing emit — socket not connected");
    return;
  }
  if (!payload.teamId) {
    console.log("[connect-socket] skip typing emit — missing teamId");
    return;
  }

  const body: EmitTeamTypingPayload = {
    teamId: payload.teamId,
    typing: payload.typing,
    ...(payload.userId ? { userId: payload.userId } : {}),
    ...(payload.name ? { name: payload.name } : {}),
    ...(payload.avatarUrl !== undefined
      ? { avatarUrl: payload.avatarUrl }
      : {}),
  };

  // OUTGOING only — other devices must log "[connect-socket] team:typing" (no "emit").
  console.log("[connect-socket] emit team:typing", body);
  socket.emit("team:typing", body);
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
