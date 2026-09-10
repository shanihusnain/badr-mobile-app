import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
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
import {
  CURRENT_USER,
  EXTRA_TEAM_MEMBERS,
  type TeamMember,
} from "../mockData";
import type { TeamChatMessage } from "../rankMockData";

const MUTED = "#8E98A8";

const MEMBERS_BY_ID: Record<string, TeamMember> = Object.fromEntries(
  [CURRENT_USER, ...EXTRA_TEAM_MEMBERS].map((member) => [member.id, member]),
);

type TeamChatTabProps = {
  enabled?: boolean;
  teamName: string;
  teamLogoUri: string;
  userAvatarUri?: string;
};

export function TeamChatTab({
  enabled = true,
  teamName,
  teamLogoUri,
  userAvatarUri = CURRENT_USER.avatarUri,
}: TeamChatTabProps) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [draft, setDraft] = useState("");

  const canSend = draft.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    setMessages((current) => [
      ...current,
      {
        id: String(Date.now()),
        memberId: "me",
        text: draft.trim(),
        time: "Just now",
        isMine: true,
      },
    ]);
    setDraft("");
  };

  const listData = useMemo(() => messages, [messages]);
  const isEmpty = listData.length === 0;

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

      {isEmpty ? (
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
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const member = MEMBERS_BY_ID[item.memberId];
            return (
              <View
                style={[
                  styles.messageRow,
                  item.isMine && styles.messageRowMine,
                ]}
              >
                {!item.isMine && member ? (
                  <Image
                    source={{ uri: member.avatarUri }}
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
                  {!item.isMine && member ? (
                    <Text style={styles.sender}>{member.name}</Text>
                  ) : null}
                  <Text style={styles.messageText}>{item.text}</Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
              </View>
            );
          }}
        />
      )}

      <View
        style={[
          styles.composerWrap,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <View style={styles.composerBar}>
          <Image
            source={{ uri: userAvatarUri }}
            style={styles.composerAvatar}
            contentFit="cover"
          />

          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="SAY SOMETHING"
            placeholderTextColor={MUTED}
            multiline
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
              style={[
                styles.sendIcon,
                !canSend && styles.sendIconDisabled,
              ]}
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
    paddingBottom: 12,
    gap: 10,
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
    // Feather "send" glyph sits slightly left/high in its box
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
