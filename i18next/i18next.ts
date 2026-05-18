import { getLocales } from "expo-localization";
import { Storage } from "expo-sqlite/kv-store";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";
import en from "../src/translations/en.json";
import ar from "../src/translations/ar.json";

// ── Constants ──────────────────────────────────────────────────────────────────
export const STORAGE_KEY = "user_language";

export const SUPPORTED_LANGUAGES = ["en", "ar"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const DEFAULT_LANGUAGE: string = "en";
const FALLBACK_LANGUAGE: SupportedLanguage = "en";
const supported = SUPPORTED_LANGUAGES as unknown as string[];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  ar: "العربية",
};

// ── Resources ──────────────────────────────────────────────────────────────────
export const resources = {
  en: { translation: en },
  ar: { translation: ar },
} as const;

// ── resolveLanguage ────────────────────────────────────────────────────────────
// Priority: 1) persisted user preference  2) device language  3) default
function resolveLanguage(): string {
  // 1. Check for a stored user preference
  try {
    const stored = Storage.getItemSync(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.language && supported.includes(parsed.language)) {
        return parsed.language;
      }
    }
  } catch {
    /* first launch or corrupt data — continue */
  }

  // 2. Auto-detect from device
  if (DEFAULT_LANGUAGE === "device") {
    const deviceLng = getLocales()[0]?.languageCode;
    if (deviceLng && supported.includes(deviceLng)) {
      return deviceLng;
    }
    return FALLBACK_LANGUAGE;
  }

  return supported.includes(DEFAULT_LANGUAGE)
    ? DEFAULT_LANGUAGE
    : FALLBACK_LANGUAGE;
}

// ── RTL ────────────────────────────────────────────────────────────────────────
const resolvedLng = resolveLanguage();
const isRTL = resolvedLng === "ar";
I18nManager.allowRTL(isRTL);
I18nManager.forceRTL(isRTL);

// ── Init ───────────────────────────────────────────────────────────────────────
i18n.use(initReactI18next).init({
  resources,
  fallbackLng: FALLBACK_LANGUAGE,
  supportedLngs: supported,
  lng: resolveLanguage(),
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: "v4",
});

export default i18n;
