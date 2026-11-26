import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export type AboutMenuKey =
  | "OPEN_SOURCE_LICENSES"
  | "PRIVACY_POLICY"
  | "TERMS_OF_USE"
  | (string & {});

export type AboutMenuItem = {
  key: AboutMenuKey;
  label: string;
};

export type AboutContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: string; text?: string; items?: string[] };

export type AboutOpenSourceLicense = {
  label: string;
  name: string;
  version: string;
  url: string;
  heading: string;
  body: AboutContentBlock[];
};

export type AboutPolicySection = {
  question: string;
  body: AboutContentBlock[];
};

export type AboutPolicyDocument = {
  title: string;
  intro: string;
  sections: AboutPolicySection[];
  effectiveFrom: string;
};

export type AboutData = {
  title: string;
  menu: AboutMenuItem[];
  openSourceLicenses: {
    title: string;
    licenses: AboutOpenSourceLicense[];
  };
  privacyPolicy: AboutPolicyDocument;
  termsOfUse: AboutPolicyDocument;
};

const getAbout = async (): Promise<AboutData> => {
  const response = await api.get("api/more/about");
  return response.data?.data;
};

export const useGetAbout = () => {
  return useQuery({
    queryKey: ["about"],
    queryFn: getAbout,
  });
};
