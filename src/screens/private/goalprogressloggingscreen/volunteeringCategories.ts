export type VolunteeringCategoryId =
  | "distributing-food"
  | "shaping-futures"
  | "offering-compassion";

export type VolunteeringCategoryDef = {
  id: VolunteeringCategoryId;
  label: string;
  icon: string;
  description: string;
};

export const VOLUNTEERING_CATEGORIES: VolunteeringCategoryDef[] = [
  {
    id: "distributing-food",
    label: "Distributing Food",
    icon: "food",
    description: "Helping with food banks or delivering essentials to those in need.",
  },
  {
    id: "shaping-futures",
    label: "Shaping Futures",
    icon: "account-group",
    description: "Supporting local events like fundraisers, clean-ups, or awareness campaigns.",
  },
  {
    id: "offering-compassion",
    label: "Offering Compassion",
    icon: "wheelchair-accessibility",
    description: "Visiting the elderly, assisting at shelters, or helping vulnerable groups.",
  },
];
