/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    headers: async () => [
        {
            source: '/:path*',
            headers: [
                {
                    key: 'Content-Security-Policy',
                    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.mainnet-beta.solana.com https://api.devnet.solana.com https://solana-api.projectserum.com wss://api.mainnet-beta.solana.com wss://api.devnet.solana.com http://localhost:8080 http://localhost:8899 ws://localhost:8900;",
                },
            ],
        },
    ],
};

export default nextConfig;
