'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { useTransactions } from '@/lib/api/transactions.api';
import type { TransactionType } from '@/lib/prisma/generated/client';
import { formatCurrency } from '@/lib/utils';

interface CategoryBreakdownChartProps {
    userId?: string;
    walletId?: string;
    startDate?: Date;
    endDate?: Date;
    type: TransactionType;
}

const COLORS = [
    'hsl(142, 76%, 36%)',
    'hsl(221, 83%, 53%)',
    'hsl(262, 83%, 58%)',
    'hsl(346, 77%, 50%)',
    'hsl(24, 95%, 53%)',
    'hsl(45, 93%, 47%)',
    'hsl(173, 58%, 39%)',
    'hsl(198, 93%, 60%)',
];

export function CategoryBreakdownChart({ userId, walletId, startDate, endDate, type }: CategoryBreakdownChartProps) {
    const { data, isLoading } = useTransactions({
        userId,
        walletId,
        startDate,
        endDate,
        type,
        limit: 1000, // Get all transactions for accurate breakdown
    });

    // Group transactions by category
    const categoryTotals = React.useMemo(() => {
        const transactions = data?.data || [];
        const totals = new Map<string, { name: string; value: number; icon: string }>();

        transactions.forEach((transaction) => {
            const categoryName = transaction.category.name;
            const categoryIcon = transaction.category.icon;
            const amount = Number(transaction.amount);

            if (totals.has(categoryName)) {
                const existing = totals.get(categoryName)!;
                totals.set(categoryName, {
                    ...existing,
                    value: existing.value + amount,
                });
            } else {
                totals.set(categoryName, {
                    name: categoryName,
                    value: amount,
                    icon: categoryIcon,
                });
            }
        });

        return Array.from(totals.values()).sort((a, b) => b.value - a.value);
    }, [data]);

    const chartData = categoryTotals.map((item, index) => ({
        ...item,
        fill: COLORS[index % COLORS.length],
    }));

    // Create config for chart
    const chartConfig = React.useMemo(() => {
        const config: Record<string, { label: string; color: string }> = {};
        chartData.forEach((item, index) => {
            config[item.name] = {
                label: item.name,
                color: COLORS[index % COLORS.length],
            };
        });
        return config;
    }, [chartData]);

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 w-48 bg-muted rounded" />
                    <div className="h-75 bg-muted rounded" />
                </div>
            </Card>
        );
    }

    if (chartData.length === 0) {
        return (
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">{type === 'INCOME' ? 'Income' : 'Expense'} by Category</h3>
                <div className="h-75 flex items-center justify-center text-muted-foreground">No {type.toLowerCase()} data available</div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{type === 'INCOME' ? 'Income' : 'Expense'} by Category</h3>
            <ChartContainer config={chartConfig} className="h-75">
                <PieChart>
                    <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => (
                        <div className='flex flex-col'>
                            <span className='font-medium'>{name}</span>
                            <span>{formatCurrency(Number(value))}</span>
                        </div>
                    )} />} />
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent className="flex-wrap mt-4" />} />
                </PieChart>
            </ChartContainer>
        </Card>
    );
}
