/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Preserve the host when redirecting the loopback IP to the Firebase-authorized localhost.
  skipProxyUrlNormalize: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
