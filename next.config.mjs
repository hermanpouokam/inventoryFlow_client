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
};

export default nextConfig;
