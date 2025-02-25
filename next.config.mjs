/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
        strictNextHead: false,
        clientReferenceManifest: false,
    },
};

export default nextConfig;
