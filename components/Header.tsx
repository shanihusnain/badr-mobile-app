import React from "react";
import { Text, View } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { fonts } from "../assets/fonts";
import { Colors } from "../constants/theme";
import BackButton from "./atoms/Backbutton";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: hp(7),
        paddingBottom: hp(2.5),
        backgroundColor: Colors.light.blackBackground,
      }}
    >
      <BackButton />
      {title ? (
        <Text
          style={{
            color: Colors.light.white,
            fontFamily: fonts.primary.semiBold,
            fontWeight: "600",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          {title}
        </Text>
      ) : (
        <View style={{ width: 130 }} />
      )}
      <View style={{ width: 30 }} />
    </View>
  );
};

export default Header;
