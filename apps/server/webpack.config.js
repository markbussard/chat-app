const { composePlugins, withNx } = require('@nrwl/webpack');

module.exports = composePlugins(withNx(), (config) => {
  // Remove fork-ts-checker-webpack-plugin
  config.plugins.shift();
  return config;
});

