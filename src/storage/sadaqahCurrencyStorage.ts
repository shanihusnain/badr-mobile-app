import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_SADAQAH_CURRENCY_KEY = "@badr/default_sadaqah_currency";

/** Full dropdown option value string, e.g. "🇸🇦 SAR – Saudi Riyal (ر.س)" */
export async function getDefaultSadaqahCurrency(): Promise<string | null> {
  try {
    const value = await AsyncStorage.getItem(DEFAULT_SADAQAH_CURRENCY_KEY);
    return value?.trim() ? value : null;
  } catch {
    return null;
  }
}

export async function setDefaultSadaqahCurrency(
  currencyOptionValue: string,
): Promise<void> {
  await AsyncStorage.setItem(
    DEFAULT_SADAQAH_CURRENCY_KEY,
    currencyOptionValue,
  );
}
