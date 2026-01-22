'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useTransactions } from '@/lib/api/transactions.api';
import { format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

interface TrendChartProps {
    userId?: string;
    walletId?: string;
    startDate?: Date;
    endDate?: Date;
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
    balance: {
        label: 'Net Balance',
        color: 'hsl(221, 83%, 53%)',
    },
} as const;

export function TrendChart({ userId, walletId, startDate, endDate }: TrendChartProps) {
    const { data: transactionData, isLoading } = useTransactions({
        userId,
        walletId,
        startDate,
        endDate,
        limit: 1000, // Get all transactions for accurate trend
    });

    const chartData = React.useMemo(() => {
        const transactions = transactionData?.data || [];

        if (!startDate || !endDate) return [];

        // Determine grouping interval based on date range
        const diffInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const interval = diffInDays <= 31 ? 'day' : diffInDays <= 90 ? 'week' : 'month';

        let periods: Date[] = [];

        if (interval === 'day') {
            periods = eachDayOfInterval({ start: startDate, end: endDate });
        } else if (interval === 'week') {
            periods = eachWeekOfInterval({ start: startDate, end: endDate });
        } else {
            periods = eachMonthOfInterval({ start: startDate, end: endDate });
        }

        const chartData = periods.map((period) => {
            const periodEnd =
                interval === 'day'
                    ? new Date(period.getTime() + 24 * 60 * 60 * 1000 - 1)
                    : interval === 'week'
                      ? new Date(period.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)
                      : new Date(period.getFullYear(), period.getMonth() + 1, 0, 23, 59, 59);

            const periodTransactions = transactions.filter((t) => {
                const transactionDate = new Date(t.transactionDate);
                return transactionDate >= period && transactionDate <= periodEnd;
            });

            let income = 0;
            let expense = 0;

            periodTransactions.forEach((t) => {
                const amount = Number(t.amount);
                if (t.category.type === 'INCOME') {
                    income += amount;
                } else {
                    expense += amount;
                }
            });

            const balance = income - expense;

            return {
                date: format(period, interval === 'day' ? 'MMM dd' : interval === 'week' ? 'MMM dd' : 'MMM yyyy'),
                income,
                expense,
                balance,
            };
        });

        return chartData;
    }, [transactionData, startDate, endDate]);

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 w-48 bg-muted rounded" />
                    <div className="h-100 bg-muted rounded" />
                </div>
            </Card>
        );
    }

    if (chartData.length === 0) {
        return (
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Transaction Trends</h3>
                <div className="h-100 flex items-center justify-center text-muted-foreground">No data available</div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Transaction Trends Over Time</h3>
            <ChartContainer config={chartConfig} className="h-100">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={(value) => `${formatCurrency(value)}`} />
                    <ChartTooltip
                        content={<ChartTooltipContent 
                            formatter={(value, name) => [
                                // chartConfig[name as keyof typeof chartConfig]?.label || name,
                                // `${formatCurrency(Number(value))}`,
                                `${chartConfig[name as keyof typeof chartConfig]?.label || name}: ${formatCurrency(Number(value))}`,
                            ]} 
                        />}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="income" stroke={chartConfig.income.color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="expense" stroke={chartConfig.expense.color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="balance" stroke={chartConfig.balance.color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
            </ChartContainer>
        </Card>
    );
}
