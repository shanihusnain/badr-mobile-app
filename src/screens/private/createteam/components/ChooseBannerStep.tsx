import { DEFAULT_TEAM_BANNERS } from "../teamBannerMockData";
import { ChooseCircularImageStep } from "./ChooseCircularImageStep";

type ChooseBannerStepProps = {
  onNext: (bannerUri: string) => void;
};

export function ChooseBannerStep({ onNext }: ChooseBannerStepProps) {
  return (
    <ChooseCircularImageStep
      initialItems={DEFAULT_TEAM_BANNERS}
      swipeHintText="SWIPE TO SELECT A BANNER"
      onNext={onNext}
    />
  );
}
