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
                src: '/audit-white.png',
                sizes: 'any',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/audit-black.png',
                sizes: 'any',
                type: 'image/png',
                purpose: 'monochrome',
            },
        ],
    };
}
