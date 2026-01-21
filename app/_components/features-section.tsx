import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wallet, TrendingUp, Tag, Zap, Layers, Shield } from 'lucide-react';

export default function FeaturesSection() {
    const features = [
        {
            icon: Wallet,
            title: 'See All Wallets at Once',
            description: 'No more switching apps. View balances from all your wallets—cash, bank, e-wallets—in one unified dashboard.',
        },
        {
            icon: TrendingUp,
            title: 'Instant Insights, Anytime',
            description: 'Know exactly where your money went this week, month, or year with powerful date range filtering.',
        },
        {
            icon: Tag,
            title: 'Categories That Make Sense',
            description: 'Pre-built categories for common expenses, plus the ability to create custom ones that fit your lifestyle.',
        },
        {
            icon: Zap,
            title: 'Login in Seconds',
            description: 'No passwords to remember. Sign in instantly with email magic link or your Google account.',
        },
        {
            icon: Layers,
            title: 'Save Time with Bulk Actions',
            description: 'Delete multiple transactions, wallets, or categories at once. Spend less time managing, more time living.',
        },
        {
            icon: Shield,
            title: 'Your Data, Protected',
            description: 'Built-in safeguards prevent accidental deletion. Your financial history stays intact and secure.',
        },
    ];

    return (
        <section id="features" className="py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything You Need, Nothing You Don&apos;t</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <Card key={index}>
                                <CardHeader>
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle>{feature.title}</CardTitle>
                                    <CardDescription>{feature.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
