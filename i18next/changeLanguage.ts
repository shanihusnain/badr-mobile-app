import { Storage } from "expo-sqlite/kv-store";
import * as Updates from "expo-updates";
import { DevSettings, I18nManager } from "react-native";
import i18n from "./i18next";
import { STORAGE_KEY, type SupportedLanguage } from "./i18next";

/**
 * Reloads the app in a way that works in both dev and production.
 * - Dev builds: DevSettings.reload()
 * - Production builds: Updates.reloadAsync()
 */
const reloadApp = async () => {
  if (__DEV__) {
    DevSettings.reload();
  } else {
    await Updates.reloadAsync();
  }
};

/**
 * Switches the app language at runtime and persists the choice.
 * If the layout direction changes (LTR ↔ RTL), the app reloads automatically
 * so the new direction takes effect.
 */
export const changeLanguage = async (
  lang: SupportedLanguage,
): Promise<void> => {
  const isRTL = lang === "ar";
  const directionChanged = I18nManager.isRTL !== isRTL;

  // 1. Persist the selection
  await Storage.setItemAsync(STORAGE_KEY, JSON.stringify({ language: lang }));

  // 2. Switch i18n language (updates all useTranslation hooks immediately)
  await i18n.changeLanguage(lang);

  // 3. Update RTL layout direction
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);

  // 4. Reload so the new layout direction actually takes effect
  if (directionChanged) {
    await reloadApp();
  }
};
