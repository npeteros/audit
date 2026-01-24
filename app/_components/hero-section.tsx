import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HeroSection() {
    return (
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 lg:py-32">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Left Column - Content */}
                <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">Stop Juggling Spreadsheets. Track All Your Wallets in One Place</h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                        Set up in 3 minutes. See where your money goes across cash, banks, and e-wallets—all in one dashboard built for busy Filipinos.
                    </p>
                    <div className="flex gap-4">
                        <Button asChild size="lg">
                            <Link href="/login">Get Started Free</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="/#how-it-works">See How It Works</Link>
                        </Button>
                    </div>
                </div>

                {/* Right Column - Dashboard Preview */}
                <div>
                    <Card className="rounded-xl overflow-hidden shadow-lg p-0">
                        <Image
                            src="/dashboard-light.png"
                            width={1600}
                            height={900}
                            alt="AuditPH Dashboard Preview"
                            className="w-full h-auto block dark:hidden"
                            priority
                        />
                        <Image
                            src="/dashboard-dark.png"
                            width={1600}
                            height={900}
                            alt="AuditPH Dashboard Preview"
                            className="w-full h-auto hidden dark:block"
                            priority
                        />
                    </Card>
                </div>
            </div>
        </section>
    );
}
