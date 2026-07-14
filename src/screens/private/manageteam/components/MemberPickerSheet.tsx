import { BottomSheetWrapper } from "@/components/molecules/BottomSheetWrapper";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { Colors } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import { forwardRef, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { TeamMemberRow } from "../../teamprofile/components/TeamMemberRow";
import type { TeamMember } from "../../teamprofile/mockData";
import { manageTeamStyles as styles } from "../styles";

type MemberPickerMode = "transfer" | "remove";

type MemberPickerSheetProps = {
  members: TeamMember[];
  mode: MemberPickerMode;
  onClose: () => void;
  onSelectMember: (member: TeamMember) => void;
  /** When set, shows the transfer confirmation card instead of the list. */
  pendingTransferMember?: TeamMember | null;
  onConfirmTransfer?: () => void;
  onCancelTransfer?: () => void;
};

export const MemberPickerSheet = forwardRef<BottomSheet, MemberPickerSheetProps>(
  function MemberPickerSheet(
    {
      members,
      mode,
      onClose,
      onSelectMember,
      pendingTransferMember,
      onConfirmTransfer,
      onCancelTransfer,
    },
    ref,
  ) {
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return members.filter((m) => !m.isAdmin || mode === "remove");
      return members.filter((member) => {
        if (mode === "transfer" && member.isAdmin) return false;
        return (
          member.name.toLowerCase().includes(q) ||
          member.handle.toLowerCase().includes(q)
        );
      });
    }, [members, mode, query]);

    return (
      <BottomSheetWrapper
        ref={ref}
        snapPoints={["70%"]}
        bgColor={Colors.light.blackBackground}
        onClose={onClose}
      >
        {pendingTransferMember ? (
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>TRANSFER OWNERSHIP?</Text>
            <Text style={styles.confirmMessage}>
              Transferring ownership will transfer control of the teams name,
              banner, badge, etc.
            </Text>
            <Pressable
              style={styles.confirmTextButton}
              onPress={onCancelTransfer}
            >
              <Text style={styles.confirmTextButtonLabel}>No</Text>
            </Pressable>
            <SecondaryButton
              text="Yes"
              variant="green"
              onPress={() => onConfirmTransfer?.()}
            />
          </View>
        ) : (
          <>
            <View style={styles.searchBox}>
              <Feather name="search" size={18} color={Colors.light.subtext} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor={Colors.light.subtext}
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
              />
            </View>

            {filtered.map((member) => (
              <TeamMemberRow
                key={member.id}
                member={{ ...member, isAdmin: false }}
                trailing={
                  <Pressable
                    style={styles.crownButton}
                    onPress={() => onSelectMember(member)}
                    hitSlop={8}
                  >
                    <MaterialCommunityIcons
                      name="crown-outline"
                      size={16}
                      color="#D4A017"
                    />
                  </Pressable>
                }
              />
            ))}
          </>
        )}
      </BottomSheetWrapper>
    );
  },
);
