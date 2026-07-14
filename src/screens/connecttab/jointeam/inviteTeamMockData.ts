import {
  DEFAULT_TEAM_BANNER,
  DEFAULT_TEAM_LOGO,
  EXTRA_TEAM_MEMBERS,
  type TeamMember,
  type TeamProfileData,
} from "@/src/screens/private/teamprofile/mockData";

export const DEFAULT_TEAM_ABOUT =
  "At Badr, we inspire each other to achieve our goals, striving together to grow in devotion to Allah with unity, support, and shared purpose.";

const INVITE_TEAM_ADMIN: TeamMember = {
  id: "layla",
  name: "Layla Najia",
  handle: "@LaylaN",
  avatarUri:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  isAdmin: true,
};

const INVITE_TEAM_MEMBER: TeamMember = EXTRA_TEAM_MEMBERS[0];

const JOINING_USER: TeamMember = {
  ...EXTRA_TEAM_MEMBERS[1],
  id: "me",
  isAdmin: false,
};

export function lookupTeamByInviteCode(code: string): TeamProfileData | null {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  return {
    id: "invite-team",
    name: "Badr's Team",
    bannerUri: DEFAULT_TEAM_BANNER,
    logoUri: DEFAULT_TEAM_LOGO,
    description: DEFAULT_TEAM_ABOUT,
    inviteCode: normalized,
    referralCode: "BADR-LAYLA",
    teamChatEnabled: true,
    members: [INVITE_TEAM_ADMIN, INVITE_TEAM_MEMBER],
  };
}

export function buildJoinedTeam(preview: TeamProfileData): TeamProfileData {
  const withoutDuplicate = preview.members.filter(
    (member) => member.id !== JOINING_USER.id,
  );

  return {
    ...preview,
    members: [...withoutDuplicate, JOINING_USER],
  };
}
