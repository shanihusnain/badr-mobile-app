import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "quran.recitation.surahFrequencies";

/** In-memory cache so review labels stay correct within the session. */
const memoryCache = new Map<number, "daily" | "weekly">();

let hydratePromise: Promise<void> | null = null;

function normalizeFrequency(
  value: unknown,
): "daily" | "weekly" | null {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "weekly" || normalized === "week") return "weekly";
  if (normalized === "daily" || normalized === "day") return "daily";
  return null;
}

async function ensureHydrated(): Promise<void> {
  if (hydratePromise) return hydratePromise;
  hydratePromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, string>;
      for (const [id, freq] of Object.entries(parsed)) {
        const surahId = Number(id);
        const uiFreq = normalizeFrequency(freq);
        if (Number.isFinite(surahId) && surahId > 0 && uiFreq) {
          memoryCache.set(surahId, uiFreq);
        }
      }
    } catch {
      // Ignore corrupt cache; review can still infer from times / API.
    }
  })();
  return hydratePromise;
}

/** Call on app/sheet start so stored frequencies are available for review. */
export function hydrateQuranSurahFrequencies(): void {
  void ensureHydrated();
}

/**
 * Persist per-surah daily/weekly choices.
 * Needed because the quran-goals API only stores one goal-level frequency.
 */
export function rememberQuranSurahFrequencies(
  settings: Record<
    number | string,
    { frequency?: "daily" | "weekly" | string } | undefined
  >,
): void {
  for (const [id, setting] of Object.entries(settings)) {
    const surahId = Number(id);
    const uiFreq = normalizeFrequency(setting?.frequency);
    if (!Number.isFinite(surahId) || surahId <= 0 || !uiFreq) continue;
    memoryCache.set(surahId, uiFreq);
  }

  void (async () => {
    await ensureHydrated();
    const payload: Record<string, "daily" | "weekly"> = {};
    memoryCache.forEach((freq, id) => {
      payload[String(id)] = freq;
    });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Non-fatal — in-memory cache still helps the current session.
    }
  })();
}

/**
 * Resolve UI frequency for a surah.
 * UI caps: daily ≤ 5, weekly ≤ 6 — so times > 5 always means weekly.
 */
export function resolveQuranSurahFrequency(options: {
  surahId?: number | null;
  times?: number | null;
  itemFrequency?: string | null;
  goalFrequency?: string | null;
}): "daily" | "weekly" {
  const times = Number(options.times ?? 0);
  if (Number.isFinite(times) && times > 5) return "weekly";

  const surahId = Number(options.surahId ?? 0);
  if (Number.isFinite(surahId) && surahId > 0) {
    const remembered = memoryCache.get(surahId);
    if (remembered) return remembered;
  }

  return (
    normalizeFrequency(options.itemFrequency) ??
    normalizeFrequency(options.goalFrequency) ??
    "daily"
  );
}
