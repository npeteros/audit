import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function PricingSection() {
    const features = ['Unlimited wallets', 'Unlimited transactions', 'All features included', 'No credit card required'];

    return (
        <section id="pricing" className="bg-muted/30 py-16 md:py-24">
            <div className="max-w-2xl mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
                </div>

                <Card>
                    <CardContent className="pt-6 text-center space-y-6">
                        <div>
                            <div className="text-5xl md:text-6xl font-bold mb-2">FREE</div>
                            <p className="text-xl text-muted-foreground">No Tricks.</p>
                        </div>

                        <div className="space-y-3 py-6">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center justify-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    <span className="text-sm">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Button asChild size="lg">
                            <Link href="/login">Get Started Free</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
