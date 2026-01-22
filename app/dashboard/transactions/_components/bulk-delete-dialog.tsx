'use client';

import * as React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useBulkDeleteTransactions } from '@/lib/api/transactions.api';
import { useUser } from '@/lib/api/users.api';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface BulkDeleteDialogProps {
    selectedIds: Set<string>;
    onSuccess: () => void;
}

export function BulkDeleteDialog({ selectedIds, onSuccess }: BulkDeleteDialogProps) {
    const [open, setOpen] = React.useState(false);
    const { data: userData } = useUser();
    const { id: userId } = userData?.user || {};
    const bulkDeleteMutation = useBulkDeleteTransactions();

    const handleDelete = async () => {
        if (!userId) {
            toast.error('User not authenticated');
            return;
        }

        try {
            const result = await bulkDeleteMutation.mutateAsync({
                ids: Array.from(selectedIds),
                userId,
            });

            toast.success(`Successfully deleted ${result.count} transaction${result.count !== 1 ? 's' : ''}`);
            onSuccess();
            setOpen(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete transactions');
        }
    };

    const count = selectedIds.size;

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center" size="lg" disabled={count === 0}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected ({count})
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Transactions</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete {count} transaction{count !== 1 ? 's' : ''}? This action cannot be undone and will permanently remove the selected
                        transactions from the database.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={bulkDeleteMutation.isPending} className="bg-destructive hover:bg-destructive/90">
                        {bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
