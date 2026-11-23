/**
 * Week-1 footer always targets 3 display lines. Break at clause punctuation
 * first, then at natural joins (to / and / with / ,) — not raw midpoints.
 * e.g. "...3 days;" / "prepare your heart" / "to fast."
 */
function findNaturalSplit(text: string): [string, string] {
  const mid = Math.ceil(text.length / 2);
  const windowStart = Math.max(0, Math.floor(text.length * 0.2));
  const windowEnd = Math.min(text.length - 1, Math.ceil(text.length * 0.9));

  // Prefer conjunction / preposition starts — keeps lists like
  // "filled with light, mercy," + "and reward." (not cutting before mercy).
  const preferredBefore: Array<{ token: string; bias: number }> = [
    { token: " and ", bias: -8 },
    { token: " to ", bias: -4 },
    { token: " with ", bias: -2 },
    { token: " for ", bias: -2 },
    { token: " that ", bias: -2 },
  ];

  let best = -1;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const { token, bias } of preferredBefore) {
    let from = 0;
    while (from < text.length) {
      const idx = text.indexOf(token, from);
      if (idx < 0) break;
      if (idx >= windowStart && idx <= windowEnd) {
        const score = Math.abs(idx - mid) + bias;
        if (score < bestScore) {
          bestScore = score;
          best = idx;
        }
      }
      from = idx + token.length;
    }
  }

  if (best > 0) {
    return [text.slice(0, best).trim(), text.slice(best).trim()];
  }

  // Fallback: comma (keep comma on previous line).
  let from = 0;
  while (from < text.length) {
    const idx = text.indexOf(", ", from);
    if (idx < 0) break;
    if (idx >= windowStart && idx <= windowEnd) {
      const score = Math.abs(idx - mid);
      if (score < bestScore) {
        bestScore = score;
        best = idx + 1;
      }
    }
    from = idx + 2;
  }

  if (best > 0) {
    return [text.slice(0, best).trim(), text.slice(best).trim()];
  }

  let splitAt = text.lastIndexOf(" ", mid);
  if (splitAt <= 0) splitAt = text.indexOf(" ", mid);
  if (splitAt > 0) {
    return [text.slice(0, splitAt).trim(), text.slice(splitAt).trim()];
  }
  return [text, ""];
}

function splitIntoThreeLines(line1: string, rest: string): string {
  const words = rest.split(/\s+/).filter(Boolean);
  // Short remainder → split the first clause so "mercy" stays with "light,"
  // e.g. "Your fasts are filled" / "with light, mercy," / "and reward."
  if (words.length <= 2) {
    const [a, b] = findNaturalSplit(line1);
    if (b) return `${a}\n${b}\n${rest}`;
    if (words.length >= 2) {
      return `${line1}\n${words.slice(0, -1).join(" ")}\n${words[words.length - 1]}`;
    }
    return `${line1}\n${rest}`;
  }
  const [line2, line3] = findNaturalSplit(rest);
  if (line3) return `${line1}\n${line2}\n${line3}`;
  return `${line1}\n${words.slice(0, -1).join(" ")}\n${words[words.length - 1]}`;
}

/** Display-only: always 3 lines for week-1 footer, with natural join points. */
export function formatMotivationalQuoteForThreeLines(quote: string): string {
  const trimmed = quote.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes("\n")) {
    const existing = trimmed
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (existing.length >= 3) return existing.slice(0, 3).join("\n");
    if (existing.length === 2) {
      return splitIntoThreeLines(existing[0], existing[1]);
    }
  }

  const clauseMatch = trimmed.match(/^(.+?[;:])\s*(.+)$/);
  if (clauseMatch) {
    return splitIntoThreeLines(clauseMatch[1].trim(), clauseMatch[2].trim());
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 3) return trimmed;

  // Prefer natural joins (and / with / that / comma) over raw word-thirds
  // so medium-length quotes don't collapse to 2 wrapped lines on device.
  const [line1, rest] = findNaturalSplit(trimmed);
  if (rest) return splitIntoThreeLines(line1, rest);

  const third = Math.ceil(words.length / 3);
  return [
    words.slice(0, third).join(" "),
    words.slice(third, third * 2).join(" "),
    words.slice(third * 2).join(" "),
  ]
    .filter(Boolean)
    .join("\n");
}
