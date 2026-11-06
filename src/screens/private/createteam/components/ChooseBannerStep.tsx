import type { TeamBanner } from "../teamBannerMockData";
import { ChooseCircularImageStep } from "./ChooseCircularImageStep";

type ChooseBannerStepProps = {
  items: TeamBanner[];
  onNext: (bannerUri: string, bannerKey?: string) => void;
};

export function ChooseBannerStep({ items, onNext }: ChooseBannerStepProps) {
  return (
    <ChooseCircularImageStep
      initialItems={items}
      swipeHintText="SWIPE TO SELECT A BANNER"
      onNext={onNext}
    />
  );
}
