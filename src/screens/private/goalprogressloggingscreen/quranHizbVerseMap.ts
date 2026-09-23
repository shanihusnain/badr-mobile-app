import {
  getHizbRangeLabel,
  getHizbVerseCountFromMap,
  parseHizbNumber,
} from "./quranJuzVerseMap";

export type HizbDefinition = {
  id: string;
  hizbName: string;
  rangeLabel: string;
  totalAyahs: number;
};

const HIZB_DEFINITIONS: HizbDefinition[] = [
  {
    id: "hizb-1",
    hizbName: "Hizb 1",
    rangeLabel: "Al-Fatiha 1:1 - Al-Baqarah 2:74",
    totalAyahs: 81,
  },
  {
    id: "hizb-2",
    hizbName: "Hizb 2",
    rangeLabel: "Al-Baqarah 2:75 - Al-Baqarah 2:141",
    totalAyahs: 234,
  },
  {
    id: "hizb-3",
    hizbName: "Hizb 3",
    rangeLabel: "Al-Baqarah 2:142 - Al-Baqarah 2:252",
    totalAyahs: 234,
  },
  {
    id: "hizb-4",
    hizbName: "Hizb 4",
    rangeLabel: "Al-Baqarah 2:253 - Aal-Imran 3:14",
    totalAyahs: 233,
  },
];

export function getHizbDefinitions(): HizbDefinition[] {
  return HIZB_DEFINITIONS;
}

export function getHizbDefinition(hizbId: string): HizbDefinition | undefined {
  const direct = HIZB_DEFINITIONS.find((hizb) => hizb.id === hizbId);
  if (direct) return direct;
  const n = parseHizbNumber(hizbId);
  return HIZB_DEFINITIONS.find((hizb) => hizb.id === `hizb-${n}`);
}

export function getHizbVerseCount(hizbId: string): number {
  const fromDefinitions = getHizbDefinition(hizbId)?.totalAyahs;
  if (fromDefinitions && fromDefinitions > 0) return fromDefinitions;
  return getHizbVerseCountFromMap(hizbId) || 0;
}

export function resolveHizbRangeLabel(hizbId: string | number): string {
  const id = String(hizbId);
  const fromDef = getHizbDefinition(id)?.rangeLabel?.trim();
  if (fromDef) return fromDef;
  return getHizbRangeLabel(hizbId);
}

export function getHizbDisplayName(hizbId: string): string {
  const n = parseHizbNumber(hizbId);
  const hizb = getHizbDefinition(hizbId);
  const hizbName = hizb?.hizbName ?? `Hizb ${n}`;
  const rangeLabel = resolveHizbRangeLabel(hizbId);
  return rangeLabel ? `${hizbName} | ${rangeLabel}` : hizbName;
}
