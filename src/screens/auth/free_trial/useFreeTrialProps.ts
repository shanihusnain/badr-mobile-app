import { useTranslation } from "react-i18next";
import React from "react";
import {
  FreeTrialScreenShotIcon,
  FreeTrialScreenLoudSpeakerIcon,
  FreeTrialScreenBookIcon,
  FreeTrialScreenCommunityIcon,
  FreeTrialScreenHeadPhoneIcon,
  FreeTrialScreenPaperIcon,
} from "@/assets/icons";
import { Colors } from "@/constants/theme";

export const useFreeTrialProps = () => {
  const { t } = useTranslation();

  const texts = [
    {
      title: t("freeTrialScreen.feature1"),
      icon: React.createElement(FreeTrialScreenShotIcon, {
        size: 24,
        color: Colors.light.green,
      }),
    },
    {
      title: t("freeTrialScreen.feature2"),
      icon: React.createElement(FreeTrialScreenLoudSpeakerIcon, {
        size: 24,
        color: Colors.light.green,
      }),
    },
    {
      title: t("freeTrialScreen.feature3"),
      icon: React.createElement(FreeTrialScreenBookIcon, {
        size: 24,
        color: Colors.light.green,
      }),
    },
    {
      title: t("freeTrialScreen.feature4"),
      icon: React.createElement(FreeTrialScreenCommunityIcon, {
        size: 24,
        color: Colors.light.green,
      }),
    },
    {
      title: t("freeTrialScreen.feature5"),
      icon: React.createElement(FreeTrialScreenHeadPhoneIcon, {
        size: 24,
        color: Colors.light.green,
      }),
    },
    {
      title: t("freeTrialScreen.feature6"),
      icon: React.createElement(FreeTrialScreenPaperIcon, {
        size: 24,
        color: Colors.light.green,
      }),
    },
  ];
  return {
    texts,
  };
};
