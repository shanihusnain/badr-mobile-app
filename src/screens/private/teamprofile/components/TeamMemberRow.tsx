import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { TeamMember } from "../mockData";

type TeamMemberRowProps = {
  member: TeamMember;
  trailing?: ReactNode;
};

export function TeamMemberRow({ member, trailing }: TeamMemberRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.avatarWrap}>
        <Image
          source={{ uri: member.avatarUri }}
          style={styles.avatar}
          contentFit="cover"
        />
        {member.isAdmin ? (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.meta}>
        <Text style={styles.name}>{member.name}</Text>
        <Text style={styles.handle}>{member.handle}</Text>
      </View>

      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.darkgrey,
  },
  adminBadge: {
    position: "absolute",
    left: -2,
    bottom: -4,
    backgroundColor: Colors.light.green,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  adminBadgeText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 8,
    fontWeight: "600",
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
  },
  handle: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.regular,
    fontSize: 12,
    marginTop: 2,
  },
});
