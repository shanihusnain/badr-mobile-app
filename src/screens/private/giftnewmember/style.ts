import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const giftNewMemberStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.blackBackground,
    },
    container: {
        flex: 1,
       // paddingHorizontal: 24,
    },
    header: {
        marginTop: 40,
        marginBottom: 40,
    },
    content: {
        alignItems: "center",
    },
    title: {
        color: Colors.light.white,
        fontFamily: fonts.primary.medium,
        fontSize: 24,
        textTransform: "uppercase",
        marginBottom: 20,
        //letterSpacing: 1,
    },
    subtitle: {
        color: Colors.light.dullWhite,
        fontFamily: fonts.primary.medium,
        fontSize: 14,
        textAlign: "center",
        marginBottom: 20,
    },
    description: {
        color: Colors.light.dullWhite,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 40,
    },
    imagePlaceholder: {
        width: "100%",
        height: 400,
        backgroundColor: Colors.light.calendarBg,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: Colors.light.greybuttonversion,
        justifyContent: "center",
        alignItems: "center",
    },
    imagePlaceholderText: {
        color: Colors.light.subtext,
        fontFamily: fonts.primary.medium,
    },
    bottomSection: {
        marginTop: "auto",
        paddingBottom: 40,
    },
});
