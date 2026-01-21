'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { CategoryIcon } from '@/components/shared/category-icon';
import { DeleteDialog } from './delete-dialog';
import { formatCurrency } from '@/lib/utils';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { TransactionWithDetailsResponse } from '@/types/transactions.types';

interface TransactionTableProps {
    transactions: TransactionWithDetailsResponse[];
    selectedIds: Set<string>;
    onSelectAll: (checked: boolean) => void;
    onSelectRow: (id: string, checked: boolean) => void;
    onEdit: (transaction: TransactionWithDetailsResponse) => void;
    onDelete: (id: string) => void;
}

export function TransactionTable({ transactions, selectedIds, onSelectAll, onSelectRow, onEdit, onDelete }: TransactionTableProps) {
    const allSelected = transactions.length > 0 && transactions.every((t) => selectedIds.has(t.id));
    const someSelected = transactions.some((t) => selectedIds.has(t.id)) && !allSelected;

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [transactionToDelete, setTransactionToDelete] = React.useState<TransactionWithDetailsResponse | null>(null);

    const handleDeleteClick = (transaction: TransactionWithDetailsResponse) => {
        setTransactionToDelete(transaction);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (transactionToDelete) {
            onDelete(transactionToDelete.id);
            setDeleteDialogOpen(false);
            setTransactionToDelete(null);
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
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Wallet</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-17.5"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                            <TableCell>
                                <Checkbox
                                    checked={selectedIds.has(transaction.id)}
                                    onCheckedChange={(checked) => onSelectRow(transaction.id, checked as boolean)}
                                    aria-label={`Select transaction ${transaction.id}`}
                                />
                            </TableCell>
                            <TableCell className="font-medium">{format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>
                                <div className="max-w-75 truncate">{transaction.description || '—'}</div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <CategoryIcon name={transaction.category.icon} size={16} />
                                    <span>{transaction.category.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>{transaction.wallet.name}</TableCell>
                            <TableCell className={`text-right font-semibold ${transaction.category.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.category.type === 'INCOME' ? '+' : '-'}
                                {formatCurrency(Number(transaction.amount))}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Open menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(transaction)}>
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDeleteClick(transaction)} className="text-destructive focus:text-destructive">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                transactionDescription={transactionToDelete?.description || ''}
            />
        </div>
    );
}
