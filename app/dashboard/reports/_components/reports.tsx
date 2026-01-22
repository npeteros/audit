'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/lib/api/users.api';
import { useTransactionSummary } from '@/lib/api/transactions.api';
import { ReportFilters } from './report-filters';
import { SummaryCards } from './summary-cards';
import { IncomeExpenseChart } from './income-expense-chart';
import { CategoryBreakdownChart } from './category-breakdown-chart';
import { TrendChart } from './trend-chart';
import { getLast30Days } from '@/lib/utils';

function ReportsPageComponent() {
    const { data: userData } = useUser();
    const { id: userId } = userData?.user || {};
    const searchParams = useSearchParams();

    // Get filter values from URL
    const walletId = searchParams.get('walletId') || undefined;
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    // Parse dates
    const defaultDateRange = getLast30Days();
    const startDate = fromParam ? new Date(fromParam) : defaultDateRange.from;
    const endDate = toParam ? new Date(toParam) : defaultDateRange.to;

    // Fetch transaction summary
    const { data: summary, isLoading, error } = useTransactionSummary(userId, walletId, startDate, endDate);

    if (error) {
        return (
            <div className="p-8">
                <div className="text-center text-destructive">
                    <p className="text-lg font-semibold">Error loading reports</p>
                    <p className="text-sm">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Reports</h1>
                <p className="text-muted-foreground">Analyze your financial data with detailed reports and charts</p>
            </div>

            {/* Filters */}
            <ReportFilters />

            {/* Summary Cards */}
            <SummaryCards summary={summary} isLoading={isLoading} />

            {/* Charts Grid */}
            <div className="space-y-6">
                {/* Income vs Expense Bar Chart */}
                <IncomeExpenseChart summary={summary} isLoading={isLoading} />

                {/* Category Breakdown Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CategoryBreakdownChart userId={userId} walletId={walletId} startDate={startDate} endDate={endDate} type="INCOME" />
                    <CategoryBreakdownChart userId={userId} walletId={walletId} startDate={startDate} endDate={endDate} type="EXPENSE" />
                </div>

                {/* Trend Chart */}
                <TrendChart userId={userId} walletId={walletId} startDate={startDate} endDate={endDate} />
            </div>
        </div>
    );
}

export default function ReportsPage() {
    return (
        <Suspense
            fallback={
                <div className="p-8 space-y-4">
                    <div className="h-8 w-48 animate-pulse bg-muted rounded" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full" />
                        ))}
                    </div>
                    <div className="h-96 w-full animate-pulse bg-muted rounded" />
                </div>
            }
        >
            <ReportsPageComponent />
        </Suspense>
    );
}
