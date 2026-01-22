import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'AuditPH - Track All Your Wallets in One Place',
        short_name: 'AuditPH',
        description: 'Stop juggling spreadsheets. Track cash, banks, and e-wallets in one dashboard. Multi-wallet tracking with instant insights.',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#1a1a1a',
        categories: ['finance'],
        icons: [
            {
                src: '/audit-white-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/audit-black-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'monochrome',
            },
            {
                src: '/audit-white-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/audit-black-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'monochrome',
            },
        ],
    };
}
