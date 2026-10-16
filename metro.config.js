const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const name = moduleName.startsWith('.') && moduleName.endsWith('.ts') ? moduleName.slice(0, -3) : moduleName;
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, name, platform);
  }
  return context.resolveRequest(context, name, platform);
};

module.exports = config;
