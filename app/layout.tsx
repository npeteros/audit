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
    title: 'AuditPH',
    description:
        "AuditPH is an intuitive and powerful expense tracker web application built for small businesses and individuals to manage finances effortlessly. Track multiple wallets, categorize transactions, monitor income and expenses, and gain clear insights into your spending habits. Whether you're a business owner or just managing your personal budget, AuditPH helps you stay on top of your financial goals with real-time analytics, budgeting tools, and seamless record-keeping.",
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
