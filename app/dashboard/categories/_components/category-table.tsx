'use client';

import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategoryIcon } from '@/components/shared/category-icon';
import { DeleteDialog } from './delete-dialog';
import { formatCurrency } from '@/lib/utils';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { CategoryWithTransactionCount } from '@/types/categories.types';

interface CategoryTableProps {
    categories: CategoryWithTransactionCount[];
    selectedIds: Set<string>;
    onSelectAll: (checked: boolean) => void;
    onSelectRow: (id: string, checked: boolean) => void;
    onEdit: (category: CategoryWithTransactionCount) => void;
    onDelete: (id: string) => void;
}

export function CategoryTable({ categories, selectedIds, onSelectAll, onSelectRow, onEdit, onDelete }: CategoryTableProps) {
    const userCategories = categories.filter((c) => c.scope === 'USER');
    const allSelected = userCategories.length > 0 && userCategories.every((c) => selectedIds.has(c.id));
    const someSelected = userCategories.some((c) => selectedIds.has(c.id)) && !allSelected;

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [categoryToDelete, setCategoryToDelete] = React.useState<CategoryWithTransactionCount | null>(null);

    const handleDeleteClick = (category: CategoryWithTransactionCount) => {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (categoryToDelete) {
            onDelete(categoryToDelete.id);
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
        }
    };

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12.5">
                            <Checkbox
                                checked={allSelected}
                                onCheckedChange={onSelectAll}
                                aria-label="Select all"
                                className="data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
                                {...(someSelected && { 'data-state': 'indeterminate' })}
                            />
                        </TableHead>
                        <TableHead>Icon</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Scope</TableHead>
                        <TableHead className="text-right">Total Income</TableHead>
                        <TableHead className="text-right">Total Expense</TableHead>
                        <TableHead className="text-right">Transactions</TableHead>
                        <TableHead className="w-17.5"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {/* user-scoped categories first */}
                    {categories
                        .sort((a, b) => b.scope.localeCompare(a.scope))
                        .map((category) => (
                            <TableRow key={category.id}>
                                <TableCell>
                                    {category.scope === 'USER' ? (
                                        <Checkbox
                                            checked={selectedIds.has(category.id)}
                                            onCheckedChange={(checked) => onSelectRow(category.id, checked as boolean)}
                                            aria-label={`Select category ${category.id}`}
                                        />
                                    ) : null}
                                </TableCell>
                                <TableCell>
                                    <CategoryIcon name={category.icon} size={24} />
                                </TableCell>
                                <TableCell className="font-medium">{category.name}</TableCell>
                                <TableCell>
                                    <Badge variant={category.type === 'INCOME' ? 'default' : 'secondary'}>{category.type === 'INCOME' ? 'Income' : 'Expense'}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{category.scope === 'GLOBAL' ? 'Global' : 'User'}</Badge>
                                </TableCell>
                                <TableCell className="text-right font-semibold text-green-600">
                                    {category.type === 'INCOME' ? formatCurrency(category.totalIncome || 0) : '—'}
                                </TableCell>
                                <TableCell className="text-right font-semibold text-red-600">
                                    {category.type === 'EXPENSE' ? formatCurrency(category.totalExpense || 0) : '—'}
                                </TableCell>
                                <TableCell className="text-right font-medium">{category._count?.transactions || 0}</TableCell>
                                <TableCell>
                                    {category.scope === 'USER' ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(category)}>
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteClick(category)} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : null}
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>

            <DeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteConfirm} categoryName={categoryToDelete?.name || ''} />
        </div>
    );
}
