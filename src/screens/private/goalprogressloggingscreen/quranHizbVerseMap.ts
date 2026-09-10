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
    rangeLabel: "Al-Fatiha 1:1 – Al-Baqarah 2:74",
    totalAyahs: 81,
  },
  {
    id: "hizb-2",
    hizbName: "Hizb 2",
    rangeLabel: "Al-Baqarah 2:75 – Al-Baqarah 2:141",
    totalAyahs: 234,
  },
  {
    id: "hizb-3",
    hizbName: "Hizb 3",
    rangeLabel: "Al-Baqarah 2:142 – Al-Baqarah 2:252",
    totalAyahs: 234,
  },
  {
    id: "hizb-4",
    hizbName: "Hizb 4",
    rangeLabel: "Al-Baqarah 2:253 – Aal-Imran 3:14",
    totalAyahs: 233,
  },
];

export function getHizbDefinitions(): HizbDefinition[] {
  return HIZB_DEFINITIONS;
}

export function getHizbDefinition(hizbId: string): HizbDefinition | undefined {
  return HIZB_DEFINITIONS.find((hizb) => hizb.id === hizbId);
}

export function getHizbVerseCount(hizbId: string): number {
  return getHizbDefinition(hizbId)?.totalAyahs ?? 0;
}

export function getHizbDisplayName(hizbId: string): string {
  const hizb = getHizbDefinition(hizbId);
  if (!hizb) return hizbId;
  return `${hizb.hizbName} | ${hizb.rangeLabel}`;
}
