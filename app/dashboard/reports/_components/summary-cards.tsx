'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react';
import type { TransactionSummaryResponse } from '@/types/transactions.types';

interface SummaryCardsProps {
    summary?: TransactionSummaryResponse;
    isLoading?: boolean;
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="p-6">
                        <div className="animate-pulse space-y-2">
                            <div className="h-4 w-20 bg-muted rounded" />
                            <div className="h-8 w-32 bg-muted rounded" />
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    const income = summary?.income || 0;
    const expense = summary?.expense || 0;
    const balance = summary?.balance || 0;
    const count = summary?.count || 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Net Balance */}
            <Card className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Net Balance</p>
                        <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center ${
                            balance >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
                        }`}
                    >
                        <Wallet className={`h-6 w-6 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                </div>
            </Card>
            
            {/* Total Income */}
            <Card className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                        <p className="text-2xl font-bold text-green-600">${income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                </div>
            </Card>

            {/* Total Expense */}
            <Card className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Expense</p>
                        <p className="text-2xl font-bold text-red-600">${expense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <TrendingDown className="h-6 w-6 text-red-600" />
                    </div>
                </div>
            </Card>

            {/* Transaction Count */}
            <Card className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                        <p className="text-2xl font-bold">{count.toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Activity className="h-6 w-6 text-blue-600" />
                    </div>
                </div>
            </Card>
        </div>
    );
}
