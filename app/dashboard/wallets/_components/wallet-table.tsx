'use client';

import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from './delete-dialog';
import { formatCurrency } from '@/lib/utils';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { WalletWithCountResponse } from '@/types/wallets.types';

interface WalletTableProps {
    wallets: WalletWithCountResponse[];
    selectedIds: Set<string>;
    onSelectAll: (checked: boolean) => void;
    onSelectRow: (id: string, checked: boolean) => void;
    onEdit: (wallet: WalletWithCountResponse) => void;
    onDelete: (id: string) => void;
}

export function WalletTable({ wallets, selectedIds, onSelectAll, onSelectRow, onEdit, onDelete }: WalletTableProps) {
    const allSelected = wallets.length > 0 && wallets.every((w) => selectedIds.has(w.id));
    const someSelected = wallets.some((w) => selectedIds.has(w.id)) && !allSelected;

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [walletToDelete, setWalletToDelete] = React.useState<WalletWithCountResponse | null>(null);

    const handleDeleteClick = (wallet: WalletWithCountResponse) => {
        setWalletToDelete(wallet);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (walletToDelete) {
            onDelete(walletToDelete.id);
            setDeleteDialogOpen(false);
            setWalletToDelete(null);
        }
    };

    const getBalanceColor = (balance: number) => {
        if (balance > 0) return 'text-green-600';
        if (balance < 0) return 'text-red-600';
        return 'text-muted-foreground';
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
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead className="text-right">Income</TableHead>
                        <TableHead className="text-right">Expense</TableHead>
                        <TableHead className="text-right">Transactions</TableHead>
                        <TableHead className="w-17.5"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {wallets.map((wallet) => (
                        <TableRow key={wallet.id}>
                            <TableCell>
                                <Checkbox
                                    checked={selectedIds.has(wallet.id)}
                                    onCheckedChange={(checked) => onSelectRow(wallet.id, checked as boolean)}
                                    aria-label={`Select wallet ${wallet.name}`}
                                />
                            </TableCell>
                            <TableCell className="font-medium">{wallet.name}</TableCell>
                            <TableCell className={`text-right font-semibold ${getBalanceColor(wallet.balance)}`}>{formatCurrency(wallet.balance)}</TableCell>
                            <TableCell className="text-right text-green-600">{formatCurrency(wallet.income)}</TableCell>
                            <TableCell className="text-right text-red-600">{formatCurrency(wallet.expense)}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{wallet._count.transactions}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Open menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(wallet)}>
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDeleteClick(wallet)} className="text-destructive focus:text-destructive">
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

            <DeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteConfirm} walletName={walletToDelete?.name || ''} />
        </div>
    );
}
