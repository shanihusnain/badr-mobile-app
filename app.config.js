const appJson = require("./app.json");

const facebookAppId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? "";
const facebookClientToken = process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN ?? "";

const plugins = [...(appJson.expo.plugins ?? [])];

if (facebookAppId) {
  plugins.push([
    "react-native-fbsdk-next",
    {
      appID: facebookAppId,
      displayName: "badr",
      scheme: `fb${facebookAppId}`,
      ...(facebookClientToken ? { clientToken: facebookClientToken } : {}),
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
