import { z } from 'zod';

export const AddTransactionSchema = z.object({
    userId: z.uuid({
        error: (issue) => (issue.input === undefined ? 'User ID is required' : 'Invalid userId format'),
    }),
    walletId: z.uuid({
        error: (issue) => (issue.input === undefined ? 'Wallet ID is required' : 'Invalid walletId format'),
    }),
    categoryId: z.uuid({
        error: (issue) => (issue.input === undefined ? 'Category ID is required' : 'Invalid categoryId format'),
    }),
    transactionDate: z.coerce.date({
        error: (issue) => (issue.input === undefined ? 'Transaction date is required' : 'Invalid transaction date'),
    }),
    description: z.string().max(500).optional(),
    amount: z
        .number({
            error: (issue) => (issue.input === undefined ? 'Amount is required' : 'Invalid amount value'),
        })
        .or(z.string().regex(/^\d+(\.\d{1,4})?$/))
        .transform((val) => (typeof val === 'string' ? parseFloat(val) : val)),
});

export const EditTransactionSchema = AddTransactionSchema.extend({
    id: z.uuid({
        error: (issue) => (issue.input === undefined ? 'Transaction ID is required' : 'Invalid id format'),
    }),
});

export const DeleteTransactionSchema = z.object({
    id: z.uuid({
        error: (issue) => (issue.input === undefined ? 'Transaction ID is required' : 'Invalid id format'),
    }),
});

export const BulkDeleteTransactionSchema = z.object({
    ids: z.array(z.uuid()).min(1, 'At least one transaction ID is required'),
});

export type AddTransactionInput = z.infer<typeof AddTransactionSchema>;
export type EditTransactionInput = z.infer<typeof EditTransactionSchema>;
export type DeleteTransactionInput = z.infer<typeof DeleteTransactionSchema>;
export type BulkDeleteTransactionInput = z.infer<typeof BulkDeleteTransactionSchema>;

// Return types
import type { Transaction } from '@/lib/prisma/generated/client';

export type TransactionResponse = Transaction;

export type TransactionWithDetailsResponse = Transaction & {
    category: {
        id: string;
        name: string;
        icon: string;
        type: 'INCOME' | 'EXPENSE';
    };
    wallet: {
        id: string;
        name: string;
    };
};

export type TransactionWithFullDetailsResponse = Transaction & {
    user: {
        id: string;
        email: string;
    };
    wallet: {
        id: string;
        name: string;
    };
    category: {
        id: string;
        name: string;
        icon: string;
        type: 'INCOME' | 'EXPENSE';
    };
};

export type TransactionSummaryResponse = {
    income: number;
    expense: number;
    balance: number;
    count: number;
};

export type PaginationMeta = {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};

export type PaginatedTransactionResponse = {
    data: TransactionWithDetailsResponse[];
    meta: PaginationMeta;
};
