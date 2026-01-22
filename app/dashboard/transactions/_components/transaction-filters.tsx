'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { useCategories } from '@/lib/api/categories.api';
import { useWallets } from '@/lib/api/wallets.api';
import { useUser } from '@/lib/api/users.api';
import { getLast30Days } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

function TransactionFiltersComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: userData } = useUser();
    const { id: userId } = userData?.user || {};

    // Get current filter values from URL
    const walletId = searchParams.get('walletId') || 'all';
    const categoryId = searchParams.get('categoryId') || 'all';
    const type = searchParams.get('type') || 'all';
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    // Initialize date range from URL or default to last 30 days
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

    // Fetch categories and wallets
    const { data: categories } = useCategories({ userId: userId || undefined });
    const { data: wallets } = useWallets(userId || undefined);

    const updateUrlParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value === 'all') {
            params.delete(key);
        } else {
            params.set(key, value);
        }

        // Reset to page 1 when filters change
        params.set('page', '1');

        router.push(`/dashboard/transactions?${params.toString()}`);
    };

    const handleDateChange = (newDateRange: DateRange | undefined) => {
        setDateRange(newDateRange);

        const params = new URLSearchParams(searchParams.toString());
        if (newDateRange?.from && newDateRange?.to) {
            params.set('from', newDateRange.from.toISOString());
            params.set('to', newDateRange.to.toISOString());
        } else {
            params.delete('from');
            params.delete('to');
        }

        // Reset to page 1 when filters change
        params.set('page', '1');

        router.push(`/dashboard/transactions?${params.toString()}`);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Date Range Picker */}
            <DatePickerWithRange value={dateRange} onChange={handleDateChange} />

            {/* Wallet Filter */}
            <Select value={walletId} onValueChange={(value) => updateUrlParam('walletId', value)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All Wallets" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Wallets</SelectItem>
                    {wallets?.data.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                            {wallet.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryId} onValueChange={(value) => updateUrlParam('categoryId', value)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                            {category.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={type} onValueChange={(value) => updateUrlParam('type', value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

export function TransactionFilters() {
    return (
        <Suspense fallback={<div className="h-10 w-full animate-pulse bg-muted rounded" />}>
            <TransactionFiltersComponent />
        </Suspense>
    );
}
