/**
 * Dynamic Expo config.
 *
 * `app.json` keeps the static configuration. This wrapper only adds
 * `experiments.baseUrl` when EXPO_BASE_URL is set, which is what the GitHub
 * Pages deploy uses to serve the web demo from /organizer/demo.
 */
module.exports = ({ config }) => {
  const baseUrl = process.env.EXPO_BASE_URL;

  if (!baseUrl) {
    return config;
  }

  return {
    ...config,
    experiments: {
      ...(config.experiments ?? {}),
      baseUrl,
    },
  };
};
