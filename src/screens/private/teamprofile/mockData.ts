export type TeamMember = {
  id: string;
  name: string;
  handle: string;
  avatarUri: string;
  isAdmin: boolean;
};

export type TeamProfileData = {
  id: string;
  name: string;
  bannerUri: string;
  logoUri: string;
  description: string;
  inviteCode: string;
  referralCode: string;
  teamChatEnabled: boolean;
  members: TeamMember[];
};

export const DEFAULT_TEAM_BANNER =
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800";

export const DEFAULT_TEAM_LOGO =
  "https://images.unsplash.com/photo-1585036156171-3841649478f8?w=200";

export const CURRENT_USER: TeamMember = {
  id: "me",
  name: "Layla Najia",
  handle: "@LaylaN",
  avatarUri:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  isAdmin: true,
};

/** Extra members used to demo transfer-ownership / remove-member flows. */
export const EXTRA_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "2",
    name: "Dawood Siddiqui",
    handle: "@Dawood123",
    avatarUri:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    isAdmin: false,
  },
  {
    id: "3",
    name: "Aimen Ijaz",
    handle: "@AimenIjaz",
    avatarUri:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    isAdmin: false,
  },
];

export function buildCreatedTeam(params: {
  name: string;
  bannerUri?: string | null;
  logoUri?: string | null;
  description?: string | null;
  role?: "admin" | "member";
}): TeamProfileData {
  const isMember = params.role === "member";

  const adminMember: TeamMember = {
    id: "layla",
    name: "Layla Najia",
    handle: "@LaylaN",
    avatarUri:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    isAdmin: true,
  };

  const members: TeamMember[] = isMember
    ? [
        adminMember,
        EXTRA_TEAM_MEMBERS[0],
        { ...EXTRA_TEAM_MEMBERS[1], id: "me", isAdmin: false },
      ]
    : [{ ...CURRENT_USER, isAdmin: true }, ...EXTRA_TEAM_MEMBERS];

  return {
    id: isMember ? "joined-team" : "new-team",
    name: params.name.trim() || "Badr's Team",
    bannerUri: params.bannerUri || DEFAULT_TEAM_BANNER,
    logoUri: params.logoUri || DEFAULT_TEAM_LOGO,
    description:
      params.description ??
      (isMember
        ? "At Badr, we inspire each other to achieve our goals, striving together to grow in devotion to Allah with unity, support, and shared purpose."
        : ""),
    inviteCode: "COMM-0A2687",
    referralCode: "BADR-LAYLA",
    teamChatEnabled: true,
    members,
  };
}
