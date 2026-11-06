import { createTeamThreeAndFourImage } from "@/assets/images";
import type { TeamLogo } from "../teamLogoMockData";
import { ChooseCircularImageStep } from "./ChooseCircularImageStep";

type ChooseLogoStepProps = {
  items: TeamLogo[];
  onNext: (logoUri: string, logoKey?: string) => void;
};

export function ChooseLogoStep({ items, onNext }: ChooseLogoStepProps) {
  return (
    <ChooseCircularImageStep
      initialItems={items}
      swipeHintText="SWIPE TO SELECT A LOGO"
      headerImage={createTeamThreeAndFourImage}
      onNext={onNext}
    />
  );
}
