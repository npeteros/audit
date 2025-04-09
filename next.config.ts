import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    async redirects() {
        return [
            {
                source: '/',
                destination: '/wallets/dashboard',
                permanent: true
            }
        ]
    }
};

export default nextConfig;
