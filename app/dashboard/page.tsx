'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { type DateRange } from 'react-day-picker';
import { useUser } from '@/components/providers/user-provider';
import { useTransactionSummary, useTransactions } from '@/lib/api/transactions.api';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, getLast30Days } from '@/lib/utils';
import { TrendingUp, TrendingDown, Activity, ArrowUpCircle, ArrowDownCircle, Inbox } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CategoryIcon } from '@/components/shared/category-icon';

function DashboardPageComponent() {
    const { userId, isLoading: userLoading } = useUser();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get walletId from URL params (for filtering)
    const walletId = searchParams.get('walletId') || undefined;

    // Initialize date range from URL params or default to last 30 days
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const defaultDateRange = getLast30Days();
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => {
        if (fromParam && toParam) {
            return {
                from: new Date(fromParam),
                to: new Date(toParam),
            };
        }
        return defaultDateRange;
    });

    // Fetch transaction summary
    const { data: summary, isLoading: summaryLoading, error: summaryError } = useTransactionSummary(userId!, walletId, dateRange?.from, dateRange?.to);

    // Fetch recent transactions for the table
    const {
        data: transactionsData,
        isLoading: transactionsLoading,
        error: transactionsError,
    } = useTransactions({
        userId: userId!,
        walletId,
        startDate: dateRange?.from,
        endDate: dateRange?.to,
        limit: 10,
    });

    const transactions = transactionsData?.data || [];

    // Handle date range change
    const handleDateChange = (newDateRange: DateRange | undefined) => {
        setDateRange(newDateRange);

        // Update URL params
        const params = new URLSearchParams(searchParams.toString());
        if (newDateRange?.from && newDateRange?.to) {
            params.set('from', newDateRange.from.toISOString());
            params.set('to', newDateRange.to.toISOString());
        } else {
            params.delete('from');
            params.delete('to');
        }

        router.push(`/dashboard?${params.toString()}`);
    };

    // Show error toasts
    React.useEffect(() => {
        if (summaryError) {
            toast.error('Failed to load summary data', {
                description: summaryError.message,
            });
        }
        if (transactionsError) {
            toast.error('Failed to load transactions', {
                description: transactionsError.message,
            });
        }
    }, [summaryError, transactionsError]);

    // Loading state
    if (userLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            </div>
        );
    }

    if (!userId) {
        return <EmptyState title="Not Authenticated" description="Please log in to view your dashboard." />;
    }

    return (
        <div className="space-y-6">
            {/* Header with Date Range Picker */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">{walletId ? 'Viewing filtered wallet data' : 'Overview of your financial activity'}</p>
                </div>
                <DatePickerWithRange value={dateRange} onChange={handleDateChange} placeholder="Select date range" className="max-w-64 min-w-fit" />
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Net Balance Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                        {summary && summary.balance >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                    </CardHeader>
                    <CardContent>
                        {summaryLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : summary ? (
                            <>
                                <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(summary.balance)}</div>
                                <p className="text-xs text-muted-foreground">Income - Expenses</p>
                            </>
                        ) : (
                            <div className="text-2xl font-bold text-muted-foreground">{formatCurrency(0)}</div>
                        )}
                    </CardContent>
                </Card>

                {/* Total Income Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                        <ArrowUpCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        {summaryLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : summary ? (
                            <>
                                <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.income)}</div>
                                <p className="text-xs text-muted-foreground">For selected period</p>
                            </>
                        ) : (
                            <div className="text-2xl font-bold text-muted-foreground">{formatCurrency(0)}</div>
                        )}
                    </CardContent>
                </Card>

                {/* Total Expense Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <ArrowDownCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        {summaryLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : summary ? (
                            <>
                                <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.expense)}</div>
                                <p className="text-xs text-muted-foreground">For selected period</p>
                            </>
                        ) : (
                            <div className="text-2xl font-bold text-muted-foreground">{formatCurrency(0)}</div>
                        )}
                    </CardContent>
                </Card>

                {/* Transaction Count Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {summaryLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : summary ? (
                            <>
                                <div className="text-2xl font-bold">{summary.count}</div>
                                <p className="text-xs text-muted-foreground">For selected period</p>
                            </>
                        ) : (
                            <div className="text-2xl font-bold text-muted-foreground">0</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardTitle className="text-xs text-muted-foreground">For selected period</CardTitle>
                </CardHeader>
                <CardContent>
                    {transactionsLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : transactions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Wallet</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="font-medium">{format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}</TableCell>
                                        <TableCell>{transaction.description}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <CategoryIcon
                                                    name={transaction.category.icon}
                                                    size={16}
                                                    className={transaction.category.type === 'EXPENSE' ? 'text-red-500' : 'text-green-500'}
                                                />
                                                <span>{transaction.category.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{transaction.wallet.name}</TableCell>
                                        <TableCell className={`text-right font-medium ${transaction.category.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                            {transaction.category.type === 'INCOME' ? '+' : '-'}
                                            {formatCurrency(Number(transaction.amount))}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <EmptyState
                            icon={<Inbox className="h-10 w-10 text-muted-foreground" />}
                            title="No transactions found"
                            description="There are no transactions for the selected date range and filters."
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense
            fallback={
                <div className="space-y-6">
                    <div className="h-8 w-48 animate-pulse bg-muted rounded" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 animate-pulse bg-muted rounded" />
                        ))}
                    </div>
                </div>
            }
        >
            <DashboardPageComponent />
        </Suspense>
    );
}
