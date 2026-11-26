import { useCallback, useEffect } from "react";
import { useSharedValue } from "react-native-reanimated";
import { useUpdateSettings } from "@/src/api/mutations/useUpdateSettings";
import {
  useGetSettings,
  type AppSettings,
} from "@/src/api/queries/useGetSettings";

type BooleanSettingKey = {
  [K in keyof AppSettings]: AppSettings[K] extends boolean ? K : never;
}[keyof AppSettings];

/**
 * SharedValue toggle bound to GET/PATCH api/settings.
 * Optimistically flips UI, rolls back on PATCH failure.
 */
export function useSettingsBoolean(
  key: BooleanSettingKey,
  defaultValue = false,
) {
  const { data, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const value = useSharedValue(defaultValue);

  useEffect(() => {
    if (!data) return;
    const next = data[key];
    if (typeof next === "boolean") {
      value.value = next;
    }
  }, [data, key, value]);

  const toggle = useCallback(() => {
    const next = !value.value;
    value.value = next;
    updateSettings.mutate(
      { [key]: next } as Partial<AppSettings>,
      {
        onError: () => {
          value.value = !next;
        },
      },
    );
  }, [key, updateSettings, value]);

  return {
    value,
    toggle,
    isLoading,
    isSaving: updateSettings.isPending,
    settings: data,
  };
}
