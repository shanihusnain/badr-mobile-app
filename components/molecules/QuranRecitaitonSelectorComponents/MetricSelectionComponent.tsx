import { fonts } from "@/assets/fonts";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { AntDesign } from "@expo/vector-icons";
import { Fragment, useState, useEffect } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { opacity } from "react-native-reanimated/lib/typescript/Colors";
import { useTranslation } from "react-i18next";

export const MetricSelectionComponent = ({
  item,
  handleMetricPress,
  selectedMetric,
  onMetricChange,
  variant,
}: {
  item: {
    id: number;
    name: "surah" | "juz" | "completion" | "hizb";
    title: string;
  };
  handleMetricPress: () => void;
  selectedMetric: "surah" | "juz" | "completion" | "hizb" | undefined;
  onMetricChange?: (payload: { metric: string; value: any }) => void;
  variant?: "memorization" | "others";
}) => {
  const { t } = useTranslation();
  const isMemorizationSurah =
    variant === "memorization" && item.name === "surah";
  const [selectedSurahs, setSelectedSurahs] = useState<number[]>([]);
  const [selectedHizbs, setSelectedHizbs] = useState<number[]>([]);
  // NOTE: hizb should be single-select. We'll store a single selected id (or undefined)
  const [selectedHizb, setSelectedHizb] = useState<number | undefined>(
    undefined,
  );
  const surahData = [
    { id: 1, surahName: "al-baqarah", surahTitle: "Al-Baqarah" },
    { id: 2, surahName: "al-imran", surahTitle: "Al-Imran" },
    { id: 3, surahName: "an-nisa", surahTitle: "An-Nisa" },
    { id: 4, surahName: "al-maidah", surahTitle: "Al-Maidah" },
  ];
  const hizbData = [
    {
      id: 1,
      hizbName: "Hizb 1 | Al-Fatiha 1:1 – Al-Baqarah 2:74",
      verses: "(81 verses)",
    },
  ];

  const toggleSurah = (id: number) => {
    setSelectedSurahs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const [surahSettings, setSurahSettings] = useState<
    Record<number, { frequency: "daily" | "weekly"; times: number | undefined }>
  >({});
  const [juzStart, setJuzStart] = useState<number>(0);
  const [juzEnd, setJuzEnd] = useState<number>(0);
  const [juzEndText, setJuzEndText] = useState<string>("");
  const [focusedInputs, setFocusedInputs] = useState<Record<string, boolean>>(
    {},
  );
  const [quranCompletion, setQuranCompletion] = useState<number>(0);
  const setInputFocused = (key: string, value: boolean) => {
    setFocusedInputs((prev) => ({ ...prev, [key]: value }));
  };
  console.log("the input that is focused now is ", focusedInputs);
  useEffect(() => {
    // keep text input synced when juzEnd changes programmatically
    setJuzEndText(juzEnd !== undefined ? String(juzEnd) : "");

    if (juzEnd < juzStart) {
      setJuzEnd(juzStart);
    }
  }, [juzEnd]);
  console.log("the surah settings times are as follow", surahSettings);

  const ensureSetting = (id: number) => {
    setSurahSettings((prev) => {
      if (prev[id]) return prev;
      return { ...prev, [id]: { frequency: "daily", times: 1 } };
    });
  };

  const updateSurahSetting = (
    id: number,
    changes: Partial<{
      frequency: "daily" | "weekly";
      times: number | undefined;
    }>,
  ) => {
    setSurahSettings((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { frequency: "daily", times: 1 }), ...changes },
    }));
  };

  // remove hizb settings and make hizb single-select
  const toggleHizb = (id: number) => {
    setSelectedHizb((prev) => (prev === id ? undefined : id));
    // keep the legacy array in sync if other parts use it (optional)
    setSelectedHizbs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [id],
    );
  };
  const deleteSurah = (id: number) => {
    setSelectedSurahs((prev) => prev.filter((x) => x !== id));
    setSurahSettings((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };
  const enforceJuzEnd = () => {
    // when user finishes editing end field, parse and enforce constraints
    if (juzEndText === "") {
      setJuzEnd(0);
      return;
    }
    const n = parseInt(juzEndText, 10);
    if (Number.isNaN(n)) {
      setJuzEnd(0);
      return;
    }
    let clamped = Math.min(Math.max(1, n), 30);
    if (juzStart !== undefined && clamped < juzStart) clamped = juzStart;
    setJuzEnd(clamped);
  };
  // derive display values so totals can update live while typing
  const displayJuzStart = juzStart > 0 ? juzStart : undefined;
  const displayJuzEnd = focusedInputs["juz-end"]
    ? ((): number | undefined => {
        const parsed = parseInt(juzEndText || "", 10);
        if (Number.isNaN(parsed)) return undefined;
        return Math.min(Math.max(1, parsed), 30);
      })()
    : juzEnd > 0
      ? juzEnd
      : undefined;

  // Notify parent when relevant metric state changes
  useEffect(() => {
    if (!onMetricChange) return;
    if (item.name === "surah") {
      onMetricChange({
        metric: "surah",
        value: isMemorizationSurah
          ? { selectedSurahs }
          : { selectedSurahs, surahSettings },
      });
    }
    if (item.name === "juz") {
      onMetricChange({
        metric: "juz",
        value: { start: displayJuzStart ?? 0, end: displayJuzEnd ?? 0 },
      });
    }
    if (item.name === "completion") {
      onMetricChange({ metric: "completion", value: quranCompletion });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedSurahs,
    surahSettings,
    displayJuzStart,
    displayJuzEnd,
    quranCompletion,
  ]);
  return (
    <Fragment key={item?.id}>
      <Pressable
        key={item.id}
        onPress={handleMetricPress}
        style={styles.metrixWrapper}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.metrixName}>{item.title}</Text>
          {item.name === selectedMetric && (
            <MaterialCommunityIcons
              name="chevron-up"
              size={24}
              color={Colors.light.white}
            />
          )}
        </View>

        {selectedMetric === item.name ? (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <FontAwesome name="check" size={18} color={Colors.light.green} />
          </View>
        ) : (
          <AntDesign name="plus-circle" color={Colors.light.white} size={20} />
        )}
      </Pressable>
      <TopSpace top={20} />

      {item.name === "surah" && selectedMetric === item.name && (
        <FlatList
          data={surahData}
          keyExtractor={(s) => s.id.toString()}
          renderItem={({ item: s }) => {
            const checked = selectedSurahs.includes(s.id);
            const setting = surahSettings[s.id] || {
              frequency: "daily",
              times: 1,
            };
            const isDaily = setting.frequency === "daily";
            const maxTimes = isDaily ? 5 : 6;
            const timesValue = setting.times ?? 0;
            const multiplier = isDaily ? 28 : 4;
            const total = (timesValue || 0) * multiplier;

            return (
              <View
                style={{
                  paddingVertical: 8,
                  paddingRight: 20,
                }}
              >
                <Pressable
                  onPress={() => {
                    toggleSurah(s.id);
                    if (!selectedSurahs.includes(s.id) && !isMemorizationSurah) {
                      ensureSetting(s.id);
                    }
                  }}
                  style={[styles.metrixWrapper]}
                >
                  <View style={styles.surahItemWrapper}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          opacity: checked ? 1 : 0.25,
                        },
                      ]}
                    >
                      {checked && (
                        <FontAwesome
                          name="check"
                          size={14}
                          color={Colors.light.white}
                        />
                      )}
                    </View>
                    <Text
                      style={{
                        color: Colors.light.white,
                        fontSize: 14,
                        fontFamily: fonts.primary.regular,
                        flex: 1,
                      }}
                    >
                      {s.surahTitle}
                    </Text>
                  </View>
                  {checked && !isMemorizationSurah && (
                    <MaterialCommunityIcons
                      name="chevron-up"
                      size={24}
                      color={Colors.light.white}
                    />
                  )}
                </Pressable>

                {checked && !isMemorizationSurah && (
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingTop: 12,
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      <Pressable
                        onPress={() =>
                          updateSurahSetting(s.id, { frequency: "daily" })
                        }
                        style={[
                          styles.radio,
                          isDaily ? styles.radioChecked : undefined,
                        ]}
                      >
                        {isDaily && <View style={styles.radioInner} />}
                      </Pressable>
                      <Text style={styles.radioLabel}>{t("monthlyGoalPlanner.quranMetrics.daily")}</Text>

                      <Pressable
                        onPress={() =>
                          updateSurahSetting(s.id, { frequency: "weekly" })
                        }
                        style={[
                          styles.radio,
                          !isDaily ? styles.radioChecked : undefined,
                        ]}
                      >
                        {!isDaily && <View style={styles.radioInner} />}
                      </Pressable>
                      <Text style={styles.radioLabel}>{t("monthlyGoalPlanner.quranMetrics.weekly")}</Text>
                    </View>

                    <View style={{ height: 12 }} />
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 40,
                      }}
                    >
                      <Text
                        style={{
                          color: Colors.light.white,
                          marginBottom: 6,
                          opacity: 0.8,
                        }}
                      >
                        {t("monthlyGoalPlanner.quranMetrics.enterUpToTimes", {
                          max: maxTimes,
                          frequency: isDaily
                            ? t("monthlyGoalPlanner.quranMetrics.daily")
                            : t("monthlyGoalPlanner.quranMetrics.weekly"),
                        })}
                      </Text>
                      <Pressable
                        onPress={() => {
                          console.log("deleting surah with id", s.id);
                          deleteSurah(s.id);
                        }}
                      >
                        <FontAwesome
                          name="trash-o"
                          size={24}
                          color={
                            isDaily ? Colors.light.white : Colors.light.grey
                          }
                        />
                      </Pressable>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <TextInput
                        value={String(timesValue)}
                        onChangeText={(v) => {
                          const n = parseInt(v || "0", 10);
                          const clamped = Number.isNaN(n)
                            ? undefined
                            : Math.min(Math.max(0, n), maxTimes);
                          updateSurahSetting(s.id, { times: clamped });
                        }}
                        keyboardType="numeric"
                        onFocus={() => setInputFocused(`surah-${s.id}`, true)}
                        onBlur={() => setInputFocused(`surah-${s.id}`, false)}
                        style={[
                          styles.timesInput,
                          {
                            backgroundColor: focusedInputs[`surah-${s.id}`]
                              ? Colors.light.green
                              : "transparent",
                            borderColor: focusedInputs[`surah-${s.id}`]
                              ? Colors.light.green
                              : Colors.light.white,
                          },
                        ]}
                        placeholder="0"
                      />
                      <Text
                        style={{ color: Colors.light.white }}
                      >{t("monthlyGoalPlanner.quranMetrics.timesFrequency", {
                        frequency: isDaily
                          ? t("monthlyGoalPlanner.quranMetrics.daily")
                          : t("monthlyGoalPlanner.quranMetrics.weekly"),
                      })}</Text>
                    </View>

                    <View style={{ height: 12 }} />

                    <View>
                      <Text
                        style={{ color: Colors.light.white }}
                      >{t("monthlyGoalPlanner.quranMetrics.recitationsCount", { count: timesValue || 0 })}</Text>
                      <Text
                        style={{ color: Colors.light.white }}
                      >{t("monthlyGoalPlanner.quranMetrics.recitationsFormula", {
                        times: timesValue || 0,
                        multiplier,
                        total,
                      })}</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
      {item.name === "juz" && selectedMetric === item.name && (
        <View style={{}}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                width: "80%",
                color: Colors.light.white,
                fontFamily: fonts.primary.regular,
                fontWeight: "400",
                fontSize: 12,
                opacity: 0.8,
              }}
            >
              {t("monthlyGoalPlanner.quranMetrics.juzRangeHint")}
            </Text>
            <Pressable>
              <FontAwesome
                name="trash-o"
                size={24}
                color={Colors.light.white}
              />
            </Pressable>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 12,
              alignSelf: "center",
            }}
          >
            <Text
              style={{
                fontWeight: "400",
                fontSize: 14,
                fontFamily: fonts.primary.regular,
                color: Colors.light.white,
              }}
            >
              {t("monthlyGoalPlanner.quranMetrics.fromJuz")}
            </Text>
            <TextInput
              value={juzStart !== undefined ? String(juzStart) : ""}
              onChangeText={(v) => {
                // allow clearing the field
                if (v === "") {
                  setJuzStart(0);
                  return;
                }
                // keep digits only
                const digits = v.replace(/[^0-9]/g, "");
                const n = parseInt(digits, 10);
                if (Number.isNaN(n)) {
                  setJuzEnd(0);
                  return;
                }
                // clamp to valid juz range 1-30
                const clamped = Math.min(Math.max(1, n), 30);
                setJuzStart(clamped);
                // if end is set and less than new start, bump end to match start
                setJuzEnd((prev) =>
                  prev === undefined ? prev : Math.max(prev, clamped),
                );
              }}
              keyboardType="numeric"
              onFocus={() => setInputFocused("juz-start", true)}
              onBlur={() => setInputFocused("juz-start", false)}
              style={[
                styles.timesInput,
                {
                  backgroundColor: focusedInputs["juz-start"]
                    ? Colors.light.green
                    : "transparent",
                  borderColor: focusedInputs["juz-start"]
                    ? Colors.light.green
                    : Colors.light.white,
                  width: 40,
                },
              ]}
              placeholder="1"
            />
            <Text
              style={{
                fontWeight: "400",
                fontSize: 14,
                fontFamily: fonts.primary.regular,
                color: Colors.light.white,
              }}
            >
              {t("monthlyGoalPlanner.quranMetrics.toJuz")}
            </Text>
            <TextInput
              value={juzEndText}
              onChangeText={(v) => {
                // allow free typing in text state; sanitize digits
                const digits = v.replace(/[^0-9]/g, "");
                setJuzEndText(digits);
              }}
              keyboardType="numeric"
              onFocus={() => setInputFocused("juz-end", true)}
              onBlur={() => {
                setInputFocused("juz-end", false);
                enforceJuzEnd();
              }}
              onEndEditing={() => enforceJuzEnd()}
              onSubmitEditing={() => enforceJuzEnd()}
              style={[
                styles.timesInput,
                {
                  backgroundColor: focusedInputs["juz-end"]
                    ? Colors.light.green
                    : "transparent",
                  borderColor: focusedInputs["juz-end"]
                    ? Colors.light.green
                    : Colors.light.white,
                  width: 40,
                },
              ]}
              placeholder="1"
            />
          </View>
          <TopSpace top={12} />
          <Text
            style={{
              color: Colors.light.white,
              alignSelf: "center",
              opacity: 0.8,
              fontFamily: fonts.primary.regular,
              fontSize: 12,
            }}
          >
            {(() => {
              if (displayJuzStart === undefined || displayJuzEnd === undefined)
                return t("monthlyGoalPlanner.quranMetrics.totalJuz", { total: 0 });
              const total = Math.max(0, displayJuzEnd - displayJuzStart + 1);
              return t("monthlyGoalPlanner.quranMetrics.totalJuz", { total });
            })()}
          </Text>
          <TopSpace top={16} />
        </View>
      )}

      {item.name === "completion" && selectedMetric === item.name && (
        <View style={{}}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                width: "80%",
                color: Colors.light.white,
                fontFamily: fonts.primary.regular,
                fontWeight: "400",
                fontSize: 12,
                opacity: 0.8,
              }}
            >
              {t("monthlyGoalPlanner.quranMetrics.enterUpToCompletions")}
            </Text>
            <Pressable>
              <FontAwesome
                name="trash-o"
                size={24}
                color={Colors.light.white}
              />
            </Pressable>
          </View>
          <TopSpace top={16} />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              alignSelf: "center",
            }}
          >
            <TextInput
              value={String(quranCompletion)}
              onChangeText={(v) => {
                const n = parseInt(v || "0", 10);
                const clamped = Number.isNaN(n)
                  ? 0
                  : Math.max(0, Math.min(28, n));
                setQuranCompletion(clamped);
              }}
              keyboardType="numeric"
              onFocus={() => setInputFocused(`completion`, true)}
              onBlur={() => setInputFocused(`completion`, false)}
              style={[
                styles.timesInput,
                {
                  backgroundColor: focusedInputs[`completion`]
                    ? Colors.light.green
                    : "transparent",
                  borderColor: focusedInputs[`completion`]
                    ? Colors.light.green
                    : Colors.light.white,
                  textAlign: "center",
                },
              ]}
              placeholder="0"
            />
            <Text
              style={{
                fontWeight: "400",
                fontSize: 14,
                fontFamily: fonts.primary.regular,
                color: Colors.light.white,
              }}
            >
              {t("monthlyGoalPlanner.quranMetrics.fullCompletions")}
            </Text>
          </View>
          <TopSpace top={16} />
        </View>
      )}
      {item.name === "hizb" && selectedMetric === item.name && (
        <FlatList
          data={hizbData}
          keyExtractor={(s) => s.id.toString()}
          renderItem={({ item }) => {
            const checked = selectedHizb === item.id;

            return (
              <Pressable
                onPress={() => toggleHizb(item.id)}
                style={{ paddingVertical: 8, paddingRight: 20 }}
              >
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        opacity: checked ? 1 : 0.25,
                        backgroundColor: checked
                          ? Colors.light.green
                          : "transparent",
                        borderWidth: checked ? 0 : 1,
                      },
                    ]}
                  >
                    {checked && (
                      <FontAwesome
                        name="check"
                        size={14}
                        color={Colors.light.white}
                      />
                    )}
                  </View>
                  <View
                    style={[
                      styles.surahItemWrapper,
                      { flexDirection: "column", alignItems: "flex-start" },
                    ]}
                  >
                    <Text
                      style={{
                        color: Colors.light.white,
                        fontSize: 14,
                        fontFamily: fonts.primary.regular,
                        flex: 1,
                        fontWeight: "400",
                      }}
                    >
                      {item.hizbName}
                    </Text>
                    <Text
                      style={{
                        color: Colors.light.white,
                        fontSize: 14,
                        fontFamily: fonts.primary.semiBold,
                        fontWeight: "600",
                      }}
                    >
                      {item.verses}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </Fragment>
  );
};
const styles = StyleSheet.create({
  checkbox: {
    height: 20,
    width: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.light.white,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.25,
  },
  metrixName: {
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
    fontSize: 16,
    color: Colors.light.white,
  },
  metrixWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  surahItemWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radio: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.light.grey,
    alignItems: "center",
    justifyContent: "center",
  },
  radioChecked: {
    // borderColor: Colors.light.green,
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.green,
  },
  radioLabel: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    marginRight: 8,
  },
  timesInput: {
    height: 40,
    width: 64,
    borderWidth: 1,
    borderColor: Colors.light.white,
    borderRadius: 6,
    paddingHorizontal: 8,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
});
