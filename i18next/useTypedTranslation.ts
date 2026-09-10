import { useTranslation } from "react-i18next";
import type en from "../src/translations/en.json";

// Recursively builds dot-notation keys from a nested object type
// e.g. { SetGoals: { title: string } } → "SetGoals.title"
type DotKeys<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends object
    ? DotKeys<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

export type TranslationKey = DotKeys<typeof en>;

/**
 * Typed wrapper around useTranslation.
 * Gives full autocomplete on all translation keys.
 *
 * Usage:
 *   const { t } = useTypedTranslation();
 *   t("SetGoals.Setyourperosnalizedgoals")  ← fully typed & autocompleted
 */
export const useTypedTranslation = () => {
  const { t, i18n } = useTranslation();
  return {
    t: (key: TranslationKey, options?: Record<string, unknown>) =>
      t(key, options),
    i18n,
    language: i18n.language,
  };
};
