'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { useUser } from '@/components/providers/user-provider';
import { useCategories } from '@/lib/api/categories.api';
import { useDeleteCategory } from '@/lib/api/categories.api';
import { CategoryFilters } from './_components/category-filters';
import { CategoryTable } from './_components/category-table';
import { CategoryForm } from './_components/category-form';
import { BulkDeleteDialog } from './_components/bulk-delete-dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { CategoryWithTransactionCount } from '@/types/categories.types';
import type { TransactionType } from '@/lib/prisma/generated/client';

function CategoriesPageComponent() {
    const { userId } = useUser();
    const searchParams = useSearchParams();
    const deleteMutation = useDeleteCategory();

    // Get filter values from URL
    const type = searchParams.get('type') as TransactionType | undefined;

    // Multi-select state
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

    // Form state
    const [formOpen, setFormOpen] = React.useState(false);
    const [editingCategory, setEditingCategory] = React.useState<CategoryWithTransactionCount | null>(null);

    // Fetch categories with filters
    const {
        data: categories,
        isLoading,
        error,
    } = useCategories({
        userId: userId || undefined,
        type,
    });

    const categoriesList = categories || [];

    // Clear selections when filters change
    React.useEffect(() => {
        setSelectedIds(new Set());
    }, [type]);

    // Handle select all (only user-specific categories)
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const newSet = new Set(selectedIds);
            categoriesList.filter((c) => c.scope === 'USER').forEach((c) => newSet.add(c.id));
            setSelectedIds(newSet);
        } else {
            const newSet = new Set(selectedIds);
            categoriesList.filter((c) => c.scope === 'USER').forEach((c) => newSet.delete(c.id));
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

    // Handle add category
    const handleAdd = () => {
        setEditingCategory(null);
        setFormOpen(true);
    };

    // Handle edit category
    const handleEdit = (category: CategoryWithTransactionCount) => {
        setEditingCategory(category);
        setFormOpen(true);
    };

    // Handle delete category
    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id);
            toast.success('Category deleted successfully');
            // Remove from selections if present
            const newSet = new Set(selectedIds);
            newSet.delete(id);
            setSelectedIds(newSet);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete category');
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
                    <p className="text-lg font-semibold">Error loading categories</p>
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
                    <h1 className="text-3xl font-bold">Categories</h1>
                    <p className="text-muted-foreground">Manage your income and expense categories</p>
                </div>
                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 ? (
                        <BulkDeleteDialog selectedIds={selectedIds} onSuccess={handleBulkDeleteSuccess} />
                    ) : (
                        <Button onClick={handleAdd} className="flex items-center" size="lg">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Category
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <CategoryFilters />

            {/* Table or Loading/Empty State */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            ) : categoriesList.length === 0 ? (
                <EmptyState title="No categories found" description="No categories match your current filters. Try adjusting your filters or add a new category." />
            ) : (
                <CategoryTable
                    categories={categoriesList}
                    selectedIds={selectedIds}
                    onSelectAll={handleSelectAll}
                    onSelectRow={handleSelectRow}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {/* Category Form */}
            <CategoryForm open={formOpen} onOpenChange={setFormOpen} category={editingCategory} />
        </div>
    );
}

export default function CategoriesPage() {
    return (
        <Suspense
            fallback={
                <div className="p-8 space-y-4">
                    <div className="h-8 w-48 animate-pulse bg-muted rounded" />
                    <div className="h-64 w-full animate-pulse bg-muted rounded" />
                </div>
            }
        >
            <CategoriesPageComponent />
        </Suspense>
    );
}
