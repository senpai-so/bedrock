/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  images: {
    domains: [
      'assets.terra.money',
      'localhost',
      'loonies.world',
      'dl.airtable.com',
      'ipfs.io',
    ]
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.experiments.asyncWebAssembly = true
    return config
  },
}
