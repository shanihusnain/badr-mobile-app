import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const COUNTRIES_API_URL = "https://www.apicountries.com/countries";

export type ApiCountryCurrency = {
  code?: string;
  name?: string;
  symbol?: string;
};

export type ApiCountry = {
  name: string;
  flag?: string;
  alpha2Code?: string;
  alpha3Code?: string;
  currencies?: ApiCountryCurrency[];
};

export type CountryDropdownOption = {
  label: string;
  value: string;
  flag?: string;
  currencies: ApiCountryCurrency[];
};

export type CurrencyDropdownOption = {
  label: string;
  value: string;
  code: string;
};

function mapCountries(payload: unknown): CountryDropdownOption[] {
  if (!Array.isArray(payload)) return [];

  const mapped = payload
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const country = item as ApiCountry;
      const name = typeof country.name === "string" ? country.name.trim() : "";
      if (!name) return null;

      return {
        label: name,
        value: name,
        flag: typeof country.flag === "string" ? country.flag : undefined,
        currencies: Array.isArray(country.currencies) ? country.currencies : [],
      } satisfies CountryDropdownOption;
    })
    .filter((item): item is CountryDropdownOption => item != null);

  return mapped.sort((a, b) => a.label.localeCompare(b.label));
}

/** Same display shape as the previous hardcoded sadaqah currency options. */
export function formatCurrencyOptionValue(params: {
  flag?: string;
  code: string;
  name: string;
  symbol?: string;
}): string {
  const flag = params.flag ? `${params.flag} ` : "";
  const symbol = params.symbol ? ` (${params.symbol})` : "";
  return `${flag}${params.code} – ${params.name}${symbol}`;
}

/** Unique ISO currencies derived from the countries list (one entry per code). */
export function deriveCurrencyOptionsFromCountries(
  countries: CountryDropdownOption[] | undefined | null,
): CurrencyDropdownOption[] {
  if (!countries?.length) return [];

  const byCode = new Map<string, CurrencyDropdownOption>();
  for (const country of countries) {
    for (const currency of country.currencies) {
      const code = currency.code?.trim().toUpperCase();
      if (!code || !/^[A-Z]{3}$/.test(code)) continue;
      if (byCode.has(code)) continue;

      const name = currency.name?.trim() || code;
      const value = formatCurrencyOptionValue({
        flag: country.flag,
        code,
        name,
        symbol: currency.symbol,
      });
      byCode.set(code, { label: value, value, code });
    }
  }

  return Array.from(byCode.values()).sort((a, b) =>
    a.code.localeCompare(b.code),
  );
}

const getCountries = async (): Promise<CountryDropdownOption[]> => {
  const response = await axios.get(COUNTRIES_API_URL, {
    headers: { Accept: "application/json" },
    timeout: 20000,
  });
  return mapCountries(response.data);
};

export const countriesQueryKey = ["apicountries", "countries"] as const;

export const useGetCountries = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: countriesQueryKey,
    queryFn: getCountries,
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
};

export const useGetCurrencies = (options?: { enabled?: boolean }) => {
  const countriesQuery = useGetCountries(options);
  const currencies = useMemo(
    () => deriveCurrencyOptionsFromCountries(countriesQuery.data),
    [countriesQuery.data],
  );

  return {
    ...countriesQuery,
    data: currencies,
  };
};
