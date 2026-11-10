import {
  emitTeamTyping,
  onTeamMessage,
  onTeamTyping,
  type ConnectTeamTypingEvent,
} from "@/src/realtime/connectSocket";
import { useAuth } from "@/provider/useAuth";
import { useCallback, useEffect, useRef, useState } from "react";

const STOP_TYPING_MS = 2000;
const EMIT_THROTTLE_MS = 1200;

export type TeamTypingUser = {
  userId: string;
  name: string;
  avatarUrl?: string | null;
};

/**
 * Emits local typing and tracks other users typing in this team chat.
 * Assumes backend event: `team:typing` with `{ teamId?, typing, userId|sender }`.
 */
export const useTeamTyping = (teamId: string | null | undefined, enabled = true) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TeamTypingUser[]>([]);

  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEmitAtRef = useRef(0);
  const isTypingRef = useRef(false);
  const expiryTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const currentUserId = user?.id ?? user?.userId ?? user?.sub ?? null;

  const clearExpiry = useCallback((userId: string) => {
    const existing = expiryTimersRef.current.get(userId);
    if (existing) {
      clearTimeout(existing);
      expiryTimersRef.current.delete(userId);
    }
  }, []);

  const removeTypingUser = useCallback((userId: string) => {
    clearExpiry(userId);
    setTypingUsers((prev) => prev.filter((item) => item.userId !== userId));
  }, [clearExpiry]);

  const upsertTypingUser = useCallback(
    (person: TeamTypingUser) => {
      if (currentUserId && person.userId === currentUserId) return;

      setTypingUsers((prev) => {
        const without = prev.filter((item) => item.userId !== person.userId);
        return [...without, person];
      });

      clearExpiry(person.userId);
      // Safety: hide if we never get typing:false
      expiryTimersRef.current.set(
        person.userId,
        setTimeout(() => removeTypingUser(person.userId), 5000),
      );
    },
    [clearExpiry, currentUserId, removeTypingUser],
  );

  useEffect(() => {
    if (!enabled || !teamId) {
      setTypingUsers([]);
      return;
    }

    const unsubscribeTyping = onTeamTyping((event: ConnectTeamTypingEvent) => {
      // Same as team:message — backend may omit teamId; only ignore mismatches.
      if (event.teamId && event.teamId !== teamId) return;

      const userId = event.userId || `team:${teamId}`;
      if (currentUserId && userId === currentUserId) return;

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

    // A sent message means they stopped typing.
    const unsubscribeMessage = onTeamMessage((message) => {
      if (message.teamId && message.teamId !== teamId) return;
      const senderId = message.sender?.userId;
      if (senderId) removeTypingUser(senderId);
    });

    return () => {
      unsubscribeTyping();
      unsubscribeMessage();
    };
  }, [currentUserId, enabled, removeTypingUser, teamId, upsertTypingUser]);

  const stopTyping = useCallback(() => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    if (!teamId || !isTypingRef.current) return;
    isTypingRef.current = false;
    emitTeamTyping({ teamId, typing: false });
  }, [teamId]);

  const notifyTyping = useCallback(() => {
    if (!enabled || !teamId) return;

    const now = Date.now();
    if (!isTypingRef.current || now - lastEmitAtRef.current > EMIT_THROTTLE_MS) {
      isTypingRef.current = true;
      lastEmitAtRef.current = now;
      emitTeamTyping({ teamId, typing: true });
    }

    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      stopTyping();
    }, STOP_TYPING_MS);
  }, [enabled, stopTyping, teamId]);

  useEffect(() => {
    return () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      expiryTimersRef.current.forEach((timer) => clearTimeout(timer));
      expiryTimersRef.current.clear();
      if (teamId && isTypingRef.current) {
        emitTeamTyping({ teamId, typing: false });
        isTypingRef.current = false;
      }
    };
  }, [teamId]);

  return {
    typingUsers,
    notifyTyping,
    stopTyping,
    clearTypingUser: removeTypingUser,
  };
};
