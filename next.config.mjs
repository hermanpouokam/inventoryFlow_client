/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
        strictNextHead: false,
    },
};

export default nextConfig;
