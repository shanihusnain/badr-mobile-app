import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const appSettingStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.blackBackground,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        marginTop: 38,
        marginBottom: 24,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.light.greybuttonBackground,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
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
        fontFamily: fonts.primary.bold,
        fontSize: 14,
        letterSpacing: 1,
    },
    content: {
        flex: 1,
        //paddingHorizontal: 24,
    },
    listItem: {
        backgroundColor: Colors.light.greybuttonBackground,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 18,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    listIconContainer: {
        // width: 24,
        // height: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
        flexDirection: "row",
        gap: 12

    },
    listText: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 12,
        // letterSpacing: 0.5,
    },
});
