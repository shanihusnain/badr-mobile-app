/** Backend `consistency.badge` — comparison chip under the consistency %. */
export type ConsistencyBadge = {
  direction: "UP" | "DOWN" | "NEUTRAL" | (string & {});
  changePct: number;
  label: string;
};

export type ConsistencyBadgeInput =
  | ConsistencyBadge
  | string
  | null
  | undefined;

export function normalizeConsistencyBadge(
  badge: ConsistencyBadgeInput,
): ConsistencyBadge | null {
  if (badge == null) return null;

  if (typeof badge === "string") {
    const label = badge.trim();
    return label.length > 0
      ? { direction: "NEUTRAL", changePct: 0, label }
      : null;
  }

  const label = typeof badge.label === "string" ? badge.label.trim() : "";
  if (!label) return null;

  const rawPct = Number(badge.changePct);
  const changePct = Number.isFinite(rawPct) ? Math.abs(rawPct) : 0;

  let direction: ConsistencyBadge["direction"];
  if (changePct === 0) {
    direction = "NEUTRAL";
  } else if (badge.direction === "DOWN") {
    direction = "DOWN";
  } else if (badge.direction === "UP") {
    direction = "UP";
  } else {
    direction = "NEUTRAL";
  }

  return { direction, changePct, label };
}

/** Signed delta for UI (DOWN → negative, zero stays 0). Null when no comparison badge. */
export function consistencyBadgeToDeltaPercent(
  badge: ConsistencyBadge | null,
  hasComparison?: boolean,
): number | null {
  if (!badge) return null;
  if (hasComparison === false) return null;
  if (badge.changePct === 0 || badge.direction === "NEUTRAL") return 0;
  return badge.direction === "DOWN" ? -badge.changePct : badge.changePct;
}
