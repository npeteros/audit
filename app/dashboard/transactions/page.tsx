'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { useUser } from '@/components/providers/user-provider';
import { useTransactions } from '@/lib/api/transactions.api';
import { useDeleteTransaction } from '@/lib/api/transactions.api';
import { TransactionFilters } from './_components/transaction-filters';
import { TransactionTable } from './_components/transaction-table';
import { TransactionForm } from './_components/transaction-form';
import { BulkDeleteDialog } from './_components/bulk-delete-dialog';
import { Pagination } from './_components/pagination';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getLast30Days } from '@/lib/utils';
import type { TransactionWithDetailsResponse } from '@/types/transactions.types';
import type { TransactionType } from '@/lib/prisma/generated/client';

function TransactionsPageComponent() {
    const { userId } = useUser();
    const searchParams = useSearchParams();
    const deleteMutation = useDeleteTransaction();

    // Get filter values from URL
    const walletId = searchParams.get('walletId') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const type = searchParams.get('type') as TransactionType | undefined;
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    // Parse dates
    const defaultDateRange = getLast30Days();
    const startDate = fromParam ? new Date(fromParam) : defaultDateRange.from;
    const endDate = toParam ? new Date(toParam) : defaultDateRange.to;

    // Multi-select state (persistent across pages)
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

    // Form state
    const [formOpen, setFormOpen] = React.useState(false);
    const [editingTransaction, setEditingTransaction] = React.useState<TransactionWithDetailsResponse | null>(null);

    // Fetch transactions with pagination
    const { data, isLoading, error } = useTransactions({
        userId: userId || undefined,
        walletId,
        categoryId,
        type,
        startDate,
        endDate,
        page,
        pageSize,
    });

    const transactions = data?.data || [];
    const meta = data?.meta || { page: 1, pageSize: 20, total: 0, totalPages: 0 };

    // Clear selections when filters change
    React.useEffect(() => {
        setSelectedIds(new Set());
    }, [walletId, categoryId, type, fromParam, toParam]);

    // Handle select all (current page only)
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const newSet = new Set(selectedIds);
            transactions.forEach((t) => newSet.add(t.id));
            setSelectedIds(newSet);
        } else {
            const newSet = new Set(selectedIds);
            transactions.forEach((t) => newSet.delete(t.id));
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

    // Handle add transaction
    const handleAdd = () => {
        setEditingTransaction(null);
        setFormOpen(true);
    };

    // Handle edit transaction
    const handleEdit = (transaction: TransactionWithDetailsResponse) => {
        setEditingTransaction(transaction);
        setFormOpen(true);
    };

    // Handle delete transaction
    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id);
            toast.success('Transaction deleted successfully');
            // Remove from selections if present
            const newSet = new Set(selectedIds);
            newSet.delete(id);
            setSelectedIds(newSet);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete transaction');
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
                    <p className="text-lg font-semibold">Error loading transactions</p>
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
                    <h1 className="text-3xl font-bold">Transactions</h1>
                    <p className="text-muted-foreground">Manage your income and expenses</p>
                </div>
                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 ? (
                        <BulkDeleteDialog selectedIds={selectedIds} onSuccess={handleBulkDeleteSuccess} />
                    ) : (
                        <Button onClick={handleAdd} className="flex items-center" size="lg">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Transaction
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <TransactionFilters />

            {/* Table or Loading/Empty State */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: pageSize }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            ) : transactions.length === 0 ? (
                <EmptyState title="No transactions found" description="No transactions match your current filters. Try adjusting your filters or add a new transaction." />
            ) : (
                <>
                    <TransactionTable
                        transactions={transactions}
                        selectedIds={selectedIds}
                        onSelectAll={handleSelectAll}
                        onSelectRow={handleSelectRow}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                    <Pagination meta={meta} disabled={isLoading} />
                </>
            )}

            {/* Transaction Form */}
            <TransactionForm open={formOpen} onOpenChange={setFormOpen} transaction={editingTransaction} defaultDate={startDate} />
        </div>
    );
}

export default function TransactionsPage() {
    return (
        <Suspense
            fallback={
                <div className="p-8 space-y-4">
                    <div className="h-8 w-48 animate-pulse bg-muted rounded" />
                    <div className="h-64 w-full animate-pulse bg-muted rounded" />
                </div>
            }
        >
            <TransactionsPageComponent />
        </Suspense>
    );
}
