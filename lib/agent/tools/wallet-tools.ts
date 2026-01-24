import { tool } from 'ai';
import { z } from 'zod';
import { walletService } from '@/services/wallets.services';
import { executeToolSafely, formatTransactionAmount } from '../utils/format-response';

/**
 * Get all wallets for the user with calculated balances
 */
export const getWallets = tool({
    description: 'Retrieve all wallets belonging to the user with their current balances (income, expense, and total balance). Use this to get an overview of all user wallets.',
    inputSchema: z.object({
        userId: z.uuid().describe('The authenticated user ID'),
        startDate: z.string().datetime().optional().describe('Optional start date to calculate balances from (ISO format)'),
        endDate: z.string().datetime().optional().describe('Optional end date to calculate balances to (ISO format)'),
    }),
    execute: async ({ userId, startDate, endDate }) => {
        return executeToolSafely(async () => {
            const wallets = await walletService.getWallets({
                userId,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            });

            return wallets.map((wallet) => ({
                ...wallet,
                balance: formatTransactionAmount(wallet.balance),
                income: formatTransactionAmount(wallet.income),
                expense: formatTransactionAmount(wallet.expense),
            }));
        });
    },
});

/**
 * Get paginated wallets with search capability
 */
export const getWalletsPaginated = tool({
    description:
        'Retrieve a paginated list of wallets with search capability. Includes transaction counts and balance details. Use when user wants to search for specific wallets or needs pagination.',
    inputSchema: z.object({
        userId: z.uuid().describe('The authenticated user ID'),
        search: z.string().optional().describe('Search term to filter wallets by name'),
        page: z.number().int().positive().default(1).describe('Page number (default: 1)'),
        pageSize: z.number().int().positive().default(20).describe('Items per page (default: 20)'),
    }),
    execute: async ({ userId, search, page, pageSize }) => {
        return executeToolSafely(async () => {
            const result = await walletService.getWalletsByUserId(userId, search, page, pageSize);

            const formattedData = result.data.map((wallet) => ({
                ...wallet,
                balance: formatTransactionAmount(wallet.balance),
                income: formatTransactionAmount(wallet.income),
                expense: formatTransactionAmount(wallet.expense),
            }));

            return {
                ...result,
                data: formattedData,
            };
        });
    },
});

/**
 * Get detailed information about a specific wallet
 */
export const getWalletById = tool({
    description: 'Retrieve detailed information about a specific wallet by ID, including user details, transaction count, and calculated balances.',
    inputSchema: z.object({
        walletId: z.uuid().describe('The wallet ID to retrieve'),
    }),
    execute: async ({ walletId }) => {
        return executeToolSafely(async () => {
            const wallet = await walletService.getWalletById(walletId);

            if (!wallet) {
                throw new Error(`Wallet with ID ${walletId} not found`);
            }

            return {
                ...wallet,
                balance: formatTransactionAmount(wallet.balance),
                income: formatTransactionAmount(wallet.income),
                expense: formatTransactionAmount(wallet.expense),
            };
        });
    },
});

/**
 * Get the current balance of a specific wallet
 */
export const getWalletBalance = tool({
    description: "Get the current balance of a specific wallet. Returns just the balance amount. Use when user asks about a specific wallet's balance.",
    inputSchema: z.object({
        walletId: z.uuid().describe('The wallet ID to get balance for'),
    }),
    execute: async ({ walletId }) => {
        return executeToolSafely(async () => {
            const balance = await walletService.getWalletBalance(walletId);

            return {
                walletId,
                balance: formatTransactionAmount(balance),
            };
        });
    },
});
