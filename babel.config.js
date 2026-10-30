module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo (SDK 58) automatically adds react-native-worklets/plugin
    // when Reanimated 4 is installed, so no extra plugin is needed here.
    presets: ['babel-preset-expo'],
  };
};
