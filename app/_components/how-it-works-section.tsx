import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogIn, PlusCircle, BarChart3 } from 'lucide-react';

export default function HowItWorksSection() {
    const steps = [
        {
            step: 1,
            icon: LogIn,
            title: 'Sign In with Email or Google',
            description: 'No passwords needed. Get started in seconds with passwordless authentication.',
        },
        {
            step: 2,
            icon: PlusCircle,
            title: 'Add Your Wallets',
            description: 'Create wallets for your cash, bank accounts, and e-wallets. It takes less than a minute.',
        },
        {
            step: 3,
            icon: BarChart3,
            title: 'Start Tracking Expenses',
            description: 'Record transactions as they happen. Watch your financial insights grow automatically.',
        },
    ];

    return (
        <section id="how-it-works" className="py-16 md:py-24">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Get Started in 3 Simple Steps</h2>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {steps.map((step) => {
                        const Icon = step.icon;
                        return (
                            <Card key={step.step}>
                                <CardHeader>
                                    <Badge variant="default" className="w-fit mb-2">
                                        Step {step.step}
                                    </Badge>
                                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                        <Icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <CardTitle>{step.title}</CardTitle>
                                    <CardDescription>{step.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
