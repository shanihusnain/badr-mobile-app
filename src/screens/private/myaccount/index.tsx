import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Colors } from "@/constants/theme";
import { myAccountStyles as styles } from "./style";
import { useRouter } from "expo-router";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import {
  CalendarIcon,
  PaymentIcon,
  WalletIcon,
  ReferFriendIcon,
  JournalBookIcon,
  InsightIcon,
  InBoxArrow,
  DocumentLockIcon,
  ReferFriendTabIcon,
  RedeemGiftIcon
} from "@/assets/icons";
import RedeemGiftExtensionRoute from "@/app/(private)/redeemgiftextension";

type ListItem = {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  route?: string;
};

const MEMBERSHIP_ITEMS: ListItem[] = [
  {
    title: "BADR MEMBERSHIP",
    subtitle: "Manage your membership",
    icon: <InBoxArrow color={Colors.light.subtext} size={24} />,
    route: "/(private)/badarmembership",
  },
  {
    title: "MEMBERSHIP EXTENSIONS",
    subtitle: "Add months to your membership and save",
    icon: <CalendarIcon color={Colors.light.subtext} size={24} />,
    route: "/(private)/membershipextension",
  },
  {
    title: "PAYMENT METHOD",
    subtitle: "Visa ending in 0022",
    icon: <PaymentIcon color={Colors.light.subtext} size={24} />,
    route: "/(private)/membershippaymentmethod",
  },
  {
    title: "REFER A FRIEND",
    subtitle: "Get one month free for each friend you refer",
    icon: <ReferFriendTabIcon color={Colors.light.dullWhite} size={24} />,
    route: "/(private)/friendreferal",
  },
  {
    title: "REDEEM GIFT EXTENSION",
    subtitle: "Apply your gift to your membership",
    icon: <RedeemGiftIcon color={Colors.light.dullWhite} size={24} />,
    route: "/(private)/redeemgiftextension",
  },
];

const PERSONAL_ITEMS: ListItem[] = [
  {
    title: "PROFILE INFORMATION",
    icon: <InsightIcon color={Colors.light.dullWhite} size={18} />,
    route: "/(private)/editprofile",
  },
  {
    title: "EMAIL",
    subtitle: "layla.najia@gmail.com",
    icon: <InBoxArrow color={Colors.light.dullWhite} size={18} />,
    route: "/(private)/changeemailid",
  },
  {
    title: "CHANGE PASSWORD",
    icon: <DocumentLockIcon color={Colors.light.dullWhite} size={18} />,
    route: "/(private)/changepassword",
  },
];

export default function MyAccountScreen() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  const handleItemPress = (item: ListItem) => {
    if (item.route) {
      router.push(item.route as any);
    }
  };

  const renderItem = (item: ListItem, index: number) => (
    <Pressable key={index} style={styles.listCard} onPress={() => handleItemPress(item)}>
      <View style={styles.listIconContainer}>
        {item.icon}
      </View>
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.listItemSubtitle}>{item.subtitle}</Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <BlackScreenWrapper>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>MEMBERSHIP</Text>
          {MEMBERSHIP_ITEMS.map((item, index) => renderItem(item, index))}

          <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
          {PERSONAL_ITEMS.map((item, index) => renderItem(item, index + 100))}
        </View>
      </ScrollView>
    </BlackScreenWrapper>
  );
}
