'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

function WalletFiltersComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchValue, setSearchValue] = React.useState(searchParams.get('search') || '');

    // Debounce search input
    React.useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());

            if (searchValue) {
                params.set('search', searchValue);
            } else {
                params.delete('search');
            }

            // Reset to page 1 when search changes
            params.set('page', '1');

            router.push(`/dashboard/wallets?${params.toString()}`);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchValue, router]);

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Filter */}
            <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search wallets..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} className="pl-9" />
            </div>
        </div>
    );
}

export function WalletFilters() {
    return (
        <Suspense fallback={<div className="h-10 w-full animate-pulse bg-muted rounded" />}>
            <WalletFiltersComponent />
        </Suspense>
    );
}
