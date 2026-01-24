import { tool } from 'ai';
import { z } from 'zod';
import { transactionService } from '@/services/transactions.services';
import { executeToolSafely, formatTransactionAmount } from '../utils/format-response';

type ToolExecuteParams<T> = {
    [K in keyof T]: T[K];
};

/**
 * Get paginated list of transactions with optional filters
 */
export const getTransactions = tool({
    description: 'Retrieve a paginated list of transactions across all wallets for the user. Can filter by category, transaction type (INCOME/EXPENSE), and date range.',
    inputSchema: z.object({
        userId: z.uuid().describe('The authenticated user ID'),
        categoryId: z.uuid().optional().describe('Filter by specific category ID'),
        type: z.enum(['INCOME', 'EXPENSE']).optional().describe('Filter by transaction type'),
        startDate: z.string().datetime().optional().describe('Start date for date range filter (ISO format)'),
        endDate: z.string().datetime().optional().describe('End date for date range filter (ISO format)'),
        page: z.number().int().positive().default(1).describe('Page number (default: 1)'),
        pageSize: z.number().int().positive().default(10).describe('Items per page (default: 10)'),
    }),
    execute: async ({ userId, categoryId, type, startDate, endDate, page, pageSize }) => {
        return executeToolSafely(async () => {
            const result = await transactionService.getTransactions({
                userId,
                categoryId,
                type,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                page,
                pageSize,
            });

            // Format transaction amounts
            const formattedData = result.data.map((transaction) => ({
                ...transaction,
                amount: formatTransactionAmount(transaction.amount),
            }));

            return {
                ...result,
                data: formattedData,
            };
        });
    },
});

/**
 * Get a single transaction by ID with full details
 */
export const getTransactionById = tool({
    description: 'Retrieve detailed information about a specific transaction by its ID, including user, wallet, and category details.',
    inputSchema: z.object({
        transactionId: z.uuid().describe('The transaction ID to retrieve'),
    }),
    execute: async ({ transactionId }) => {
        return executeToolSafely(async () => {
            const transaction = await transactionService.getTransactionById(transactionId);

            if (!transaction) {
                throw new Error(`Transaction with ID ${transactionId} not found`);
            }

            return {
                ...transaction,
                amount: formatTransactionAmount(transaction.amount),
            };
        });
    },
});

/**
 * Get recent transactions for the user
 */
export const getRecentTransactions = tool({
    description: 'Get the most recent transactions for the user, ordered by transaction date (newest first). Useful for showing recent activity.',
    inputSchema: z.object({
        userId: z.uuid().describe('The authenticated user ID'),
        limit: z.number().int().positive().default(10).describe('Number of transactions to return (default: 10)'),
    }),
    execute: async ({ userId, limit }) => {
        return executeToolSafely(async () => {
            const transactions = await transactionService.getRecentTransactions(userId, limit);

            return transactions.map((transaction) => ({
                ...transaction,
                amount: formatTransactionAmount(transaction.amount),
            }));
        });
    },
});

/**
 * Get transactions within a specific date range
 */
export const getTransactionsByDateRange = tool({
    description: 'Retrieve all transactions across all wallets within a specific date range. Use this for analyzing spending/income over time periods.',
    inputSchema: z.object({
        userId: z.uuid().describe('The authenticated user ID'),
        startDate: z.string().datetime().describe('Start date of the range (ISO format)'),
        endDate: z.string().datetime().describe('End date of the range (ISO format)'),
    }),
    execute: async ({ userId, startDate, endDate }) => {
        return executeToolSafely(async () => {
            const transactions = await transactionService.getTransactionsByDateRange(userId, new Date(startDate), new Date(endDate));

            return transactions.map((transaction) => ({
                ...transaction,
                amount: formatTransactionAmount(transaction.amount),
            }));
        });
    },
});

/**
 * Get transaction summary (income, expense, balance, count)
 */
export const getTransactionSummary = tool({
    description:
        'Get aggregated financial summary across all wallets including total income, total expenses, net balance, and transaction count. Can filter by date range. Essential for financial overviews and reporting.',
    inputSchema: z.object({
        userId: z.uuid().describe('The authenticated user ID'),
        startDate: z.string().datetime().optional().describe('Start date for filtering (ISO format)'),
        endDate: z.string().datetime().optional().describe('End date for filtering (ISO format)'),
    }),
    execute: async ({ userId, startDate, endDate }) => {
        console.log('getTransactionSummary called with:', { userId, startDate, endDate });
        return executeToolSafely(async () => {
            const summary = await transactionService.getTransactionSummary(userId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);

            return {
                income: formatTransactionAmount(summary.income),
                expense: formatTransactionAmount(summary.expense),
                balance: formatTransactionAmount(summary.balance),
                count: summary.count,
            };
        });
    },
});
