const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
if (!config.resolver.assetExts.includes('wasm'))
  config.resolver.assetExts.push('wasm');

module.exports = withNativeWind(config, {
  input: './src/shared/styles/global.css',
  inlineRem: 16,
});
