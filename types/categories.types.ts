import { z } from 'zod';

export const AddCategorySchema = z.object({
    scope: z
        .enum(['GLOBAL', 'USER'], {
            error: (issue) => (issue.input === undefined ? 'Scope is required' : 'Invalid scope value'),
        })
        .default('GLOBAL'),
    ownerId: z.uuid('Invalid ownerId format').optional(),
    name: z
        .string({
            error: (issue) => (issue.input === undefined ? 'Name is required' : 'Invalid name value'),
        })
        .min(1)
        .max(100),
    icon: z
        .string({
            error: (issue) => (issue.input === undefined ? 'Icon is required' : 'Invalid icon value'),
        })
        .min(1)
        .max(100),
    type: z.enum(['INCOME', 'EXPENSE'], {
        error: (issue) => (issue.input === undefined ? 'Type is required' : 'Invalid type value'),
    }),
});

export const EditCategorySchema = AddCategorySchema.extend({
    id: z.uuid(),
});

export const DeleteCategorySchema = z.object({
    id: z.uuid(),
});

export type AddCategoryInput = z.infer<typeof AddCategorySchema>;
export type EditCategoryInput = z.infer<typeof EditCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof DeleteCategorySchema>;

// Return types
import type { Category } from '@/lib/prisma/generated/client';

export type CategoryResponse = Category;

export type CategoryWithTransactionCount = Category & {
    _count?: {
        transactions: number;
    };
    totalIncome?: number;
    totalExpense?: number;
};

export type CategoryWithUserResponse = Category & {
    user: {
        id: string;
        email: string;
    } | null;
};

export type CategoryCountResponse = {
    income: number;
    expense: number;
    total: number;
};
