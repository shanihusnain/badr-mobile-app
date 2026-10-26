import AsyncStorage from "@react-native-async-storage/async-storage";

const DISMISS_DIALOG_KEY = "journal_dismiss_dialog_hidden";

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
