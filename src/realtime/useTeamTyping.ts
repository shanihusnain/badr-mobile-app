import {
  emitTeamTyping,
  onTeamMessage,
  onTeamTyping,
  type ConnectTeamTypingEvent,
} from "@/src/realtime/connectSocket";
import { useAuth } from "@/provider/useAuth";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STOP_TYPING_MS = 2000;
const EMIT_THROTTLE_MS = 1200;
const REMOTE_TYPING_EXPIRY_MS = 5000;

export type TeamTypingUser = {
  userId: string;
  name: string;
  avatarUrl?: string | null;
};

/**
 * Emits local typing and tracks OTHER users typing in this team chat.
 * The person typing never sees their own bubble.
 */
export const useTeamTyping = (
  teamId: string | null | undefined,
  enabled = true,
) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TeamTypingUser[]>([]);

  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEmitAtRef = useRef(0);
  const isTypingRef = useRef(false);
  const expiryTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const currentUserId = user?.id ?? user?.userId ?? user?.sub ?? null;
  const selfProfile = useMemo(
    () => ({
      userId:
        typeof currentUserId === "string" && currentUserId.length > 0
          ? currentUserId
          : undefined,
      name:
        user?.username?.trim() ||
        user?.name?.trim() ||
        user?.email?.split("@")[0]?.trim() ||
        undefined,
      avatarUrl: user?.avatarUrl ?? null,
    }),
    [currentUserId, user?.avatarUrl, user?.email, user?.name, user?.username],
  );

  const clearExpiry = useCallback((userId: string) => {
    const existing = expiryTimersRef.current.get(userId);
    if (existing) {
      clearTimeout(existing);
      expiryTimersRef.current.delete(userId);
    }
  }, []);

  const removeTypingUser = useCallback(
    (userId: string) => {
      clearExpiry(userId);
      setTypingUsers((prev) => prev.filter((item) => item.userId !== userId));
    },
    [clearExpiry],
  );

  const isSelfUserId = useCallback(
    (userId: string) =>
      Boolean(currentUserId && userId && userId === currentUserId),
    [currentUserId],
  );

  const upsertTypingUser = useCallback(
    (person: TeamTypingUser) => {
      // Typer never sees their own bubble.
      if (isSelfUserId(person.userId)) return;

      setTypingUsers((prev) => {
        const without = prev.filter((item) => item.userId !== person.userId);
        return [...without, person];
      });

      clearExpiry(person.userId);
      expiryTimersRef.current.set(
        person.userId,
        setTimeout(
          () => removeTypingUser(person.userId),
          REMOTE_TYPING_EXPIRY_MS,
        ),
      );
    },
    [clearExpiry, isSelfUserId, removeTypingUser],
  );

  useEffect(() => {
    if (!enabled || !teamId) {
      setTypingUsers([]);
      return;
    }

    const unsubscribeTyping = onTeamTyping((event: ConnectTeamTypingEvent) => {
      // Backend may omit teamId — only ignore clear mismatches.
      if (event.teamId && event.teamId !== teamId) return;

      const userId = event.userId?.trim() || `team:${teamId}`;

      // Never show a bubble for the local typer.
      if (isSelfUserId(userId)) {
        console.log("[connect-socket] ignore own typing event", userId);
        return;
      }

      if (!event.typing) {
        removeTypingUser(userId);
        return;
      }

      console.log("[connect-socket] show typing bubble", {
        teamId,
        userId,
        name: event.name,
      });

      upsertTypingUser({
        userId,
        name: event.name?.trim() || "Someone",
        avatarUrl: event.avatarUrl,
      });
    });

    // Incoming message from someone → clear their typing indicator.
    const unsubscribeMessage = onTeamMessage((message) => {
      if (message.teamId && message.teamId !== teamId) return;
      const senderId = message.sender?.userId;
      if (senderId) {
        removeTypingUser(senderId);
        return;
      }
      // No sender id — clear all remote typing for this open chat.
      setTypingUsers((prev) => {
        prev.forEach((person) => clearExpiry(person.userId));
        return [];
      });
    });

    return () => {
      unsubscribeTyping();
      unsubscribeMessage();
    };
  }, [
    clearExpiry,
    enabled,
    isSelfUserId,
    removeTypingUser,
    teamId,
    upsertTypingUser,
  ]);

  const emitTypingState = useCallback(
    (typing: boolean) => {
      if (!teamId) return;
      emitTeamTyping({
        teamId,
        typing,
        userId: selfProfile.userId,
        name: selfProfile.name,
        avatarUrl: selfProfile.avatarUrl,
      });
    },
    [selfProfile.avatarUrl, selfProfile.name, selfProfile.userId, teamId],
  );

  const stopTyping = useCallback(() => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    if (!teamId || !isTypingRef.current) return;
    isTypingRef.current = false;
    emitTypingState(false);
  }, [emitTypingState, teamId]);

  const notifyTyping = useCallback(() => {
    if (!enabled || !teamId) return;

    const now = Date.now();
    if (!isTypingRef.current || now - lastEmitAtRef.current > EMIT_THROTTLE_MS) {
      isTypingRef.current = true;
      lastEmitAtRef.current = now;
      emitTypingState(true);
    }

    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      stopTyping();
    }, STOP_TYPING_MS);
  }, [emitTypingState, enabled, stopTyping, teamId]);

  useEffect(() => {
    return () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      expiryTimersRef.current.forEach((timer) => clearTimeout(timer));
      expiryTimersRef.current.clear();
      if (teamId && isTypingRef.current) {
        emitTeamTyping({
          teamId,
          typing: false,
          userId: selfProfile.userId,
          name: selfProfile.name,
          avatarUrl: selfProfile.avatarUrl,
        });
        isTypingRef.current = false;
      }
    };
  }, [
    selfProfile.avatarUrl,
    selfProfile.name,
    selfProfile.userId,
    teamId,
  ]);

  return {
    typingUsers,
    notifyTyping,
    stopTyping,
    clearTypingUser: removeTypingUser,
  };
};
