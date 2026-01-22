'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { TransactionSummaryResponse } from '@/types/transactions.types';
import { formatCurrency } from '@/lib/utils';

interface IncomeExpenseChartProps {
    summary?: TransactionSummaryResponse;
    isLoading?: boolean;
}

const chartConfig = {
    income: {
        label: 'Income',
        color: 'hsl(142, 76%, 36%)',
    },
    expense: {
        label: 'Expense',
        color: 'hsl(0, 84%, 60%)',
    },
} as const;

export function IncomeExpenseChart({ summary, isLoading }: IncomeExpenseChartProps) {
    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 w-48 bg-muted rounded" />
                    <div className="h-[300px] bg-muted rounded" />
                </div>
            </Card>
        );
    }

    const chartData = [
        {
            category: 'Income',
            amount: summary?.income || 0,
            fill: chartConfig.income.color,
        },
        {
            category: 'Expense',
            amount: summary?.expense || 0,
            fill: chartConfig.expense.color,
        },
    ];

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Income vs Expense</h3>
            <ChartContainer config={chartConfig} className="h-96 md:h-75 w-full">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="category" tickLine={false} axisLine={false} className="text-xs" />
                            <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={(value) => `${formatCurrency(value)}`} />
                            <ChartTooltip
                                content={<ChartTooltipContent formatter={(value) => `${formatCurrency(Number(value))}`} />}
                    />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ChartContainer>
        </Card>
    );
}
