import { tool } from 'ai';
import { z } from 'zod';
import { userService } from '@/services/users.services';
import { walletService } from '@/services/wallets.services';
import { categoryService } from '@/services/categories.services';
import { transactionService } from '@/services/transactions.services';
import { executeToolSafely } from '../utils/format-response';

/**
 * Get user statistics (wallet count, transaction count, category count)
 */
export const getUserStats = tool({
    description: 'Get overview statistics for the user, including total number of wallets, transactions, and custom categories they have created. Useful for dashboard summaries.',
    inputSchema: z.object({
        userId: z.uuid().describe('The authenticated user ID'),
    }),
    execute: async ({ userId }) => {
        return executeToolSafely(async () => {
            const stats = await userService.getUserStats(userId);
            return stats;
        });
    },
});

/**
 * Get user profile information
 */
export const getUserProfile = tool({
    description: 'Get detailed user profile information including all wallets and counts of related entities. Useful for user account overview.',
    inputSchema: z.object({
        userId: z.uuid().describe('The authenticated user ID'),
    }),
    execute: async ({ userId }) => {
        return executeToolSafely(async () => {
            const profile = await userService.getUserById(userId);

            if (!profile) {
                throw new Error(`User with ID ${userId} not found`);
            }

            return profile;
        });
    },
});

/**
 * Check if a wallet exists
 */
export const walletExists = tool({
    description: 'Check if a wallet with the given ID exists in the system. Returns boolean result. Useful for validating wallet references.',
    inputSchema: z.object({
        walletId: z.uuid().describe('The wallet ID to check'),
    }),
    execute: async ({ walletId }) => {
        return executeToolSafely(async () => {
            const exists = await walletService.walletExists(walletId);
            return {
                walletId,
                exists,
            };
        });
    },
});

/**
 * Check if a category exists
 */
export const categoryExists = tool({
    description: 'Check if a category with the given ID exists in the system. Returns boolean result. Useful for validating category references.',
    inputSchema: z.object({
        categoryId: z.uuid().describe('The category ID to check'),
    }),
    execute: async ({ categoryId }) => {
        return executeToolSafely(async () => {
            const exists = await categoryService.categoryExists(categoryId);
            return {
                categoryId,
                exists,
            };
        });
    },
});

/**
 * Check if a transaction exists
 */
export const transactionExists = tool({
    description: 'Check if a transaction with the given ID exists in the system. Returns boolean result. Useful for validating transaction references.',
    inputSchema: z.object({
        transactionId: z.uuid().describe('The transaction ID to check'),
    }),
    execute: async ({ transactionId }) => {
        return executeToolSafely(async () => {
            const exists = await transactionService.transactionExists(transactionId);
            return {
                transactionId,
                exists,
            };
        });
    },
});

/**
 * Get id of the authenticated user
 */
export const getAuthenticatedUserId = tool({
    description: 'Retrieve the ID of the authenticated user. Useful for confirming user identity in multi-user scenarios.',
    inputSchema: z.object({}),
    execute: async () => {
        return executeToolSafely(async () => {
            const { id: userId } = await userService.getLoggedUser();
            return { userId };
        });
    },
});
