'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Card } from '@/components/ui/card';
import { useWallets } from '@/lib/api/wallets.api';
import { useUser } from '@/lib/api/users.api';
import { getLast30Days } from '@/lib/utils';
import { Filter, X } from 'lucide-react';

export function ReportFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: userData } = useUser();
    const { id: userId } = userData?.user || {};

    // Get current filter values from URL
    const walletId = searchParams.get('walletId') || undefined;
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    // Parse dates
    const defaultDateRange = getLast30Days();
    const startDate = fromParam ? new Date(fromParam) : defaultDateRange.from;
    const endDate = toParam ? new Date(toParam) : defaultDateRange.to;

    // Fetch wallets for filter dropdown
    const { data: walletsData } = useWallets(userId);
    const wallets = walletsData?.data || [];

    // Handle filter changes
    const updateFilters = (updates: Record<string, string | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        router.push(`?${params.toString()}`);
    };

    const handleWalletChange = (value: string) => {
        updateFilters({ walletId: value === 'all' ? undefined : value });
    };

    const handleStartDateChange = (date: Date | undefined) => {
        updateFilters({ from: date?.toISOString() });
    };

    const handleEndDateChange = (date: Date | undefined) => {
        updateFilters({ to: date?.toISOString() });
    };

    const handleClearFilters = () => {
        const defaultRange = getLast30Days();
        if (defaultRange.from && defaultRange.to) {
            router.push(`?from=${defaultRange.from.toISOString()}&to=${defaultRange.to.toISOString()}`);
        }
    };

    const hasFilters = walletId;

    return (
        <Card className="p-4 mb-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Filters</h3>
                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="ml-auto h-8 px-2 lg:px-3">
                            Clear
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Date Range From */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">From Date</label>
                        <DatePicker date={startDate} onDateChange={handleStartDateChange} placeholder="Select start date" />
                    </div>

                    {/* Date Range To */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">To Date</label>
                        <DatePicker date={endDate} onDateChange={handleEndDateChange} placeholder="Select end date" />
                    </div>

                    {/* Wallet Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Wallet</label>
                        <select
                            value={walletId || 'all'}
                            onChange={(e) => handleWalletChange(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="all">All Wallets</option>
                            {wallets.map((wallet) => (
                                <option key={wallet.id} value={wallet.id}>
                                    {wallet.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </Card>
    );
}
