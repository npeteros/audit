import type { Metadata } from 'next';
import Navbar from '@/components/shared/navbar';
import HeroSection from './_components/hero-section';
import ProblemsSection from './_components/problems-section';
import FeaturesSection from './_components/features-section';
import StatsSection from './_components/stats-section';
import HowItWorksSection from './_components/how-it-works-section';
import PricingSection from './_components/pricing-section';
import CtaSection from './_components/cta-section';

export const metadata: Metadata = {
    title: 'AuditPH - Track All Your Wallets in One Place | Free Expense Tracker',
    description:
        'Stop juggling spreadsheets. Track cash, banks, and e-wallets in one dashboard. Multi-wallet tracking, instant insights, and smart categorization. Set up in 3 minutes. Built for busy Filipinos.',
    openGraph: {
        title: 'AuditPH - Track All Your Wallets in One Place | Free Expense Tracker',
        description: 'See where your money goes across cash, banks, and e-wallets—all in one dashboard. Multi-wallet tracking with instant insights. Set up in 3 minutes.',
        url: 'https://auditph.vercel.app',
    },
    twitter: {
        title: 'AuditPH - Track All Your Wallets in One Place | Free Expense Tracker',
        description: 'See where your money goes across cash, banks, and e-wallets—all in one dashboard. Multi-wallet tracking with instant insights.',
    },
};

export default function Page() {
    return (
        <>
            <Navbar />
            <main>
                <HeroSection />
                <ProblemsSection />
                <FeaturesSection />
                {/* <StatsSection /> */}
                <HowItWorksSection />
                <PricingSection />
                <CtaSection />
            </main>
        </>
    );
}
