import React, { useMemo } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";
import { Colors } from "@/constants/theme";
import {
  DocumentIcon,
  DocumentLockIcon,
  DocumentSearchIcon,
} from "@/assets/icons";
import { useGetAbout, type AboutMenuItem } from "@/src/api/queries/useGetAbout";
import { aboutStyles as styles } from "./style";
import AboutListItem from "./components/AboutListItem";

const FALLBACK_MENU: AboutMenuItem[] = [
  { key: "OPEN_SOURCE_LICENSES", label: "OPEN SOURCE LICENSES" },
  { key: "PRIVACY_POLICY", label: "PRIVACY POLICY" },
  { key: "TERMS_OF_USE", label: "TERMS OF USE" },
];

function getMenuIcon(key: string) {
  switch (key) {
    case "OPEN_SOURCE_LICENSES":
      return (
        <DocumentIcon height={24} width={20} color={Colors.light.subtext} />
      );
    case "PRIVACY_POLICY":
      return <DocumentLockIcon size={24} color={Colors.light.subtext} />;
    case "TERMS_OF_USE":
      return (
        <DocumentSearchIcon
          height={20}
          width={20}
          color={Colors.light.subtext}
        />
      );
    default:
      return (
        <DocumentIcon height={24} width={20} color={Colors.light.subtext} />
      );
  }
}

export default function AboutScreen() {
  const router = useRouter();
  const { data, isLoading } = useGetAbout();

  const menuItems = useMemo(() => {
    const fromApi = data?.menu;
    if (Array.isArray(fromApi) && fromApi.length > 0) return fromApi;
    return FALLBACK_MENU;
  }, [data?.menu]);

  const handleItemPress = (key: string) => {
    if (key === "OPEN_SOURCE_LICENSES") {
      router.push("/(private)/opensourcelicenses");
      return;
    }
    if (key === "PRIVACY_POLICY") {
      router.push({
        pathname: "/(private)/aboutdocument",
        params: { document: "privacy" },
      });
      return;
    }
    if (key === "TERMS_OF_USE") {
      router.push({
        pathname: "/(private)/aboutdocument",
        params: { document: "terms" },
      });
    }
  };

  return (
    <BlackScreenWrapper>
      <View style={styles.content}>
        {isLoading && !data ? (
          <View style={{ paddingTop: 48, alignItems: "center" }}>
            <LoadingComponent size="large" />
          </View>
        ) : (
          menuItems.map((item) => (
            <AboutListItem
              key={item.key}
              icon={getMenuIcon(item.key)}
              label={item.label}
              onPress={() => handleItemPress(item.key)}
            />
          ))
        )}
      </View>
    </BlackScreenWrapper>
  );
}
