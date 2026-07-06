import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

export const editProfileStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.blackBackground,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        marginTop: 20,
        marginBottom: 32,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.light.greybuttonversion,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    headerTitleContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
    },
    headerTitle: {
        color: Colors.light.white,
        fontFamily: fonts.primary.semiBold,
        fontSize: 16,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    scrollContent: {
        // paddingHorizontal: 24,
        paddingBottom: 40,
    },
    profileImageContainer: {
        alignSelf: "center",
        marginBottom: 32,
        position: "relative",
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    cameraButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: Colors.light.green,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: Colors.light.blackBackground,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: Colors.light.subtext,
        fontFamily: fonts.primary.medium,
        fontSize: 12,
        marginBottom: 8,
    },
    inputBox: {
        backgroundColor: Colors.light.calendarBg,
        borderRadius: 8,
        height: 48,
        width: "100%",
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
    },
    disabledInputBox: {
        backgroundColor: Colors.light.darkgrey,
    },
    inputText: {
        flex: 1,
        color: Colors.light.white,
        fontFamily: fonts.primary.regular,
        fontSize: 14,
    },
    disabledInputText: {
        color: Colors.light.subtext,
    },
    rightIcon: {
        marginLeft: 10,
    },
    flagIcon: {
        width: 20,
        height: 14,
        marginRight: 10,
        borderRadius: 2,
    },
    saveButtonContainer: {
        marginTop: 20,
    },
    dropdownLabel: {
        marginTop: 0,
        marginBottom: 8,
        color: Colors.light.subtext,
        fontFamily: fonts.primary.regular,
        fontSize: 12,
    },
    dropdownContainer: {
        marginTop: 0,
        paddingHorizontal: 16,
        minHeight: 48,
        borderRadius: 8,
        width: "102%",
    },
});
