import { useTranslation } from "react-i18next";

export const useFreeTrialProps = () => {
  const { t } = useTranslation();

  const texts = [
    {
      title: t("freeTrialScreen.feature1"),
    },
    {
      title: t("freeTrialScreen.feature2"),
    },
    {
      title: t("freeTrialScreen.feature3"),
    },
    {
      title: t("freeTrialScreen.feature4"),
    },
    {
      title: t("freeTrialScreen.feature5"),
    },
    {
      title: t("freeTrialScreen.feature6"),
    },
  ];
  return {
    texts,
  };
};
