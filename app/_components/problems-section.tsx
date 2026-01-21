import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileSpreadsheet, RefreshCw, Calculator } from 'lucide-react';

export default function ProblemsSection() {
    const problems = [
        {
            icon: FileSpreadsheet,
            title: 'Spreadsheets Everywhere',
            description: 'Tired of manually updating multiple sheets just to know how much you spent this week?',
        },
        {
            icon: RefreshCw,
            title: 'Switching Between Apps',
            description: 'Checking your bank app, e-wallet, and cash drawer separately takes too much time.',
        },
        {
            icon: Calculator,
            title: 'Doing Manual Math',
            description: 'Calculating totals across different wallets is tedious and error-prone.',
        },
    ];

    return (
        <section id="problems" className="bg-muted/30 py-16 md:py-24">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Tired of Financial Chaos?</h2>
                    <p className="text-lg text-muted-foreground">You&apos;re not alone. Most Filipinos struggle with:</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {problems.map((problem, index) => {
                        const Icon = problem.icon;
                        return (
                            <Card key={index}>
                                <CardHeader>
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle>{problem.title}</CardTitle>
                                    <CardDescription>{problem.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
