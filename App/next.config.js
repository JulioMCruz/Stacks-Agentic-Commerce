/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lint is decoupled from the production build; run `npm run lint` separately.
  eslint: { ignoreDuringBuilds: true },
  webpack: (config) => {
    // @stacks/connect pulls in WalletConnect/pino, which optionally requires
    // pino-pretty (and others) that aren't needed in the browser bundle.
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
}

module.exports = nextConfig
