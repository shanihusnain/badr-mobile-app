// Lillah Donation categories shared between the flow and dashboard

export type LillahCategoryId =
  | "food-relief"
  | "qurbani"
  | "household-essentials"
  | "debt-assistance"
  | "qard-hassan";

export interface LillahCategoryDef {
  id: LillahCategoryId;
  label: string;
  /** MaterialCommunityIcons name */
  icon: string;
  description: string;
}

export const LILLAH_CATEGORIES: LillahCategoryDef[] = [
  {
    id: "food-relief",
    label: "Food Relief",
    icon: "food-fork-drink",
    description:
      "Nutritious meals or food packages, alleviating hunger and spreading care.",
  },
  {
    id: "qurbani",
    label: "Qurbani for the Poor",
    icon: "food-drumstick",
    description:
      "Sacrificial meat provided to the poor, offering nourishment and a sense of care.",
  },
  {
    id: "household-essentials",
    label: "Household Essentials",
    icon: "home-outline",
    description:
      "Any aid provided, such as cleaning supplies, furniture, or cookware.",
  },
  {
    id: "debt-assistance",
    label: "Debt Assistance",
    icon: "cash-multiple",
    description:
      "Any support to clear debts or overdue bills without expecting repayment.",
  },
  {
    id: "qard-hassan",
    label: "Qard Hassan",
    icon: "handshake",
    description:
      "Interest-free loans to those in need, with repayment but no added interest.",
  },
];

export function getLillahCategory(id: LillahCategoryId): LillahCategoryDef {
  return LILLAH_CATEGORIES.find((c) => c.id === id) ?? LILLAH_CATEGORIES[0];
}
