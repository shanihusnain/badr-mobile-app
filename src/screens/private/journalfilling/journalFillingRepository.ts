import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/src/api";
import type { JournalEntry } from "./types";

const JOURNAL_ENTRIES_KEY = "journal_entries";
const DISMISS_DIALOG_KEY = "journal_dismiss_dialog_hidden";

type StoredJournalEntries = Record<string, JournalEntry>;

async function readStoredEntries(): Promise<StoredJournalEntries> {
  try {
    const raw = await AsyncStorage.getItem(JOURNAL_ENTRIES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredJournalEntries;
  } catch {
    return {};
  }
}

async function writeStoredEntries(entries: StoredJournalEntries): Promise<void> {
  await AsyncStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries));
}

export async function getJournalByDate(
  date: string,
): Promise<JournalEntry | null> {
  try {
    const response = await api.get<JournalEntry>(`/journal/${date}`);
    return response.data;
  } catch {
    const entries = await readStoredEntries();
    return entries[date] ?? null;
  }
}

export async function createJournal(
  entry: Omit<JournalEntry, "updatedAt">,
): Promise<JournalEntry> {
  const payload: JournalEntry = {
    ...entry,
    updatedAt: new Date().toISOString(),
  };

  try {
    const response = await api.post<JournalEntry>("/journal", payload);
    return response.data;
  } catch {
    const entries = await readStoredEntries();
    entries[payload.date] = payload;
    await writeStoredEntries(entries);
    return payload;
  }
}

export async function updateJournal(entry: JournalEntry): Promise<JournalEntry> {
  const payload: JournalEntry = {
    ...entry,
    updatedAt: new Date().toISOString(),
  };

  try {
    const response = await api.put<JournalEntry>(
      `/journal/${entry.date}`,
      payload,
    );
    return response.data;
  } catch {
    const entries = await readStoredEntries();
    entries[payload.date] = payload;
    await writeStoredEntries(entries);
    return payload;
  }
}

export async function getJournalCompletionByDates(
  dates: string[],
): Promise<Record<string, boolean>> {
  const storedEntries = await readStoredEntries();
  const completion: Record<string, boolean> = {};

  // Initialize from storage first (best for offline, and avoids flicker).
  dates.forEach((date) => {
    completion[date] = Boolean(storedEntries[date]);
  });

  // Then try API (best for real server data). Each date is independent,
  // so we catch per-date failures and keep the storage fallback.
  await Promise.all(
    dates.map(async (date) => {
      try {
        const response = await api.get<JournalEntry | null>(`/journal/${date}`);
        completion[date] = Boolean(response.data);
      } catch {
        completion[date] = completion[date] ?? false;
      }
    }),
  );

  return completion;
}

export async function getDismissDialogHidden(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(DISMISS_DIALOG_KEY);
    return value === "true";
  } catch {
    return false;
  }
}

export async function setDismissDialogHidden(hidden: boolean): Promise<void> {
  await AsyncStorage.setItem(DISMISS_DIALOG_KEY, hidden ? "true" : "false");
}
