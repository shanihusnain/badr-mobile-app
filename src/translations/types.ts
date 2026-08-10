export interface TranslationKeys {
  setpersonalizedgoals: {
    Setyourperosnalizedgoals: string;
    howItWorks: string;
    daysLeft: string;
    days: string;
    "overall progress": string;
    watchTutorial: string;
    skip: string;
    tutorial: string;
    setPersonalizedDescription: string;
  };
  monthlyGoalPlanner: {
    title: string;
    heading: string;
    subheading: string;
    summaryText1: string;
    summaryTextBold1: string;
    summaryText2: string;
    summaryTextBold2: string;
    summaryText3: string;
    summaryTextBold3: string;
    summaryText4: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
    card4Title: string;
    card4Desc: string;
    card5Title: string;
    card5Desc: string;
    card6Title: string;
    card6Desc: string;
    step1Title: string;
    step2Title: string;
    step2Category: string;
    step3Title: string;
    step3Category: string;
    step4Title: string;
    step4Category: string;
    step5Title: string;
    step5Category: string;
    step6Title: string;
  };
  welcomeScreen: {
    welcomeText: string;
    loginBtnText: string;
    createAccountBtnText: string;
    setPersonalizedDescription: string;
  };
  loginScreen: {
    Title: string;
    forgotPassword: string;
    loginBtnText: string;
    signUpText: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    orLoginWith: string;
  };
  forgotPasswordScreen: {
    title: string;
    description: string;
    emailPlaceholder: string;
    sendInstructionsBtn: string;
    backToLoginText: string;
  };
  verifyEmailScreen: {
    title: string;
    description: string;
    codePlaceholder: string;
    verifyBtnText: string;
    resendCodeText: string;
  };
  goalsData: Record<string, GoalInfo>;
}

export type GoalReadMoreTextStyle =
  | "body"
  | "bodyTight"
  | "bodyMediumTight"
  | "bodyZero"
  | "tableGuide"
  | "sectionHeading"
  | "prayerHeading"
  | "quoteItalic"
  | "quoteSemibold"
  | "quoteMediumItalic"
  | "hadithQuoteLead"
  | "hadithQuoteLight"
  | "wuduBody"
  | "wuduBodySpaced"
  | "bilalQuote"
  | "bilalQuoteLight";

export type GoalReadMoreItem =
  | { type: "text"; content: string; style: GoalReadMoreTextStyle; align?: "left" | "right" | "center"; icon?: string }
  | { type: "prayerSection"; heading: string; description: string }
  | { type: "benefit"; heading: string; description: string }
  | { type: "replyWithQuote"; prefix: string; quote: string }
  | { type: "boldPrefixText"; prefix: string; content: string; style: GoalReadMoreTextStyle; align?: "left" | "right" | "center"; icon?: string }
  | { type: "boldSuffixText"; suffix: string; content: string; style: GoalReadMoreTextStyle; align?: "left" | "right" | "center"; icon?: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export type GoalReadMoreContainer = {
  items: GoalReadMoreItem[];
};

export type GoalBenefitItem = {
  heading: string;
  description: string;
};

export interface GoalInfo {
  title?: string;
  description?: string;
  summaryDescription?: string;
  heroTitle?: string;
  navTitle?: string;
  steps?: string[];
  hadithIntro?: string;
  benefitsIntro?: string;
  benefits?: GoalBenefitItem[];
  readMore?: GoalReadMoreContainer[];
}
