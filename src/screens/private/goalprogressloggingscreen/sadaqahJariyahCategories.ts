// Sadaqah Jariyah categories shared between the flow and dashboard

export type SadaqahJariyahCategoryId =
  | "honoring-parents"
  | "sponsoring-orphans"
  | "building-wells"
  | "sustaining-mosques"
  | "teaching-quran"
  | "sheltering-lives"
  | "providing-healthcare"
  | "spreading-knowledge"
  | "providing-clothing"
  | "planting-trees";

export interface SadaqahJariyahCategoryDef {
  id: SadaqahJariyahCategoryId;
  label: string;
  /** MaterialCommunityIcons name */
  icon: string;
  description: string;
}

export const SADAQAH_JARIYAH_CATEGORIES: SadaqahJariyahCategoryDef[] = [
  {
    id: "honoring-parents",
    label: "Honoring Parents",
    icon: "account-heart",
    description:
      "Donating in your parents' name for ongoing blessings and eternal rewards.",
  },
  {
    id: "sponsoring-orphans",
    label: "Sponsoring Orphans",
    icon: "account-child",
    description:
      "Providing care, education and support for orphaned children.",
  },
  {
    id: "building-wells",
    label: "Building Wells",
    icon: "water-well",
    description:
      "Providing clean water by funding or constructing wells in needy areas.",
  },
  {
    id: "sustaining-mosques",
    label: "Sustaining Mosques",
    icon: "mosque",
    description:
      "Supporting the construction and maintenance of mosques for ongoing worship.",
  },
  {
    id: "teaching-quran",
    label: "Teaching Quran",
    icon: "book-open-page-variant",
    description:
      "Funding Quran education so the rewards of every recitation flow back to you.",
  },
  {
    id: "sheltering-lives",
    label: "Sheltering Lives",
    icon: "home-heart",
    description:
      "Providing shelter and housing support to displaced or homeless families.",
  },
  {
    id: "providing-healthcare",
    label: "Providing Healthcare",
    icon: "heart-plus",
    description:
      "Funding medical care and health facilities for those who cannot afford treatment.",
  },
  {
    id: "spreading-knowledge",
    label: "Spreading Knowledge",
    icon: "school",
    description:
      "Supporting education and scholarship that illuminates hearts for generations.",
  },
  {
    id: "providing-clothing",
    label: "Providing Clothing",
    icon: "tshirt-crew-outline",
    description:
      "Donating clothing to those in need for warmth, dignity and comfort.",
  },
  {
    id: "planting-trees",
    label: "Planting Trees",
    icon: "tree-outline",
    description:
      "Growing trees that benefit people, animals and the environment indefinitely.",
  },
];

export function getSadaqahJariyahCategory(
  id: SadaqahJariyahCategoryId,
): SadaqahJariyahCategoryDef {
  return (
    SADAQAH_JARIYAH_CATEGORIES.find((c) => c.id === id) ??
    SADAQAH_JARIYAH_CATEGORIES[0]
  );
}
