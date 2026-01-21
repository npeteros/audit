import { z } from 'zod';

export const AddUserSchema = z.object({
    email: z
        .email({
            error: (issue) => (issue.input === undefined ? 'Email is required' : 'Invalid email format'),
        })
        .max(255),
});

export const EditUserSchema = AddUserSchema.extend({
    id: z.uuid(),
});

export const DeleteUserSchema = z.object({
    id: z.uuid(),
});

export type AddUserInput = z.infer<typeof AddUserSchema>;
export type EditUserInput = z.infer<typeof EditUserSchema>;
export type DeleteUserInput = z.infer<typeof DeleteUserSchema>;

// Return types
import type { User, Wallet } from '@/lib/prisma/generated/client';

export type UserResponse = User;

export type UserWithDetailsResponse = User & {
    wallets: Wallet[];
    _count: {
        wallets: number;
        transactions: number;
        categories: number;
    };
};

export type UserStatsResponse = {
    wallets: number;
    transactions: number;
    categories: number;
};
