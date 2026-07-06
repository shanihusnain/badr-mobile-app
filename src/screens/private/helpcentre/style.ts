import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const helpCentreStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.blackBackground,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        marginTop: 48,
        marginBottom: 32,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.light.greybuttonBackground,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
    headerTitleContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 14,
        textTransform: "uppercase",
    },
    content: {
        flex: 1,
        //paddingHorizontal: 24,
    },
    sectionTitle: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 15,
        marginBottom: 14,
        marginTop: 8,
    },
    sectionTitleUppercase: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 12,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        marginBottom: 12,
        marginTop: 24,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.light.greybuttonBackground,
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 48,
        marginBottom: 8,
    },
    searchInput: {
        flex: 1,
        color: Colors.light.white,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
        marginLeft: 12,
    },
    questionItem: {
        backgroundColor: Colors.light.greybuttonBackground,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 10,
    },
    questionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    questionText: {
        color: Colors.light.white,
        fontFamily: fonts.primary.medium,
        fontSize: 14,
        flex: 1,
        marginRight: 12,
    },
    answerContainer: {
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: Colors.light.divider,
    },
    answerText: {
        color: Colors.light.dullWhite,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
        lineHeight: 22,
    },
    answerBold: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 14,
    },
    browseTopicsButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.light.greybuttonBackground,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 18,
        marginBottom: 28,
    },
    browseTopicsText: {
        color: Colors.light.white,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
    },
    chatButtonContainer: {
        marginBottom: 40,
    }
});
