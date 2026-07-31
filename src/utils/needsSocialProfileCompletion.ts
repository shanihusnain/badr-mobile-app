/**
 * Social login may return isNewUser=false even when profile prefs are incomplete
 * (e.g. soft-deleted / re-linked accounts). Route those users to createaccount.
 *
 * Backend currently returns calendarView / weekendDays on the login `data` object
 * (siblings of `user`), not always nested under `user`.
 */
export type SocialProfileUser = {
  country?: string | null;
  dateOfBirth?: string | null;
  preferredDateView?: string | null;
  calendarView?: string | null;
  weekendDays?: string | string[] | null;
};

export const mergeSocialLoginUser = <T extends Record<string, unknown>>(
  user: T,
  prefs?: {
    calendarView?: string | null;
    preferredDateView?: string | null;
    weekendDays?: string | string[] | null;
  },
) => {
  const calendarView =
    prefs?.calendarView ?? (user as SocialProfileUser).calendarView ?? null;
  const preferredDateView =
    prefs?.preferredDateView ??
    prefs?.calendarView ??
    (user as SocialProfileUser).preferredDateView ??
    (user as SocialProfileUser).calendarView ??
    null;
  const weekendDays =
    prefs?.weekendDays ?? (user as SocialProfileUser).weekendDays ?? null;

  return {
    ...user,
    calendarView,
    preferredDateView,
    weekendDays,
  };
};

/** Normalize weekend days from API / route params into a string[]. */
export const normalizeWeekendDays = (
  value?: string | string[] | null,
): string[] | null => {
  if (value == null) return null;

  if (Array.isArray(value)) {
    const days = value.map((d) => String(d).trim().toUpperCase()).filter(Boolean);
    return days.length > 0 ? days : null;
  }

  const raw = String(value).trim();
  if (!raw) return null;

  // Already a form label
  if (raw === "Friday & Saturday" || raw === "Saturday & Sunday") {
    return raw === "Friday & Saturday"
      ? ["FRIDAY", "SATURDAY"]
      : ["SATURDAY", "SUNDAY"];
  }

  if (raw === "FRIDAY_SATURDAY") return ["FRIDAY", "SATURDAY"];
  if (raw === "SATURDAY_SUNDAY") return ["SATURDAY", "SUNDAY"];

  // JSON array string from route params
  if (raw.startsWith("[")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return normalizeWeekendDays(parsed);
      }
    } catch {
      // fall through
    }
  }

  // Comma / amp separated: "FRIDAY,SATURDAY" or "FRIDAY, SATURDAY"
  const parts = raw
    .split(/[,&|]/)
    .map((p) => p.trim().toUpperCase())
    .filter(Boolean);
  return parts.length > 0 ? parts : null;
};

export const needsSocialProfileCompletion = (
  user: SocialProfileUser | null | undefined,
  _isNewUser?: boolean,
) => {
  // Prefer field completeness over isNewUser. Returning users can have
  // isNewUser=false with missing prefs; new users can already have prefs set.
  if (!user) return true;

  const hasCountry = !!user.country?.trim();
  const hasDob = !!user.dateOfBirth;
  const hasDateView = !!(user.preferredDateView || user.calendarView);
  const weekend = normalizeWeekendDays(user.weekendDays);
  const hasWeekend = !!weekend && weekend.length > 0;

  return !(hasCountry && hasDob && hasDateView && hasWeekend);
};
