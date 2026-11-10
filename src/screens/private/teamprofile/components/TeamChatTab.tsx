import { fonts } from "@/assets/fonts";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";
import { Colors } from "@/constants/theme";
import type { ConnectTeamMessage } from "@/src/api/queries/useGetConnectTeamMessages";
import type { TeamTypingUser } from "@/src/realtime/useTeamTyping";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TypingBubble } from "./TypingBubble";

const MUTED = "#8E98A8";
const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200";

type TeamChatTabProps = {
  enabled?: boolean;
  teamName: string;
  teamLogoUri: string;
  userAvatarUri?: string | null;
  /** Newest first — FlatList is inverted for chat UX */
  messages: ConnectTeamMessage[];
  isLoading?: boolean;
  isSending?: boolean;
  isFetchingOlder?: boolean;
  hasOlderMessages?: boolean;
  typingUsers?: TeamTypingUser[];
  onLoadOlder?: () => void;
  onTypingChange?: (text: string) => void;
  onSend: (text: string) => Promise<void> | void;
};

function formatMessageTime(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/**
 * FlatList `inverted` expects newest-first data so that:
 * - visual top = oldest
 * - visual bottom = newest (WhatsApp-style)
 */
function sortMessagesNewestFirst(
  messages: ConnectTeamMessage[],
): ConnectTeamMessage[] {
  return [...messages].sort((a, b) => {
    const aTime = a.createdAt ? Date.parse(a.createdAt) : Number.NaN;
    const bTime = b.createdAt ? Date.parse(b.createdAt) : Number.NaN;

    // Messages without a timestamp (optimistic / socket edge) stay at the newest end.
    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
    if (Number.isNaN(aTime)) return -1;
    if (Number.isNaN(bTime)) return 1;
    if (bTime !== aTime) return bTime - aTime;

    // Stable tie-breaker so equal timestamps don't jitter.
    return b.id.localeCompare(a.id);
  });
}

export function TeamChatTab({
  enabled = true,
  teamName,
  teamLogoUri,
  userAvatarUri,
  messages,
  isLoading = false,
  isSending = false,
  isFetchingOlder = false,
  hasOlderMessages = false,
  typingUsers = [],
  onLoadOlder,
  onTypingChange,
  onSend,
}: TeamChatTabProps) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState("");

  const canSend = draft.trim().length > 0 && !isSending;
  const composerAvatar = userAvatarUri?.trim() || FALLBACK_AVATAR;
  const showTyping = typingUsers.length > 0;

  const handleDraftChange = (text: string) => {
    setDraft(text);
    onTypingChange?.(text);
  };

  const handleSend = async () => {
    if (!canSend) return;
    const text = draft.trim();
    setDraft("");
    await onSend(text);
  };

  const listData = useMemo(
    () => sortMessagesNewestFirst(messages),
    [messages],
  );
  const isEmpty = !isLoading && listData.length === 0;

  const handleEndReached = () => {
    if (!hasOlderMessages || isFetchingOlder || !onLoadOlder) return;
    onLoadOlder();
  };

  if (!enabled) {
    return (
      <View style={styles.disabledWrap}>
        <Text style={styles.disabledTitle}>TEAM CHAT IS OFF</Text>
        <Text style={styles.disabledBody}>
          Turn on Team Chat from Manage Team to message your members.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={24}
    >
      <View style={styles.identityRow}>
        <Image
          source={{ uri: teamLogoUri }}
          style={styles.teamLogo}
          contentFit="cover"
        />
        <Text style={styles.teamName}>{teamName}</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <LoadingComponent size="medium" />
        </View>
      ) : isEmpty ? (
        <View style={styles.emptyState}>
          <Image
            source={{ uri: teamLogoUri }}
            style={styles.emptyLogo}
            contentFit="cover"
          />
          <Text style={styles.emptyText}>NO MESSAGES YET. BE THE FIRST!</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          inverted
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            isFetchingOlder ? (
              <View style={styles.olderLoading}>
                <LoadingComponent size="small" />
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            if (item.type === "SYSTEM") {
              return (
                <View style={styles.systemRow}>
                  <Text style={styles.systemText}>{item.text}</Text>
                </View>
              );
            }

            const senderAvatar =
              item.sender?.avatarUrl?.trim() || FALLBACK_AVATAR;
            const senderName = item.sender?.name ?? "";

            return (
              <View
                style={[
                  styles.messageRow,
                  item.isMine && styles.messageRowMine,
                ]}
              >
                {!item.isMine ? (
                  <Image
                    source={{ uri: senderAvatar }}
                    style={styles.messageAvatar}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.avatarSpacer} />
                )}
                <View
                  style={[
                    styles.bubble,
                    item.isMine ? styles.bubbleMine : styles.bubbleOther,
                  ]}
                >
                  {!item.isMine && senderName ? (
                    <Text style={styles.sender}>{senderName}</Text>
                  ) : null}
                  <Text style={styles.messageText}>{item.text}</Text>
                  {item.createdAt ? (
                    <Text style={styles.time}>
                      {formatMessageTime(item.createdAt)}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Outside inverted FlatList so the bubble is never flipped/clipped */}
      {showTyping ? (
        <View style={styles.typingWrap}>
          <TypingBubble users={typingUsers} />
        </View>
      ) : null}

      <View
        style={[
          styles.composerWrap,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <View style={styles.composerBar}>
          <Image
            source={{ uri: composerAvatar }}
            style={styles.composerAvatar}
            contentFit="cover"
          />

          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={handleDraftChange}
            placeholder="SAY SOMETHING"
            placeholderTextColor={MUTED}
            multiline
            editable={!isSending}
          />

          <View style={styles.composerDivider} />

          <Pressable
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!canSend}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Feather
              name="send"
              size={18}
              color={MUTED}
              style={[styles.sendIcon, !canSend && styles.sendIconDisabled]}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    marginTop: -36,
    marginBottom: 8,
  },
  teamLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.darkgrey,
    borderWidth: 2,
    borderColor: Colors.light.blackBackground,
  },
  teamName: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 18,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 18,
  },
  emptyLogo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.light.darkgrey,
  },
  emptyText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  olderLoading: {
    paddingVertical: 12,
    alignItems: "center",
  },
  typingWrap: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 2,
  },
  systemRow: {
    alignSelf: "center",
    maxWidth: "90%",
    paddingVertical: 4,
  },
  systemText: {
    color: MUTED,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    textAlign: "center",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    maxWidth: "92%",
  },
  messageRowMine: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.darkgrey,
  },
  avatarSpacer: {
    width: 28,
  },
  bubble: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxWidth: "85%",
  },
  bubbleOther: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderBottomLeftRadius: 4,
  },
  bubbleMine: {
    backgroundColor: Colors.light.green,
    borderBottomRightRadius: 4,
  },
  sender: {
    color: Colors.light.dullWhite,
    fontFamily: fonts.primary.semiBold,
    fontSize: 11,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  messageText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  time: {
    marginTop: 6,
    color: "rgba(255,255,255,0.7)",
    fontFamily: fonts.primary.regular,
    fontSize: 10,
    alignSelf: "flex-end",
  },
  composerWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: Colors.light.blackBackground,
  },
  composerBar: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 6,
  },
  composerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.darkgrey,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textTransform: "none",
  },
  composerDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    marginVertical: 8,
    backgroundColor: MUTED,
    opacity: 0.45,
  },
  sendButton: {
    width: 44,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  sendIcon: {
    marginTop: 1,
    marginLeft: 2,
  },
  sendIconDisabled: {
    opacity: 0.55,
  },
  disabledWrap: {
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: "center",
  },
  disabledTitle: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    marginBottom: 8,
  },
  disabledBody: {
    color: MUTED,
    fontFamily: fonts.primary.regular,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
