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
import { useBulkDeleteWallets } from '@/lib/api/wallets.api';
import { useUser } from '@/components/providers/user-provider';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface BulkDeleteDialogProps {
    selectedIds: Set<string>;
    onSuccess: () => void;
}

export function BulkDeleteDialog({ selectedIds, onSuccess }: BulkDeleteDialogProps) {
    const [open, setOpen] = React.useState(false);
    const { userId } = useUser();
    const bulkDeleteMutation = useBulkDeleteWallets();

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

            toast.success(`Successfully deleted ${result.count} wallet${result.count !== 1 ? 's' : ''}`);
            onSuccess();
            setOpen(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete wallets');
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
                    <AlertDialogTitle>Delete Wallets</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete {count} wallet{count !== 1 ? 's' : ''}? This action cannot be undone and will permanently remove the selected wallets from
                        the database. Note: Wallets with existing transactions cannot be deleted.
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
