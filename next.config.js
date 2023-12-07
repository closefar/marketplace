/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    trailingSlash: true,
    productionBrowserSourceMaps: true,
    webpack: (config, _options) => {  
      config.module.rules.push({
        test: /\.cdc/,
        type: "asset/source",
      })
      config.resolve.fallback = { fs: false };
      return config
    },
};

module.exports = nextConfig
