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
import { useBulkDeleteCategories } from '@/lib/api/categories.api';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface BulkDeleteDialogProps {
    selectedIds: Set<string>;
    onSuccess: () => void;
}

export function BulkDeleteDialog({ selectedIds, onSuccess }: BulkDeleteDialogProps) {
    const [open, setOpen] = React.useState(false);
    const bulkDeleteMutation = useBulkDeleteCategories();

    const handleDelete = async () => {
        try {
            const result = await bulkDeleteMutation.mutateAsync(Array.from(selectedIds));

            toast.success(`Successfully deleted ${result.count} categor${result.count !== 1 ? 'ies' : 'y'}`);
            onSuccess();
            setOpen(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete categories');
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
                    <AlertDialogTitle>Delete Categories</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete {count} categor{count !== 1 ? 'ies' : 'y'}? This action cannot be undone and will permanently remove the selected categories
                        from the database.
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
