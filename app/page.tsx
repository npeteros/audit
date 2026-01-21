import Navbar from '@/components/shared/navbar';
import HeroSection from './_components/hero-section';
import ProblemsSection from './_components/problems-section';
import FeaturesSection from './_components/features-section';
import StatsSection from './_components/stats-section';
import HowItWorksSection from './_components/how-it-works-section';
import PricingSection from './_components/pricing-section';
import CtaSection from './_components/cta-section';

export default function Page() {
    return (
        <>
            <Navbar />
            <main>
                <HeroSection />
                <ProblemsSection />
                <FeaturesSection />
                <StatsSection />
                <HowItWorksSection />
                <PricingSection />
                <CtaSection />
            </main>
        </>
    );
}
