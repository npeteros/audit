'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { useUser } from '@/lib/api/users.api';
import { useWallets, useDeleteWallet } from '@/lib/api/wallets.api';
import { WalletFilters } from './_components/wallet-filters';
import { WalletTable } from './_components/wallet-table';
import { WalletForm } from './_components/wallet-form';
import { BulkDeleteDialog } from './_components/bulk-delete-dialog';
import { Pagination } from './_components/pagination';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { WalletWithCountResponse } from '@/types/wallets.types';

function WalletsPageComponent() {
    const { data: userData } = useUser();
    const { id: userId } = userData?.user || {};
    const searchParams = useSearchParams();
    const deleteMutation = useDeleteWallet();

    // Get filter values from URL
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    // Multi-select state
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

    // Form state
    const [formOpen, setFormOpen] = React.useState(false);
    const [editingWallet, setEditingWallet] = React.useState<WalletWithCountResponse | null>(null);

    // Fetch wallets with pagination
    const { data, isLoading, error } = useWallets(userId || undefined, search, page, pageSize);

    const wallets = data?.data || [];
    const meta = data?.meta || { page: 1, pageSize: 20, total: 0, totalPages: 0 };

    // Clear selections when filters change
    React.useEffect(() => {
        setSelectedIds(new Set());
    }, [search, page]);

    // Handle select all (current page only)
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const newSet = new Set(selectedIds);
            wallets.forEach((w) => newSet.add(w.id));
            setSelectedIds(newSet);
        } else {
            const newSet = new Set(selectedIds);
            wallets.forEach((w) => newSet.delete(w.id));
            setSelectedIds(newSet);
        }
    };

    // Handle select row
    const handleSelectRow = (id: string, checked: boolean) => {
        const newSet = new Set(selectedIds);
        if (checked) {
            newSet.add(id);
        } else {
            newSet.delete(id);
        }
        setSelectedIds(newSet);
    };

    // Handle add wallet
    const handleAdd = () => {
        setEditingWallet(null);
        setFormOpen(true);
    };

    // Handle edit wallet
    const handleEdit = (wallet: WalletWithCountResponse) => {
        setEditingWallet(wallet);
        setFormOpen(true);
    };

    // Handle delete wallet
    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id);
            toast.success('Wallet deleted successfully');
            // Remove from selections if present
            const newSet = new Set(selectedIds);
            newSet.delete(id);
            setSelectedIds(newSet);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete wallet');
        }
    };

    // Handle bulk delete success
    const handleBulkDeleteSuccess = () => {
        setSelectedIds(new Set());
    };

    if (error) {
        return (
            <div className="p-8">
                <div className="text-center text-destructive">
                    <p className="text-lg font-semibold">Error loading wallets</p>
                    <p className="text-sm">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Wallets</h1>
                    <p className="text-muted-foreground">Manage your wallets and track balances</p>
                </div>
                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 ? (
                        <BulkDeleteDialog selectedIds={selectedIds} onSuccess={handleBulkDeleteSuccess} />
                    ) : (
                        <Button onClick={handleAdd} className="flex items-center" size="lg">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Wallet
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <WalletFilters />

            {/* Table or Loading/Empty State */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: pageSize }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            ) : wallets.length === 0 ? (
                <EmptyState
                    title="No wallets found"
                    description={search ? 'No wallets match your search. Try adjusting your search term or add a new wallet.' : 'Get started by creating your first wallet.'}
                />
            ) : (
                <>
                    <WalletTable
                        wallets={wallets}
                        selectedIds={selectedIds}
                        onSelectAll={handleSelectAll}
                        onSelectRow={handleSelectRow}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                    <Pagination meta={meta} disabled={isLoading} />
                </>
            )}

            {/* Wallet Form */}
            <WalletForm open={formOpen} onOpenChange={setFormOpen} wallet={editingWallet} />
        </div>
    );
}

export default function WalletsPage() {
    return (
        <Suspense
            fallback={
                <div className="p-8 space-y-4">
                    <div className="h-8 w-48 animate-pulse bg-muted rounded" />
                    <div className="h-64 w-full animate-pulse bg-muted rounded" />
                </div>
            }
        >
            <WalletsPageComponent />
        </Suspense>
    );
}
