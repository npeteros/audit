'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function CategoryFiltersComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get current filter values from URL
    const type = searchParams.get('type') || 'all';

    const updateUrlParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value === 'all') {
            params.delete(key);
        } else {
            params.set(key, value);
        }

        router.push(`/dashboard/categories?${params.toString()}`);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Type Filter */}
            <Select value={type} onValueChange={(value) => updateUrlParam('type', value)}>
                <SelectTrigger className="w-full sm:w-[200px]">
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

export function CategoryFilters() {
    return (
        <Suspense fallback={<div className="h-10 w-full animate-pulse bg-muted rounded" />}>
            <CategoryFiltersComponent />
        </Suspense>
    );
}
