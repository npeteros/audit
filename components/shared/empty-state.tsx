import * as React from 'react';
import { FileQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center', className)}>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">{icon || <FileQuestion className="h-10 w-10 text-muted-foreground" />}</div>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            {description && <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
