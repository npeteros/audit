import { tool } from 'ai';
import { z } from 'zod';
import { categoryService } from '@/services/categories.services';
import { executeToolSafely, formatTransactionAmount } from '../utils/format-response';

/**
 * Get all categories available to the user (global + user-specific)
 */
export const getCategories = tool({
    description:
        'Retrieve all categories available to the user, including both global categories (available to everyone) and user-specific categories. Returns transaction counts and totals for each category. Can filter by transaction type (INCOME/EXPENSE).',
    inputSchema: z.object({
        userId: z.uuid().describe('The authenticated user ID'),
        type: z.enum(['INCOME', 'EXPENSE']).optional().describe('Filter by transaction type'),
    }),
    execute: async ({ userId, type }) => {
        return executeToolSafely(async () => {
            const categories = await categoryService.getCategoriesForUser(userId, type);

            return categories.map((category) => ({
                ...category,
                totalIncome: formatTransactionAmount(category.totalIncome),
                totalExpense: formatTransactionAmount(category.totalExpense),
            }));
        });
    },
});

/**
 * Get categories filtered by scope (GLOBAL or USER)
 */
export const getCategoriesByScope = tool({
    description:
        'Retrieve categories filtered by their scope. GLOBAL scope includes system-wide categories available to all users, while USER scope includes categories created by specific users.',
    inputSchema: z.object({
        scope: z.enum(['GLOBAL', 'USER']).describe('The category scope (GLOBAL or USER)'),
        ownerId: z.uuid().optional().describe('The owner ID (required for USER scope categories)'),
        type: z.enum(['INCOME', 'EXPENSE']).optional().describe('Filter by transaction type'),
    }),
    execute: async ({ scope, ownerId, type }) => {
        return executeToolSafely(async () => {
            const categories = await categoryService.getCategories({
                scope,
                ownerId,
                type,
            });

            return categories.map((category) => ({
                ...category,
                totalIncome: formatTransactionAmount(category.totalIncome),
                totalExpense: formatTransactionAmount(category.totalExpense),
            }));
        });
    },
});

/**
 * Get detailed information about a specific category
 */
export const getCategoryById = tool({
    description: 'Retrieve detailed information about a specific category by its ID, including user/owner details.',
    inputSchema: z.object({
        categoryId: z.uuid().describe('The category ID to retrieve'),
    }),
    execute: async ({ categoryId }) => {
        return executeToolSafely(async () => {
            const category = await categoryService.getCategoryById(categoryId);

            if (!category) {
                throw new Error(`Category with ID ${categoryId} not found`);
            }

            return category;
        });
    },
});

/**
 * Get count of categories by type
 */
export const getCategoryCountByType = tool({
    description: 'Get a count of how many categories exist for each transaction type (INCOME and EXPENSE), including total count. Useful for understanding category distribution.',
    inputSchema: z.object({
        userId: z.uuid().describe('The authenticated user ID'),
    }),
    execute: async ({ userId }) => {
        return executeToolSafely(async () => {
            const counts = await categoryService.getCategoryCountByType(userId);

            return counts;
        });
    },
});
