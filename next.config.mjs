/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  serverRuntimeConfig: {
    VERCEL_FUNCTIONS_DISABLE: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
   
    ],
  },
  // redirects: async () => [
  //   {
  //     source: "/",
  //     destination: "/universe",
  //     permanent: false,
  //   },
  // ],
};

export default nextConfig;
