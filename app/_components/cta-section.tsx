import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function CtaSection() {
    return (
        <section className="py-16 md:py-24 px-4 md:px-6">
            <Card className="max-w-3xl mx-auto">
                <CardContent className="space-y-6 py-12 px-6 md:px-12 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold">Ready to Take Control of Your Finances?</h2>
                    <p className="text-lg text-muted-foreground">Join thousands of Filipinos saving hours every month tracking their money</p>
                    <Button asChild size="lg" className="gap-2">
                        <Link href="/login">
                            Get Started Free — No Credit Card Needed
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </section>
    );
}
