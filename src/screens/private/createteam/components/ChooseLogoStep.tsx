import { createTeamThreeAndFourImage } from "@/assets/images";
import { DEFAULT_TEAM_LOGOS } from "../teamLogoMockData";
import { ChooseCircularImageStep } from "./ChooseCircularImageStep";

type ChooseLogoStepProps = {
  onNext: (logoUri: string) => void;
};

export function ChooseLogoStep({ onNext }: ChooseLogoStepProps) {
  return (
    <ChooseCircularImageStep
      initialItems={DEFAULT_TEAM_LOGOS}
      swipeHintText="SWIPE TO SELECT A LOGO"
      headerImage={createTeamThreeAndFourImage}
      onNext={onNext}
    />
  );
}
