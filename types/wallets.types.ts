import { z } from 'zod';

export const AddWalletSchema = z.object({
    userId: z.uuid('Invalid userId format'),
    name: z
        .string({
            error: (issue) => (issue.input === undefined ? 'Name is required' : 'Invalid name value'),
        })
        .min(1)
        .max(255),
});

export const EditWalletSchema = z.object({
    id: z.uuid(),
    name: z
        .string({
            error: (issue) => (issue.input === undefined ? 'Name is required' : 'Invalid name value'),
        })
        .min(1)
        .max(255),
});

export const DeleteWalletSchema = z.object({
    id: z.uuid(),
});

export const BulkDeleteWalletSchema = z.object({
    ids: z.array(z.uuid()).min(1, 'At least one wallet ID is required'),
});

export type AddWalletInput = z.infer<typeof AddWalletSchema>;
export type EditWalletInput = z.infer<typeof EditWalletSchema>;
export type DeleteWalletInput = z.infer<typeof DeleteWalletSchema>;
export type BulkDeleteWalletInput = z.infer<typeof BulkDeleteWalletSchema>;

// Return types
import type { Wallet } from '@/lib/prisma/generated/client';

export type WalletResponse = Wallet & {
    balance: number;
    income: number;
    expense: number;
};

export type WalletWithCountResponse = Wallet & {
    balance: number;
    income: number;
    expense: number;
    _count: {
        transactions: number;
    };
};

export type WalletWithDetailsResponse = Wallet & {
    balance: number;
    income: number;
    expense: number;
    user: {
        id: string;
        email: string;
    };
    _count: {
        transactions: number;
    };
};

export type PaginationMeta = {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};

export type PaginatedWalletResponse = {
    data: WalletWithCountResponse[];
    meta: PaginationMeta;
};
