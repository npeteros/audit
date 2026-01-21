import { Card, CardContent } from '@/components/ui/card';
import { Users, Receipt, Wallet, Heart } from 'lucide-react';

export default function StatsSection() {
    const stats = [
        {
            icon: Users,
            value: '5,000+',
            label: 'Users',
        },
        {
            icon: Receipt,
            value: '100,000+',
            label: 'Transactions Tracked',
        },
        {
            icon: Wallet,
            value: '15,000+',
            label: 'Wallets Managed',
        },
        {
            icon: Heart,
            value: 'Free',
            label: 'Forever',
        },
    ];

    return (
        <section id="stats" className="bg-muted/30 py-16 md:py-24">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Trusted by Busy Filipinos</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={index}>
                                <CardContent className="pt-6 text-center space-y-2">
                                    <Icon className="h-8 w-8 mx-auto text-primary mb-2" />
                                    <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
