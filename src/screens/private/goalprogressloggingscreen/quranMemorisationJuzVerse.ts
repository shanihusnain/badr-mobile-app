import {
  getJuzEndLabel,
  getJuzRangeLabel,
  getJuzVerseCountFromMap,
  getJuzVerseMetadata,
  type JuzVerseMetadata,
} from "./quranJuzVerseMap";

export type { JuzVerseMetadata };

export type JuzDefinition = {
  id: string;
  juzNumber: number;
  juzName: string;
  endLabel: string;
  rangeLabel: string;
  totalAyahs: number;
  metadata: JuzVerseMetadata;
};

const SELECTED_JUZ_NUMBERS = [1, 2, 3, 4] as const;

function buildJuzDefinition(juzNumber: number): JuzDefinition {
  const id = `juz-${juzNumber}`;
  const metadata = getJuzVerseMetadata(juzNumber);
  return {
    id,
    juzNumber,
    juzName: `Juz ${juzNumber}`,
    endLabel: getJuzEndLabel(juzNumber),
    rangeLabel: getJuzRangeLabel(juzNumber),
    totalAyahs: getJuzVerseCountFromMap(juzNumber),
    metadata,
  };
}

const JUZ_DEFINITIONS: JuzDefinition[] = SELECTED_JUZ_NUMBERS.map((juzNumber) =>
  buildJuzDefinition(juzNumber),
);

export function getJuzDefinitions(): JuzDefinition[] {
  return JUZ_DEFINITIONS;
}

export function getJuzDefinition(juzId: string): JuzDefinition | undefined {
  return JUZ_DEFINITIONS.find((juz) => juz.id === juzId);
}

export function getJuzVerseCount(juzId: string): number {
  return getJuzDefinition(juzId)?.totalAyahs ?? 0;
}

export function getJuzNumberFromId(juzId: string): number {
  return getJuzDefinition(juzId)?.juzNumber ?? 0;
}
