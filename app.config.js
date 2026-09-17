const appJson = require("./app.json");

const facebookAppId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? "";
const facebookClientToken = process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN ?? "";

const plugins = [...(appJson.expo.plugins ?? [])];

if (facebookAppId) {
  if (!facebookClientToken) {
    console.warn(
      "[app.config] EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN is missing. Facebook login will crash in native builds.",
    );
  }

  plugins.push([
    "react-native-fbsdk-next",
    {
      appID: facebookAppId,
      clientToken: facebookClientToken,
      displayName: "badr",
      scheme: `fb${facebookAppId}`,
      isAutoInitEnabled: true,
    },
  ]);
}

plugins.push("@react-native-google-signin/google-signin");

module.exports = {
  expo: {
    ...appJson.expo,
    plugins,
  },
};
