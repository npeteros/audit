import type { Metadata } from 'next';
import { Roboto_Condensed } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import OneTapComponent from '@/components/shared/one-tap-component';
import { ModeToggle } from '@/components/shared/mode-toggle';
import AppProvider from '@/components/providers/app-provider';

const robotoCondensed = Roboto_Condensed({
    subsets: ['latin'],
    weight: ['100', '300', '400', '700'],
    variable: '--font-roboto-condensed',
});

export const metadata: Metadata = {
    metadataBase: new URL('https://auditph.vercel.app'),
    title: {
        template: '%s | AuditPH',
        default: 'AuditPH - Track All Your Wallets in One Place | Free Expense Tracker',
    },
    description:
        "AuditPH is an intuitive and powerful expense tracker web application built for small businesses and individuals to manage finances effortlessly. Track multiple wallets, categorize transactions, monitor income and expenses, and gain clear insights into your spending habits. Whether you're a business owner or just managing your personal budget, AuditPH helps you stay on top of your financial goals with real-time analytics, budgeting tools, and seamless record-keeping.",
    applicationName: 'AuditPH',
    creator: 'Neal Andrew Peteros',
    authors: [{ name: 'Neal Andrew Peteros' }],
    keywords: ['expense tracker', 'wallet management', 'financial tracking', 'budget app', 'money management', 'personal finance', 'transaction tracker', 'Philippines'],
    openGraph: {
        type: 'website',
        locale: 'en_PH',
        url: 'https://auditph.vercel.app',
        siteName: 'AuditPH',
        title: 'AuditPH - Track All Your Wallets in One Place',
        description: 'Stop juggling spreadsheets. Track cash, banks, and e-wallets in one dashboard. Set up in 3 minutes. Built for busy Filipinos.',
        images: [
            {
                url: '/opengraph-image.png',
                width: 1200,
                height: 630,
                alt: 'AuditPH Dashboard Preview',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AuditPH - Track All Your Wallets in One Place',
        description: 'Stop juggling spreadsheets. Track all your wallets in one dashboard.',
        images: ['/opengraph-image.png'],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AppProvider>
            <html lang="en">
                <body className={`${robotoCondensed.variable}`}>
                    {children}
                    <OneTapComponent />
                    <div className="fixed bottom-4 right-4">
                        <ModeToggle />
                    </div>
                    <Toaster />
                </body>
            </html>
        </AppProvider>
    );
}
