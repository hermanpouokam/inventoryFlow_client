/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
        strictNextHead: false,
    },
    // webpack: (config) => {
    //     config.resolve.alias['konva'] = 'konva/lib/index.js'; 
    //     return config;
    // },
    output: 'standalone',
    async headers() {
        return [
            {
                source: "/manifest.json",
                headers: [{ key: "Content-Type", value: "application/manifest+json" }],
            },
        ];
    },
};

export default nextConfig;
